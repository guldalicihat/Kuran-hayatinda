# -*- coding: utf-8 -*-
"""
Sıradaki onaylı sosyal medya postunu Facebook Sayfası'na paylaşır:
  1. social/posted_log.json'a bakarak henüz paylaşılmamış bir sonraki onaylı postu seçer
  2. Kart görselini render eder (scripts/social/render_card.py)
  3. Facebook Graph API'sine fotoğraf + caption olarak gönderir
  4. social/posted_log.json'a kayıt ekler

Gerekli ortam değişkenleri (GitHub Secrets üzerinden gelir):
  FACEBOOK_PAGE_ID             — paylaşımın yapılacağı Sayfa'nın ID'si
  FACEBOOK_PAGE_ACCESS_TOKEN   — o Sayfa için uzun ömürlü Sayfa Erişim Anahtarı
                                  (pages_manage_posts izniyle alınmış olmalı)

Bu iki değer Meta for Developers üzerinden, sitenin sahibi tarafından alınmalıdır;
bu script onları üretemez, yalnız kullanır.

Kullanım:
  python3 scripts/social/publish_facebook.py            # gerçekten paylaşır (dikey kart)
  python3 scripts/social/publish_facebook.py --dry-run   # paylaşmadan sadece üretir/gösterir
  python3 scripts/social/publish_facebook.py --square    # dikey yerine eski kare kart kullanır
"""
import datetime
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_post import build  # noqa: E402
from pick_next_post import pick_next, load_posted_log, POSTED_LOG  # noqa: E402
from render_card import render as render_card  # noqa: E402

GRAPH_VERSION = 'v21.0'


def log_posted(sure, ayet, platform, extra=None):
    log = load_posted_log()
    entry = {
        "sure": sure, "ayet": ayet, "platform": platform,
        "postedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    if extra:
        entry.update(extra)
    log.append(entry)
    json.dump(log, open(POSTED_LOG, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def main():
    dry_run = '--dry-run' in sys.argv
    story = '--square' not in sys.argv

    post = pick_next('facebook')
    if post is None:
        print('Sırada bekleyen onaylı post yok, çıkılıyor.')
        return 0

    b = build(post)
    caption = b['facebook']
    if not caption:
        print(f"HATA: {post['sure']}:{post['ayet']} için içerik (content/) henüz hazır değil, atlanıyor.", file=sys.stderr)
        return 1

    img_path = f"/tmp/fb_card_{post['sure']}_{post['ayet']}.png"
    render_card(post['soru'], img_path, story=story)
    print(f"Kart üretildi: {img_path}")
    print(f"Caption ({len(caption)} krk):\n{caption}\n")

    if dry_run:
        print("(--dry-run: gerçek paylaşım yapılmadı)")
        return 0

    page_id = os.environ['FACEBOOK_PAGE_ID']
    access_token = os.environ['FACEBOOK_PAGE_ACCESS_TOKEN']

    import requests

    url = f"https://graph.facebook.com/{GRAPH_VERSION}/{page_id}/photos"
    with open(img_path, 'rb') as f:
        resp = requests.post(
            url,
            data={'caption': caption, 'access_token': access_token},
            files={'source': f},
            timeout=60,
        )
    data = resp.json()
    if 'error' in data:
        print(f"HATA (Facebook Graph API): {data['error']}", file=sys.stderr)
        return 1

    post_id = data.get('post_id') or data.get('id')
    permalink = f"https://www.facebook.com/{post_id}" if post_id else None
    print(f"Paylaşıldı: {permalink or data}")

    log_posted(post['sure'], post['ayet'], 'facebook', extra={'postId': post_id, 'url': permalink})
    return 0


if __name__ == '__main__':
    sys.exit(main())

# -*- coding: utf-8 -*-
"""
Sıradaki onaylı sosyal medya postunu Instagram (feed gönderisi) olarak paylaşır:
  1. social/posted_log.json'a bakarak henüz paylaşılmamış bir sonraki onaylı postu seçer
  2. Kart görselini render eder (kare format — feed fotoğrafı için gerekli, 0.8–1.91 en-boy aralığı)
  3. Görseli social/cards/{sure}_{ayet}.jpg olarak depoya commit'leyip push eder
     (Instagram Graph API'si dosya yüklemeyi değil, herkese açık bir URL kabul eder;
     bu yüzden görsel önce GitHub'a, oradan raw.githubusercontent.com üzerinden erişilebilir hale getirilir)
  4. Instagram Graph API ile önce medya container'ı oluşturur, sonra yayınlar
  5. social/posted_log.json'a kayıt ekler

Gerekli ortam değişkenleri (GitHub Secrets üzerinden gelir):
  INSTAGRAM_BUSINESS_ACCOUNT_ID  — Instagram İşletme/Yaratıcı hesabının Graph API ID'si
  INSTAGRAM_ACCESS_TOKEN         — bu hesaba bağlı Sayfa'nın uzun ömürlü erişim anahtarı
                                    (instagram_basic + instagram_content_publish izniyle)

Bu iki değer Meta for Developers üzerinden, sitenin sahibi tarafından alınmalıdır;
bu script onları üretemez, yalnız kullanır.

Not: Bu script yalnızca Instagram FEED gönderisi paylaşır (Story değil); Story için
farklı bir API akışı gerekir ve burada kapsanmamıştır.

Kullanım:
  python3 scripts/social/publish_instagram.py            # gerçekten paylaşır
  python3 scripts/social/publish_instagram.py --dry-run   # paylaşmadan sadece üretir/gösterir
"""
import datetime
import json
import os
import subprocess
import sys
import time

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


def commit_and_push_image(rel_path):
    """Kartı depoya commit'leyip push eder; raw.githubusercontent.com URL'sini döndürür."""
    repo = os.environ.get('GITHUB_REPOSITORY')
    if not repo:
        raise SystemExit('GITHUB_REPOSITORY ortam değişkeni yok — bu script GitHub Actions dışında çalıştırılamaz.')
    branch = os.environ.get('GITHUB_REF_NAME', 'main')

    subprocess.run(['git', 'config', 'user.name', 'kuran-hayatinda-bot'], cwd=ROOT, check=True)
    subprocess.run(['git', 'config', 'user.email', 'actions@github.com'], cwd=ROOT, check=True)
    subprocess.run(['git', 'add', rel_path], cwd=ROOT, check=True)
    subprocess.run(['git', 'commit', '-m', f'Sosyal medya: Instagram kartı ekle ({rel_path}) [otomatik]'], cwd=ROOT, check=True)
    for attempt in range(1, 6):
        result = subprocess.run(['git', 'push'], cwd=ROOT)
        if result.returncode == 0:
            break
        print(f"push reddedildi, rebase edip tekrar deneniyor ({attempt}/5)...")
        subprocess.run(['git', 'fetch', 'origin', branch], cwd=ROOT, check=True)
        subprocess.run(['git', 'rebase', f'origin/{branch}'], cwd=ROOT, check=True)
        time.sleep(2)
    else:
        raise SystemExit('Kart görseli push edilemedi.')

    raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{rel_path}"
    # raw.githubusercontent.com CDN'inin görseli yayınlaması için kısa bir bekleme + doğrulama
    import requests
    for _ in range(6):
        try:
            if requests.head(raw_url, timeout=10).status_code == 200:
                return raw_url
        except requests.RequestException:
            pass
        time.sleep(3)
    return raw_url  # bulunamasa da dene; Instagram tarafı ayrıca hata verecektir


def main():
    dry_run = '--dry-run' in sys.argv

    post = pick_next('instagram')
    if post is None:
        print('Sırada bekleyen onaylı post yok, çıkılıyor.')
        return 0

    b = build(post)
    caption = b['instagram']
    if not caption:
        print(f"HATA: {post['sure']}:{post['ayet']} için içerik (content/) henüz hazır değil, atlanıyor.", file=sys.stderr)
        return 1

    rel_path = f"social/cards/{post['sure']}_{post['ayet']}.png"
    img_path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(img_path), exist_ok=True)
    render_card(post['soru'], img_path, story=False)  # feed için kare (1080x1080)
    print(f"Kart üretildi: {img_path}")
    print(f"Caption ({len(caption)} krk):\n{caption}\n")

    if dry_run:
        print("(--dry-run: gerçek paylaşım yapılmadı, görsel push edilmedi)")
        return 0

    image_url = commit_and_push_image(rel_path)
    print(f"Kart yayında: {image_url}")

    ig_user_id = os.environ['INSTAGRAM_BUSINESS_ACCOUNT_ID']
    access_token = os.environ['INSTAGRAM_ACCESS_TOKEN']

    import requests

    create_resp = requests.post(
        f"https://graph.facebook.com/{GRAPH_VERSION}/{ig_user_id}/media",
        data={'image_url': image_url, 'caption': caption, 'access_token': access_token},
        timeout=60,
    ).json()
    if 'error' in create_resp:
        print(f"HATA (Instagram media create): {create_resp['error']}", file=sys.stderr)
        return 1
    creation_id = create_resp['id']

    publish_resp = requests.post(
        f"https://graph.facebook.com/{GRAPH_VERSION}/{ig_user_id}/media_publish",
        data={'creation_id': creation_id, 'access_token': access_token},
        timeout=60,
    ).json()
    if 'error' in publish_resp:
        print(f"HATA (Instagram media publish): {publish_resp['error']}", file=sys.stderr)
        return 1
    media_id = publish_resp['id']

    permalink = None
    try:
        info = requests.get(
            f"https://graph.facebook.com/{GRAPH_VERSION}/{media_id}",
            params={'fields': 'permalink', 'access_token': access_token},
            timeout=30,
        ).json()
        permalink = info.get('permalink')
    except Exception:
        pass

    print(f"Paylaşıldı: {permalink or media_id}")
    log_posted(post['sure'], post['ayet'], 'instagram', extra={'mediaId': media_id, 'url': permalink})
    return 0


if __name__ == '__main__':
    sys.exit(main())

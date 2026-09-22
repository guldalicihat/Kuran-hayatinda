# -*- coding: utf-8 -*-
"""
Sıradaki onaylı sosyal medya postunu Telegram kanalına (t.me/kuranhayatimda) paylaşır:
  1. social/posted_log.json'a bakarak henüz paylaşılmamış bir sonraki onaylı postu seçer
  2. Kart görselini render eder (scripts/social/render_card.py)
  3. Telegram Bot API ile fotoğraf + metin olarak gönderir.
     Metin, Telegram'ın foto caption sınırı olan 1024 karakteri aşarsa meal ASLA
     kırpılmaz (proje kuralı): foto caption'sız gönderilir, tam metin hemen
     ardından ayrı bir mesaj olarak eklenir.
  4. social/posted_log.json'a kayıt ekler

Gerekli ortam değişkenleri (GitHub Secrets üzerinden gelir):
  TELEGRAM_BOT_TOKEN   — @BotFather'dan alınan bot token'ı
  TELEGRAM_CHAT_ID     — kanalın kullanıcı adı (ör. @kuranhayatimda) ya da sayısal id

Bot, kanala "Gönderi ekle" (Post Messages) izniyle yönetici olarak eklenmiş olmalı;
bu script token'ı ve kanal id'sini üretemez, yalnız kullanır.

Kullanım:
  python3 scripts/social/publish_telegram.py            # gerçekten paylaşır (dikey kart)
  python3 scripts/social/publish_telegram.py --dry-run   # paylaşmadan sadece üretir/gösterir
  python3 scripts/social/publish_telegram.py --square    # dikey yerine eski kare kart kullanır
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

API_BASE = 'https://api.telegram.org/bot{token}'
CAPTION_LIMIT = 1024  # Telegram'ın foto caption sınırı


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

    post = pick_next('telegram')
    if post is None:
        print('Sırada bekleyen onaylı post yok, çıkılıyor.')
        return 0

    b = build(post)
    text = b['telegram']
    if not text:
        print(f"HATA: {post['sure']}:{post['ayet']} için içerik (content/) henüz hazır değil, atlanıyor.", file=sys.stderr)
        return 1

    img_path = f"/tmp/tg_card_{post['sure']}_{post['ayet']}.png"
    render_card(post['soru'], img_path, story=story)
    print(f"Kart üretildi: {img_path}")
    print(f"Metin ({len(text)} krk):\n{text}\n")

    if dry_run:
        print("(--dry-run: gerçek paylaşım yapılmadı)")
        return 0

    bot_token = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    import requests
    base = API_BASE.format(token=bot_token)

    fits_as_caption = len(text) <= CAPTION_LIMIT
    with open(img_path, 'rb') as f:
        resp = requests.post(
            f"{base}/sendPhoto",
            data={'chat_id': chat_id, **({'caption': text} if fits_as_caption else {})},
            files={'photo': f},
            timeout=60,
        )
    data = resp.json()
    if not data.get('ok'):
        print(f"HATA (Telegram sendPhoto): {data}", file=sys.stderr)
        return 1

    if not fits_as_caption:
        resp2 = requests.post(f"{base}/sendMessage", data={'chat_id': chat_id, 'text': text}, timeout=30)
        data2 = resp2.json()
        if not data2.get('ok'):
            print(f"HATA (Telegram sendMessage): {data2}", file=sys.stderr)
            return 1

    message_id = data['result']['message_id']
    print(f"Paylaşıldı: mesaj #{message_id} ({chat_id})")

    log_posted(post['sure'], post['ayet'], 'telegram', extra={'messageId': message_id})
    return 0


if __name__ == '__main__':
    sys.exit(main())

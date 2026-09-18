# -*- coding: utf-8 -*-
"""
Sıradaki onaylı sosyal medya postunu X'e (Twitter) paylaşır:
  1. social/posted_log.json'a bakarak henüz paylaşılmamış bir sonraki onaylı postu seçer
  2. Kart görselini render eder (scripts/social/render_card.py)
  3. X API'sine görsel + kısa (280 karakter) caption ile gönderir
  4. social/posted_log.json'a kayıt ekler

Gerekli ortam değişkenleri (GitHub Secrets üzerinden gelir):
  X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET

Kullanım:
  python3 scripts/social/publish_x.py            # gerçekten paylaşır
  python3 scripts/social/publish_x.py --dry-run   # paylaşmadan sadece üretir/gösterir
  python3 scripts/social/publish_x.py --story     # kare yerine dikey (story) kart kullanır
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
    story = '--story' in sys.argv

    post = pick_next('x')
    if post is None:
        print('Sırada bekleyen onaylı post yok, çıkılıyor.')
        return 0

    b = build(post)
    caption = b['x_kisa']
    if not caption:
        print(f"HATA: {post['sure']}:{post['ayet']} için içerik (content/) henüz hazır değil, atlanıyor.", file=sys.stderr)
        return 1

    img_path = f"/tmp/x_card_{post['sure']}_{post['ayet']}.png"
    render_card(post['soru'], img_path, story=story)
    print(f"Kart üretildi: {img_path}")
    print(f"Caption ({len(caption)} krk ham):\n{caption}\n")

    if dry_run:
        print("(--dry-run: gerçek paylaşım yapılmadı)")
        return 0

    api_key = os.environ['X_API_KEY']
    api_secret = os.environ['X_API_SECRET']
    access_token = os.environ['X_ACCESS_TOKEN']
    access_token_secret = os.environ['X_ACCESS_TOKEN_SECRET']

    import tweepy

    auth = tweepy.OAuth1UserHandler(api_key, api_secret, access_token, access_token_secret)
    api_v1 = tweepy.API(auth)
    media = api_v1.media_upload(filename=img_path)

    client = tweepy.Client(
        consumer_key=api_key, consumer_secret=api_secret,
        access_token=access_token, access_token_secret=access_token_secret,
    )
    resp = client.create_tweet(text=caption, media_ids=[media.media_id])
    tweet_id = resp.data['id']
    tweet_url = f"https://x.com/i/web/status/{tweet_id}"
    print(f"Paylaşıldı: {tweet_url}")

    log_posted(post['sure'], post['ayet'], 'x', extra={'tweetId': str(tweet_id), 'url': tweet_url})
    return 0


if __name__ == '__main__':
    sys.exit(main())

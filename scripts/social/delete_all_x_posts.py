# -*- coding: utf-8 -*-
"""
@kuranhayatimda hesabındaki TÜM paylaşımları siler. GERİ ALINAMAZ.

Yalnız elle, workflow_dispatch üzerinden ve açık bir onay metniyle
çalıştırılmak üzere tasarlandı (bkz. .github/workflows/sosyal-medya-x-temizle.yml).
Zamanlanmış (cron) çalışmaz.

Kullanım: python3 scripts/social/delete_all_x_posts.py
Ortam değişkenleri: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
"""
import os
import sys
import time

import tweepy


def main():
    api_key = os.environ['X_API_KEY']
    api_secret = os.environ['X_API_SECRET']
    access_token = os.environ['X_ACCESS_TOKEN']
    access_token_secret = os.environ['X_ACCESS_TOKEN_SECRET']

    client = tweepy.Client(
        consumer_key=api_key, consumer_secret=api_secret,
        access_token=access_token, access_token_secret=access_token_secret,
    )

    me = client.get_me()
    user_id = me.data.id
    print(f"Hesap: @{me.data.username} (id={user_id})")

    deleted = 0
    while True:
        resp = client.get_users_tweets(id=user_id, max_results=100)
        tweets = resp.data or []
        if not tweets:
            break
        for t in tweets:
            try:
                client.delete_tweet(t.id)
                deleted += 1
                print(f"silindi: {t.id}")
            except tweepy.TooManyRequests:
                print("rate limit — 60 sn bekleniyor")
                time.sleep(60)
            except Exception as e:
                print(f"HATA ({t.id}): {e}")
            time.sleep(1.1)  # nazik ol, rate limit'e takılma

    print(f"\nToplam silinen paylaşım: {deleted}")


if __name__ == '__main__':
    sys.exit(main())

# -*- coding: utf-8 -*-
"""Tanı amaçlı: X kimlik doğrulamasını hem v1.1 hem v2 ile ayrı ayrı dener."""
import os

import tweepy

api_key = os.environ['X_API_KEY']
api_secret = os.environ['X_API_SECRET']
access_token = os.environ['X_ACCESS_TOKEN']
access_token_secret = os.environ['X_ACCESS_TOKEN_SECRET']

print("--- v1.1 verify_credentials ---")
try:
    auth = tweepy.OAuth1UserHandler(api_key, api_secret, access_token, access_token_secret)
    api = tweepy.API(auth)
    me = api.verify_credentials()
    print(f"BASARILI: @{me.screen_name} (id={me.id})")
except Exception as e:
    print(f"HATA: {type(e).__name__}: {e}")

print("\n--- v2 get_me ---")
try:
    client = tweepy.Client(
        consumer_key=api_key, consumer_secret=api_secret,
        access_token=access_token, access_token_secret=access_token_secret,
    )
    me2 = client.get_me()
    print(f"BASARILI: {me2.data}")
except Exception as e:
    print(f"HATA: {type(e).__name__}: {e}")

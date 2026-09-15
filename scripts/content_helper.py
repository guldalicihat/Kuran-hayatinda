# -*- coding: utf-8 -*-
"""Ajanların içerik yazarken kullandığı yardımcı: w(dict) doğrular ve content/{s}/{a}.json yazar.
from content_helper import w, K
K(kelime, okunus, kok, kokAnlam, karsilik) -> kök kaydı. Kök yoksa kok='—'.
Doğrulama hatasında dosya YAZILMAZ ve hata mesajı basılır; fonksiyon False döner."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from generate_content import validate, write_content, load_chapters, SCHEMA  # noqa: E402
_counts = {c['n']: c['ayet'] for c in load_chapters()}

def K(kelime, okunus, kok, kokAnlam, karsilik):
    return {"kelime": kelime, "okunus": okunus, "kok": kok, "kokAnlam": kokAnlam, "karsilik": karsilik}

def w(d):
    s, a = int(d['sure']), int(d['ayet'])
    errs = validate(s, a, d, _counts)
    if 'mealNotu' not in d or not d['mealNotu']:
        errs.append('mealNotu boş')
    if errs:
        print(f'HATA {s}:{a}: ' + '; '.join(errs)); return False
    write_content(s, a, d); print(f'ok {s}:{a}'); return True

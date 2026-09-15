# -*- coding: utf-8 -*-
"""Bir sure aralığındaki ayetlerin verisini (Arapça, okunuş, kelime kökleri, bağlam) yazar.
Kullanım: python3 scripts/dump_verses.py SURE [BAŞ] [SON]"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'public', 'data')
s = int(sys.argv[1]); lo = int(sys.argv[2]) if len(sys.argv) > 2 else 1
ch = next(c for c in json.load(open(os.path.join(D, 'chapters.json'), encoding='utf-8')) if c['n'] == s)
su = json.load(open(os.path.join(D, 'surah', f'{s}.json'), encoding='utf-8'))
hi = int(sys.argv[3]) if len(sys.argv) > 3 else ch['ayet']
print(f"SURE {s} {ch['ad']} ({ch['anlam']}), {ch['tip']}, {ch['ayet']} ayet, iniş sırası {ch['nuzul']}")
if lo > 1:
    p = su['ayetler'][lo - 2]; print(f"[bağlam, önceki] {lo-1}. {p['okunus']}")
for a in range(lo, hi + 1):
    v = su['ayetler'][a - 1]
    print(f"\n=== {s}:{a} ===\nAR: {v['ar']}\nOK: {v['okunus']}")
    for w in v['kelimeler']:
        print(f"  {w['ar']} | {w['okunus']} | kök {w['kok'] or '—'} | lemma {w['lemma'] or '—'} | {w['tur']}")
if hi < ch['ayet']:
    n = su['ayetler'][hi]; print(f"\n[bağlam, sonraki] {hi+1}. {n['okunus']}")

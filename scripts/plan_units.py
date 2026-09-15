# -*- coding: utf-8 -*-
"""Henüz yazılmamış ayetleri iş birimlerine böler. Çıktı: JSON liste [{"sure":78,"bas":1,"son":20,"kelime":210}, ...]
Kullanım: python3 scripts/plan_units.py [--max-words 300] [--max-verses 30] [--order amme|mushaf]"""
import argparse, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'public', 'data')
p = argparse.ArgumentParser(); p.add_argument('--max-words', type=int, default=300); p.add_argument('--max-verses', type=int, default=30)
p.add_argument('--order', default='amme'); p.add_argument('--limit', type=int, default=0)
a = p.parse_args()
chapters = json.load(open(os.path.join(D, 'chapters.json'), encoding='utf-8'))
order = list(range(78, 115)) + list(range(1, 78)) if a.order == 'amme' else list(range(1, 115))
units = []
for s in order:
    su = json.load(open(os.path.join(D, 'surah', f'{s}.json'), encoding='utf-8'))
    cur = None
    for v in su['ayetler']:
        if os.path.exists(os.path.join(ROOT, 'content', str(s), f"{v['n']}.json")):
            if cur: units.append(cur); cur = None
            continue
        wc = len(v['kelimeler'])
        if cur and (cur['kelime'] + wc > a.max_words or cur['son'] - cur['bas'] + 1 >= a.max_verses):
            units.append(cur); cur = None
        if not cur: cur = {"sure": s, "bas": v['n'], "son": v['n'], "kelime": 0}
        cur['son'] = v['n']; cur['kelime'] += wc
    if cur: units.append(cur)
# küçük birimleri (aynı sırada ardışık sureler) birleştirmeyi ajan istemi yapar; burada listeyi veriyoruz
print(json.dumps(units[:a.limit] if a.limit else units, ensure_ascii=False))
print(f"# {len(units)} birim, {sum(u['son']-u['bas']+1 for u in units)} ayet", file=__import__('sys').stderr)

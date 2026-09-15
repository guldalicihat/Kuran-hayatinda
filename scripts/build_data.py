# -*- coding: utf-8 -*-
"""
Ham veriden site verisini üretir:
  public/data/chapters.json        : 114 sure meta verisi
  public/data/surah/{n}.json       : sure ayetleri (Arapça, okunuş, kelime kökleri)
Çalıştır: python3 scripts/build_data.py
"""
import collections, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from translit import verse_to_turkish

RAW = os.path.join(ROOT, 'data', 'raw', 'quran-morphology.txt')
OUT = os.path.join(ROOT, 'public', 'data')

POS_TR = {'N': 'isim', 'V': 'fiil', 'P': 'edat', 'PN': 'özel isim', 'PRON': 'zamir', 'ADJ': 'sıfat',
          'DEM': 'işaret', 'REL': 'ilgi', 'T': 'zaman', 'LOC': 'yer', 'NEG': 'olumsuzluk', 'CONJ': 'bağlaç',
          'INTG': 'soru', 'COND': 'şart', 'VOC': 'nida', 'EMPH': 'pekiştirme', 'IMPV': 'emir', 'PRP': 'amaç',
          'INL': 'mukattaa', 'ACC': 'te\'kid', 'RES': 'istisna', 'EXP': 'istisna', 'DET': 'belirlilik',
          'SUB': 'bağlaç', 'INC': 'başlangıç', 'FUT': 'gelecek', 'ANS': 'cevap', 'CERT': 'kesinlik',
          'RET': 'idrak', 'PREV': 'engel', 'AVR': 'caydırma', 'SUR': 'sürpriz', 'AMD': 'düzeltme',
          'CIRC': 'hal', 'RSLT': 'sonuç', 'REM': 'devam', 'SUP': 'ek', 'COM': 'beraberlik', 'EQ': 'eşitlik',
          'CAUS': 'sebep', 'EXH': 'teşvik', 'EXL': 'açıklama', 'INT': 'yorum', 'NV': 'isim-fiil', 'IMPN': 'emir'}

def load():
    verses = collections.OrderedDict()
    with open(RAW, encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n')
            if not line:
                continue
            loc, form, pos, feats = line.split('\t')
            s, a, w, seg = map(int, loc.split(':'))
            verses.setdefault((s, a), collections.OrderedDict()).setdefault(w, []).append((form, pos, feats))
    return verses

def feat(feats, key):
    for f in feats.split('|'):
        if f.startswith(key + ':'):
            return f[len(key) + 1:]
    return None

def word_info(segs):
    ar = ''.join(f for f, _, _ in segs)
    root = lemma = None
    pos = None
    for form, p, feats in segs:
        r = feat(feats, 'ROOT'); l = feat(feats, 'LEM')
        if r and not root:
            root, lemma, pos = r, l, p
    if not pos:
        # kök yoksa ana parçanın türü
        main = next((s for s in segs if 'PREF' not in s[2] and 'SUFF' not in s[2]), segs[0])
        pos = main[1]; lemma = feat(main[2], 'LEM')
        tags = main[2].split('|')
        for t in tags:
            if t in POS_TR and t not in ('PREF', 'SUFF'):
                pos = t; break
    return {'ar': ar, 'kok': root, 'lemma': lemma, 'tur': POS_TR.get(pos, pos),
            'okunus': verse_to_turkish([segs], capitalize=False, pause=False)}

def main():
    verses = load()
    meta = json.load(open(os.path.join(ROOT, 'data', 'surah_meta.json'), encoding='utf-8'))
    nz = json.load(open(os.path.join(ROOT, 'data', 'nuzul.json'), encoding='utf-8'))
    order = {s: i + 1 for i, s in enumerate(nz['nuzul_sirasi'])}
    medeni = set(nz['medeni'])
    counts = collections.Counter(s for s, a in verses)
    assert len(verses) == 6236 and len(counts) == 114, 'ayet/sure sayısı beklenenden farklı'
    ar_names = {}
    try:
        import re
        src = json.load(open(os.path.join(ROOT, 'data', 'surah_names_ar.json'), encoding='utf-8'))
        ar_names = {int(k): v for k, v in src.items()}
    except FileNotFoundError:
        pass
    chapters = []
    for n, ad, anlam in meta:
        chapters.append({'n': n, 'ad': ad, 'anlam': anlam, 'ar': ar_names.get(n, ''),
                         'tip': 'medeni' if n in medeni else 'mekki', 'nuzul': order[n], 'ayet': counts[n]})
    os.makedirs(os.path.join(OUT, 'surah'), exist_ok=True)
    json.dump(chapters, open(os.path.join(OUT, 'chapters.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    total_words = 0
    for ch in chapters:
        n = ch['n']
        ayetler = []
        for a in range(1, ch['ayet'] + 1):
            v = verses[(n, a)]
            segs = list(v.values())
            words = [word_info(s) for s in segs]
            total_words += len(words)
            ayetler.append({'n': a, 'ar': ' '.join(w['ar'] for w in words),
                            'okunus': verse_to_turkish(segs), 'kelimeler': words})
        json.dump({'n': n, 'ad': ch['ad'], 'ayetler': ayetler},
                  open(os.path.join(OUT, 'surah', f'{n}.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    # arama dizini: [sure, ayet, okunuş]
    idx = []
    for ch in chapters:
        n = ch['n']
        for a in range(1, ch['ayet'] + 1):
            idx.append([n, a, verse_to_turkish(list(verses[(n, a)].values()))])
    json.dump(idx, open(os.path.join(OUT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'chapters.json, search.json ve {len(chapters)} sure dosyası yazıldı; {len(verses)} ayet, {total_words} kelime')

if __name__ == '__main__':
    main()

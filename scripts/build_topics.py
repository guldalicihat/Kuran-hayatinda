# -*- coding: utf-8 -*-
"""
Sor sayfası için konu indeksi: data/konular.json sözlüğüyle content/{sure}/{ayet}.json açıklamalarını
tarar ve public/data/topics.json üretir. Model kullanmaz; deterministik kelime eşlemesidir.

  topics.json = {
    "konular": [{"id","ad","ornek","anahtar":[...], "ayetler":[[sure, ayet, puan], ...]}],   # konu başına en iyi N ayet
    "ayetler":  {"2:255": {"d": "taslak"|"incelendi", "b": "bugün adımı (kısa)"}}             # sayfada gösterilecek küçük alanlar
  }

Puan: alanlara göre ağırlıklı eşleşme sayısı (meal 3, ne anlatıyor 2, günlük hayat 2, bugün 1.5, bugünün adımı 1);
incelenmiş ayete küçük ek. Eşik altı ayetler konuya girmez. Çalıştır: python3 scripts/build_topics.py
"""
import glob, json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KONULAR = os.path.join(ROOT, 'data', 'konular.json')
SRC = os.path.join(ROOT, 'content')
OUT = os.path.join(ROOT, 'public', 'data', 'topics.json')
FIELD_W = {'meal': 3.0, 'neAnlatiyor': 2.0, 'gunlukHayat': 2.0, 'bugun': 1.5, 'bugununAdimi': 1.0}
ESIK = 4.0
KONU_BASI_AYET = 60
TR_MAP = str.maketrans({'â': 'a', 'î': 'i', 'û': 'u', 'Â': 'a', 'Î': 'i', 'Û': 'u', 'I': 'ı', 'İ': 'i'})


def norm(s):
    """Türkçe küçük harf, şapkalı harfler düz, apostrof yok; kelime sınırları için tek boşluk."""
    s = (s or '').translate(TR_MAP).lower().replace("'", '').replace('’', '')
    s = unicodedata.normalize('NFC', s)
    return re.sub(r'\s+', ' ', s)


def alan_metni(d, alan):
    v = d.get(alan)
    if isinstance(v, str):
        return v
    if isinstance(v, list):
        out = []
        for x in v:
            if isinstance(x, str): out.append(x)
            elif isinstance(x, dict): out.append(f"{x.get('baslik', '')} {x.get('aciklama', '')}")
        return ' '.join(out)
    return ''


def derle(konular):
    """Her konu için kelime-başı eşleşen tek bir düzenli ifade."""
    out = []
    for k in konular:
        stems = sorted({norm(a).strip() for a in k['anahtar'] if a.strip()}, key=len, reverse=True)
        parts = [(r'(?<![^\W_])' if ' ' in st else r'\b') + re.escape(st) for st in stems]
        out.append((k, re.compile('|'.join(parts))))
    return out


def puanla(d, rx):
    toplam = 0.0
    for alan, w in FIELD_W.items():
        n = len(rx.findall(norm(alan_metni(d, alan))))
        if n:
            toplam += w * min(n, 4)
    if toplam and d.get('durum') == 'incelendi':
        toplam += 1.0
    return toplam


def main():
    konular = json.load(open(KONULAR, encoding='utf-8'))['konular']
    rxs = derle(konular)
    per_topic = {k['id']: [] for k in konular}
    ayetler = {}
    n = 0
    for path in sorted(glob.glob(os.path.join(SRC, '*', '*.json'))):
        d = json.load(open(path, encoding='utf-8'))
        if not str(d.get('meal') or '').strip():
            continue
        s, a = int(d['sure']), int(d['ayet'])
        n += 1
        adim = re.sub(r'\s+', ' ', str(d.get('bugununAdimi') or '')).strip()
        ayetler[f'{s}:{a}'] = {'d': d.get('durum', 'taslak'), 'b': adim[:160]}
        for k, rx in rxs:
            p = puanla(d, rx)
            if p >= ESIK:
                per_topic[k['id']].append([s, a, round(p, 1)])
    cikti = {'konular': [], 'ayetler': ayetler}
    for k in konular:
        secilen = sorted(per_topic[k['id']], key=lambda r: (-r[2], r[0], r[1]))[:KONU_BASI_AYET]
        cikti['konular'].append({'id': k['id'], 'ad': k['ad'], 'ornek': k.get('ornek', ''),
                                 'anahtar': [norm(x).strip() for x in k['anahtar']], 'ayetler': secilen})
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(cikti, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    bos = [k['id'] for k in cikti['konular'] if not k['ayetler']]
    print(f"{n} ayet tarandı, {len(konular)} konu; boş konu: {bos or 'yok'}; {os.path.getsize(OUT) // 1024} KB -> {OUT}")


if __name__ == '__main__':
    main()

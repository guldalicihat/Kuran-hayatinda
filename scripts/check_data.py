# -*- coding: utf-8 -*-
"""
Veri ve içerik kontrolleri. Hata varsa sıfırdan farklı kodla çıkar.
  - 114 sure, 6236 ayet, sure başına ayet sayısı chapters.json ile uyumlu
  - her ayette Arapça ve okunuş dolu, kelime sayısı > 0
  - content/ dosyalarında zorunlu alanlar dolu, sure/ayet gerçek, çapraz referanslar (Kur'an'ı Kur'an'a) gerçek ayetlere işaret ediyor
  - kelime kökleri, Corpus verisindeki köklerle uyumlu (ayette geçmeyen kök uydurulmamış)
Çalıştır: python3 scripts/check_data.py
"""
import glob, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'public', 'data')
errors = []
MARKS = re.compile('[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]')
def base(w): return MARKS.sub('', (w or '').replace('\u0622', '\u0627'))

chapters = json.load(open(os.path.join(D, 'chapters.json'), encoding='utf-8'))
if len(chapters) != 114: errors.append(f'sure sayısı {len(chapters)}')
if sum(c['ayet'] for c in chapters) != 6236: errors.append('toplam ayet 6236 değil')
if sorted(c['nuzul'] for c in chapters) != list(range(1, 115)): errors.append('nüzul sırası eksik/çift')
counts = {}
surahs = {}
for c in chapters:
    s = json.load(open(os.path.join(D, 'surah', f"{c['n']}.json"), encoding='utf-8'))
    surahs[c['n']] = s
    if len(s['ayetler']) != c['ayet']: errors.append(f"sure {c['n']}: {len(s['ayetler'])} ayet, meta {c['ayet']}")
    for a in s['ayetler']:
        if not a['ar'].strip() or not a['okunus'].strip() or not a['kelimeler']:
            errors.append(f"{c['n']}:{a['n']} boş alan")
        if re.search(r'[A-Za-z]', a['ar']): errors.append(f"{c['n']}:{a['n']} Arapça metinde Latin harf")
    counts[c['n']] = c['ayet']

def exists(ref):
    m = re.match(r'^(\d+):(\d+)$', ref)
    return bool(m) and int(m.group(1)) in counts and 1 <= int(m.group(2)) <= counts[int(m.group(1))]

REQ = {'meal': str, 'kokler': list, 'neAnlatiyor': list, 'kuraniKurana': list, 'gunlukHayat': list, 'bugun': list, 'bugununAdimi': str}
n_content = 0
for path in sorted(glob.glob(os.path.join(ROOT, 'content', '*', '*.json'))):
    d = json.load(open(path, encoding='utf-8'))
    rel = os.path.relpath(path, ROOT)
    n_content += 1
    if not exists(f"{d.get('sure')}:{d.get('ayet')}"): errors.append(f'{rel}: geçersiz sure/ayet'); continue
    for k, t in REQ.items():
        if not isinstance(d.get(k), t) or not d.get(k): errors.append(f'{rel}: {k} eksik veya boş')
    if d.get('durum') not in ('taslak', 'incelendi'): errors.append(f'{rel}: durum geçersiz')
    if len(d.get('bugun', [])) != 3: errors.append(f"{rel}: 'bugun' 3 öneri olmalı, {len(d.get('bugun', []))} var")
    for r in d.get('kuraniKurana', []):
        if not exists(r.get('ref', '')): errors.append(f"{rel}: çapraz referans geçersiz: {r.get('ref')}")
        if not r.get('meal') or not r.get('baglanti'): errors.append(f"{rel}: çapraz referans {r.get('ref')} meal/bağlantı boş")
    ayah = surahs[d['sure']]['ayetler'][d['ayet'] - 1]
    real_roots = {w['kok'] for w in ayah['kelimeler'] if w['kok']}
    real_words = {base(w['ar']) for w in ayah['kelimeler']}
    for k in d.get('kokler', []):
        if k.get('kok') and k['kok'] != '—' and k['kok'] not in real_roots:
            errors.append(f"{rel}: kök {k['kok']} ({k.get('kelime')}) Corpus verisinde bu ayette yok")
        if base(k.get('kelime')) not in real_words:
            errors.append(f"{rel}: kelime {k.get('kelime')} ayette yok")
    for w in ayah['kelimeler']:
        if w['kok'] and w['kok'] not in {k.get('kok') for k in d.get('kokler', [])}:
            errors.append(f"{rel}: ayetteki {w['ar']} (kök {w['kok']}) açıklamada yok")

print(f'{len(chapters)} sure, 6236 ayet, {n_content} açıklama kontrol edildi')
if errors:
    print('\n'.join('HATA: ' + e for e in errors)); sys.exit(1)
print('Tüm kontroller geçti')

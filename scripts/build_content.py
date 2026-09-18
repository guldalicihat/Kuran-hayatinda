# -*- coding: utf-8 -*-
"""
content/{sure}/{ayet}.json (düzenlenebilir kaynak) dosyalarını siteye derler:
  public/content/index.json     : hangi ayetlerin açıklaması var
  public/content/{s}/{a}.json   : açıklama (kopya)
  public/data/meal/{s}.json     : ayet -> meal (sure sayfası kartları için)
Çalıştır: python3 scripts/build_content.py
"""
import glob, json, os, re, shutil
MARKS = re.compile('[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]')
def base(w): return MARKS.sub('', (w or '').replace('\u0622', '\u0627'))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'content')
PUB = os.path.join(ROOT, 'public', 'content')
MEAL = os.path.join(ROOT, 'public', 'data', 'meal')
CONTENT_SEARCH = os.path.join(ROOT, 'public', 'data', 'content-search.json')
REQUIRED = ['sure', 'ayet', 'durum', 'meal', 'kokler', 'neAnlatiyor', 'kuraniKurana', 'gunlukHayat', 'bugun', 'bugununAdimi']

def searchable_extra(d):
    """Meal dışındaki açıklama metinlerini arama için tek satırda birleştirir."""
    parts = list(d.get('neAnlatiyor', [])) + list(d.get('gunlukHayat', []))
    for b in d.get('bugun', []):
        parts.append(f"{b['baslik']}: {b['aciklama']}")
    if d.get('bugununAdimi'):
        parts.append(d['bugununAdimi'])
    return ' '.join(parts)

def main():
    if os.path.isdir(PUB): shutil.rmtree(PUB)
    if os.path.isdir(MEAL): shutil.rmtree(MEAL)
    os.makedirs(PUB); os.makedirs(MEAL)
    index = {}; meals = {}; content_search = []; n = 0
    for path in sorted(glob.glob(os.path.join(SRC, '*', '*.json'))):
        d = json.load(open(path, encoding='utf-8'))
        missing = [k for k in REQUIRED if k not in d]
        if missing:
            raise SystemExit(f'{path}: eksik alanlar {missing}')
        s, a = int(d['sure']), int(d['ayet'])
        # açıklamadaki kelimeleri Corpus'taki harekeli biçimle eşle (hareke sırası farklarını giderir)
        try:
            ayah = json.load(open(os.path.join(ROOT, 'public', 'data', 'surah', f'{s}.json'), encoding='utf-8'))['ayetler'][a - 1]
            forms = {}
            for wd in ayah['kelimeler']:
                forms.setdefault(base(wd['ar']), wd['ar'])
            for k in d.get('kokler', []):
                b = base(k.get('kelime'))
                if b in forms: k['kelime'] = forms[b]
        except FileNotFoundError:
            pass
        assert path.endswith(os.path.join(str(s), f'{a}.json')), f'{path}: sure/ayet alanı dosya yoluyla uyuşmuyor'
        os.makedirs(os.path.join(PUB, str(s)), exist_ok=True)
        json.dump(d, open(os.path.join(PUB, str(s), f'{a}.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        index.setdefault(str(s), []).append(a)
        meals.setdefault(str(s), {})[str(a)] = d['meal']
        content_search.append([s, a, d['meal'], searchable_extra(d)])
        n += 1
    for s in index: index[s].sort()
    json.dump(index, open(os.path.join(PUB, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    for s, m in meals.items():
        json.dump(m, open(os.path.join(MEAL, f'{s}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    content_search.sort(key=lambda r: (r[0], r[1]))
    json.dump(content_search, open(CONTENT_SEARCH, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{n} açıklama, {len(index)} sure derlendi')

if __name__ == '__main__':
    main()

# -*- coding: utf-8 -*-
"""
Tüm ayetler için kök temelli meal ve 5 bölümlük açıklama üretimi (Claude Message Batches API, %50 indirimli).

Kullanım:
  python3 scripts/generate_content.py estimate                 # maliyet tahmini (API anahtarı gerekmez)
  python3 scripts/generate_content.py preview 8 65             # tek ayetin istemini göster (API gerekmez)
  python3 scripts/generate_content.py sync 8 65 [--force]      # tek ayeti anında üret (test için)
  python3 scripts/generate_content.py submit [--from 1 --to 114] [--model claude-opus-5]
  python3 scripts/generate_content.py collect                  # biten batch'leri indir, doğrula, content/ altına yaz
  python3 scripts/generate_content.py status                   # batch durumları

Kurallar:
  - Kökler yapay zekâya verilir (Corpus verisi); yapay zekâ kök belirlemez. Çıktıdaki her kök doğrulanır.
  - "Kur'an'ı Kur'an'a" referansları gerçek ayet olmalı; sitedeki meallerle tutarlılık için üretilen referans mealleri
    saklanır ve ileride karşılaştırılır.
  - Zaten üretilmiş (content/{s}/{a}.json var) ayetler atlanır; --force ile yeniden üretilir.
Durum dosyası: data/generation_state.json (batch kimlikleri ve gönderilen ayetler).
"""
import argparse, json, os, re, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'public', 'data')
CONTENT = os.path.join(ROOT, 'content')
STATE = os.path.join(ROOT, 'data', 'generation_state.json')
DEFAULT_MODEL = 'claude-opus-5'
MARKS = re.compile('[ً-ٰٟۖ-ۭـ]')
def base(w): return MARKS.sub('', (w or '').replace('آ', 'ا'))

SCHEMA = {
    "type": "object",
    "properties": {
        "meal": {"type": "string", "description": "Kök temelli, akıcı Türkçe meal. Kelimelerde olmayan eklemeler köşeli parantez içinde."},
        "mealNotu": {"type": "string", "description": "Kritik kelimelerin kök seçimi ve köşeli parantez eklemeleri hakkında 1-3 cümle."},
        "kokler": {"type": "array", "items": {"type": "object", "properties": {
            "kelime": {"type": "string"}, "okunus": {"type": "string"}, "kok": {"type": "string"},
            "kokAnlam": {"type": "string"}, "karsilik": {"type": "string"}},
            "required": ["kelime", "okunus", "kok", "kokAnlam", "karsilik"], "additionalProperties": False}},
        "neAnlatiyor": {"type": "array", "items": {"type": "string"}, "description": "2 paragraf."},
        "kuraniKurana": {"type": "array", "items": {"type": "object", "properties": {
            "ref": {"type": "string", "description": "sure:ayet, örn. 8:66"}, "meal": {"type": "string"}, "baglanti": {"type": "string"}},
            "required": ["ref", "meal", "baglanti"], "additionalProperties": False}, "description": "2-4 çapraz referans."},
        "gunlukHayat": {"type": "array", "items": {"type": "string"}, "description": "2 paragraf."},
        "bugun": {"type": "array", "items": {"type": "object", "properties": {"baslik": {"type": "string"}, "aciklama": {"type": "string"}},
            "required": ["baslik", "aciklama"], "additionalProperties": False}, "description": "Tam 3 öneri."},
        "bugununAdimi": {"type": "string"},
    },
    "required": ["meal", "mealNotu", "kokler", "neAnlatiyor", "kuraniKurana", "gunlukHayat", "bugun", "bugununAdimi"],
    "additionalProperties": False,
}

def load_chapters():
    return json.load(open(os.path.join(DATA, 'chapters.json'), encoding='utf-8'))

_surah_cache = {}
def load_surah(n):
    if n not in _surah_cache:
        _surah_cache[n] = json.load(open(os.path.join(DATA, 'surah', f'{n}.json'), encoding='utf-8'))
    return _surah_cache[n]

def system_prompt():
    example = json.load(open(os.path.join(CONTENT, '8', '65.json'), encoding='utf-8'))
    ex = {k: example[k] for k in SCHEMA['required']}
    return f"""Sen "Kur'an Hayatında" projesi için Türkçe içerik üreten bir yazarsın. Her ayet için kök temelli bir meal ve beş bölümlük bir açıklama yazarsın. Amaç: doğru, ölçülü, kaynaklı ve günlük hayata bağlanan metin.

KURALLAR
1. Meal, sana verilen kelime köklerine dayanır. Kökleri sen belirlemezsin; verilen kökleri Türkçeleştirirsin. Kelimelerde olmayan bir anlamı meale eklemen gerekiyorsa köşeli parantez içinde yaz: [yoluna]. Yorum ekleme; meal olabildiğince kelimelere sadık ve akıcı Türkçe olsun. Allah, Rab, Rahmân gibi özel adlar korunur.
2. "kokler" listesi: ayetteki HER kelime için bir kayıt; sırayla, hiçbirini atlamadan. "kelime" alanı verilen harekeli Arapça biçimin aynısı, "okunus" verilen okunuş, "kok" verilen kök (kök yoksa "—"), "kokAnlam" kökün temel anlam alanı (3-6 kelime), "karsilik" bu ayetteki Türkçe karşılığı. Verilmeyen bir kök uydurma.
3. "neAnlatiyor": 2 paragraf. Ayetin bağlamı (bir önceki ve sonraki ayetler verilir), kritik kelimelerin kök anlamı ve ayetin ana mesajı. Kesin olmayan bir şeyi kesin gibi yazma; tefsir görüşlerine yalnız "klasik tefsir ... olarak açıklar" gibi genel ifadeyle değin. Hadis alıntısı yapma, isim vererek tefsir metni alıntılama, tarih ve sayı uydurma.
4. "kuraniKurana": 2 ila 4 arası çapraz referans (varsayılan 2; gerçekten güçlü ek referans bulursan 3-4'e çık, sayı doldurmak için zorlama). Her biri gerçek bir ayet olmalı ("ref": "sure:ayet"). Mümkünse aynı kökü paylaşan veya konuyu açan ayetleri seç; en az biri, açıklanan ayetin dışındaki bir sureden olsun. "meal" alanına o ayetin kısa, sadık mealini yaz; "baglanti" alanına iki ayet arasındaki ilişkiyi 1-2 cümleyle yaz. Emin olmadığın ayet numarası verme.
5. "gunlukHayat": 2 paragraf. Ayetin doğrudan konusunu söyle; sonra bugüne taşınabilecek dersi ver. Ayetin konusu savaş, miras, hukuk gibi özel bir alansa bunu açıkça belirt ve dersi zorlamadan çıkar.
6. "bugun": tam 3 öneri. Her biri somut, bugün yapılabilir, tek cümle "baslik" ve 1-2 cümle "aciklama". "bugununAdimi": tek cümle, ölçülebilir bir eylem.
7. Dil: sade, açık Türkçe. Vaaz üslubu ve abartı yok. Cümleler kısa. "Sen" hitabı kullan. Türkçe imlaya dikkat et (â, î, û uzatmaları okunuşlarda korunur).
8. Uzunluk: Kısa ayetlerde (1-5 kelime) paragraflar 2-3 cümle; uzun ayetlerde en fazla 5 cümle. Toplam çıktı 350-700 kelime arası.
9. Aynı sure içinde tekrar eden ayetlerde (örn. Rahmân suresi nakaratı) her seferinde bağlama özgü, farklı bir vurgu yaz.

ÖRNEK ÇIKTI (Enfâl 65 için; biçimi ve üslubu bu örnekten al):
{json.dumps(ex, ensure_ascii=False)}"""

def verse_payload(s, a):
    ch = next(c for c in load_chapters() if c['n'] == s)
    su = load_surah(s)
    v = su['ayetler'][a - 1]
    def brief(x):
        return f"{x['n']}. {x['ar']}\n   Okunuş: {x['okunus']}" if x else None
    prev = brief(su['ayetler'][a - 2]) if a > 1 else None
    nxt = brief(su['ayetler'][a]) if a < len(su['ayetler']) else None
    words = '\n'.join(f"- kelime: {w['ar']} | okunuş: {w['okunus']} | kök: {w['kok'] or '—'} | lemma: {w['lemma'] or '—'} | tür: {w['tur']}" for w in v['kelimeler'])
    return f"""SURE: {ch['ad']} ({s}), {ch['tip']}, {ch['ayet']} ayet, iniş sırası {ch['nuzul']}
AYET: {a}
ARAPÇA: {v['ar']}
OKUNUŞ: {v['okunus']}

KELİMELER VE KÖKLER (Quranic Arabic Corpus):
{words}

BAĞLAM
Önceki ayet: {prev or '(yok, sure başı)'}
Sonraki ayet: {nxt or '(yok, sure sonu)'}

Bu ayet için şemaya uygun JSON üret."""

def request_params(s, a, model):
    return {
        "model": model,
        "max_tokens": 6000,
        "system": [{"type": "text", "text": system_prompt(), "cache_control": {"type": "ephemeral"}}],
        "messages": [{"role": "user", "content": verse_payload(s, a)}],
        "output_config": {"format": {"type": "json_schema", "schema": SCHEMA}, "effort": "medium"},
    }

def validate(s, a, d, counts):
    errs = []
    for k in SCHEMA['required']:
        if k not in d or not d[k]:
            errs.append(f'{k} boş')
    if errs:
        return errs
    v = load_surah(s)['ayetler'][a - 1]
    real = {base(w['ar']): w for w in v['kelimeler']}
    real_roots = {w['kok'] for w in v['kelimeler'] if w['kok']}
    out_roots = set()
    for k in d['kokler']:
        b = base(k.get('kelime'))
        if b in real:
            k['kelime'] = real[b]['ar']
        else:
            errs.append(f"kelime ayette yok: {k.get('kelime')}")
        if k.get('kok') and k['kok'] != '—' and k['kok'] not in real_roots:
            errs.append(f"kök uydurulmuş: {k['kok']}")
        out_roots.add(k.get('kok'))
    for r in real_roots - out_roots:
        errs.append(f'eksik kök: {r}')
    for r in d['kuraniKurana']:
        m = re.match(r'^(\d+):(\d+)$', r.get('ref', ''))
        if not m or int(m.group(1)) not in counts or not (1 <= int(m.group(2)) <= counts[int(m.group(1))]):
            errs.append(f"geçersiz referans: {r.get('ref')}")
        elif (int(m.group(1)), int(m.group(2))) == (s, a):
            errs.append('referans ayetin kendisi')
    if len(d['bugun']) != 3:
        errs.append(f"bugun {len(d['bugun'])} öneri")
    return errs

def write_content(s, a, d):
    durum = d.get('durum', 'taslak')
    d = {"sure": s, "ayet": a, "durum": durum, **{k: d[k] for k in SCHEMA['required']},
         "kaynaklar": [{"ad": "Quranic Arabic Corpus, kelime kelime çözümleme", "url": f"https://corpus.quran.com/wordbyword.jsp?chapter={s}&verse={a}"},
                       {"ad": "Quran.com, ayet sayfası", "url": f"https://quran.com/{s}/{a}"}]}
    os.makedirs(os.path.join(CONTENT, str(s)), exist_ok=True)
    json.dump(d, open(os.path.join(CONTENT, str(s), f'{a}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

def exists(s, a):
    return os.path.exists(os.path.join(CONTENT, str(s), f'{a}.json'))

def load_state():
    return json.load(open(STATE, encoding='utf-8')) if os.path.exists(STATE) else {"batches": []}

def save_state(st):
    json.dump(st, open(STATE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

def pending_verses(lo, hi, force):
    st = load_state()
    inflight = {tuple(map(int, k.split(':'))) for b in st['batches'] if b.get('status') != 'done' for k in b['verses']}
    out = []
    for ch in load_chapters():
        if not (lo <= ch['n'] <= hi):
            continue
        for a in range(1, ch['ayet'] + 1):
            if (force or not exists(ch['n'], a)) and (ch['n'], a) not in inflight:
                out.append((ch['n'], a))
    return out

def cmd_estimate(args):
    chapters = load_chapters()
    total = sum(c['ayet'] for c in chapters)
    todo = pending_verses(args.frm, args.to, args.force)
    sys_tokens = len(system_prompt()) / 3.2
    sizes = []
    for s in [1, 8, 103, 113]:
        for f in os.listdir(os.path.join(CONTENT, str(s))):
            d = json.load(open(os.path.join(CONTENT, str(s), f), encoding='utf-8'))
            sizes.append(len(json.dumps({k: d[k] for k in SCHEMA['required']}, ensure_ascii=False)))
    out_tokens = (sum(sizes) / len(sizes)) / 3.0
    user_tokens = sum(len(verse_payload(s, a)) for s, a in todo[:200]) / max(1, min(200, len(todo))) / 3.2
    n = len(todo)
    # ayet uzunluğu çıktı boyutunu etkiler; pilot ortalaması kısa surelerden geldiği için %20 pay
    out_tokens *= 1.2
    print(f'Toplam {total} ayet, üretilecek {n} ayet')
    print(f'Tahmini: sistem istemi ~{sys_tokens:.0f} token (önbellekli), ayet başına girdi ~{user_tokens:.0f}, çıktı ~{out_tokens:.0f} token')
    for model, pin, pout in [('claude-opus-5', 5.0, 25.0), ('claude-sonnet-5', 2.0, 10.0)]:
        inp = n * (user_tokens + sys_tokens * 0.1) / 1e6 * pin * 0.5   # batch %50, önbellek okuması %10
        outc = n * out_tokens / 1e6 * pout * 0.5
        print(f'  {model:16s} batch fiyatıyla: girdi ~${inp:,.0f} + çıktı ~${outc:,.0f} = ~${inp + outc:,.0f}')
    print('Not: kaba tahmin (karakter/3.2). Gerçek sayı, ilk batch sonunda usage alanından hesaplanıp raporlanır.')

def cmd_preview(args):
    print('--- SYSTEM ---'); print(system_prompt()[:1500], '...'); print('--- USER ---'); print(verse_payload(args.sure, args.ayet))

def client():
    import anthropic
    return anthropic.Anthropic()

def cmd_sync(args):
    s, a = args.sure, args.ayet
    if exists(s, a) and not args.force:
        print('zaten var; --force ile yeniden üret'); return
    counts = {c['n']: c['ayet'] for c in load_chapters()}
    resp = client().messages.create(**request_params(s, a, args.model))
    if resp.stop_reason == 'refusal':
        print('reddedildi:', getattr(resp, 'stop_details', None)); return
    text = next(b.text for b in resp.content if b.type == 'text')
    d = json.loads(text)
    errs = validate(s, a, d, counts)
    print('usage:', resp.usage.input_tokens, 'in,', resp.usage.output_tokens, 'out, cache_read', resp.usage.cache_read_input_tokens)
    if errs:
        print('DOĞRULAMA HATALARI:', errs)
        json.dump(d, open(os.path.join(ROOT, 'data', f'rejected_{s}_{a}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        return
    write_content(s, a, d); print(f'content/{s}/{a}.json yazıldı')

def cmd_submit(args):
    from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
    from anthropic.types.messages.batch_create_params import Request
    todo = pending_verses(args.frm, args.to, args.force)
    if not todo:
        print('Gönderilecek ayet yok'); return
    c = client(); st = load_state()
    size = args.batch_size
    for i in range(0, len(todo), size):
        chunk = todo[i:i + size]
        reqs = [Request(custom_id=f'{s}-{a}', params=MessageCreateParamsNonStreaming(**request_params(s, a, args.model))) for s, a in chunk]
        b = c.messages.batches.create(requests=reqs)
        st['batches'].append({"id": b.id, "model": args.model, "status": "submitted", "created": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                              "verses": [f'{s}:{a}' for s, a in chunk]})
        save_state(st)
        print(f'batch {b.id}: {len(chunk)} ayet ({chunk[0][0]}:{chunk[0][1]} .. {chunk[-1][0]}:{chunk[-1][1]})')
    print(f'{len(todo)} ayet gönderildi. Sonuçlar için: python3 scripts/generate_content.py collect')

def cmd_status(args):
    c = client(); st = load_state()
    for b in st['batches']:
        if b.get('status') == 'done':
            print(b['id'], 'done', len(b['verses'])); continue
        r = c.messages.batches.retrieve(b['id'])
        rc = r.request_counts
        print(b['id'], r.processing_status, f'işleniyor {rc.processing}, başarılı {rc.succeeded}, hatalı {rc.errored}, süresi dolmuş {rc.expired}')

def cmd_collect(args):
    c = client(); st = load_state(); counts = {ch['n']: ch['ayet'] for ch in load_chapters()}
    ok = bad = 0; usage = {'in': 0, 'out': 0, 'cache': 0}; rejected = []
    for b in st['batches']:
        if b.get('status') == 'done':
            continue
        r = c.messages.batches.retrieve(b['id'])
        if r.processing_status != 'ended':
            print(b['id'], 'henüz bitmedi:', r.processing_status); continue
        for res in c.messages.batches.results(b['id']):
            s, a = map(int, res.custom_id.split('-'))
            if res.result.type != 'succeeded':
                bad += 1; rejected.append({"ref": f'{s}:{a}', "neden": res.result.type}); continue
            msg = res.result.message
            usage['in'] += msg.usage.input_tokens; usage['out'] += msg.usage.output_tokens; usage['cache'] += msg.usage.cache_read_input_tokens or 0
            if msg.stop_reason == 'refusal':
                bad += 1; rejected.append({"ref": f'{s}:{a}', "neden": "refusal"}); continue
            text = next((blk.text for blk in msg.content if blk.type == 'text'), '')
            try:
                d = json.loads(text)
            except json.JSONDecodeError:
                bad += 1; rejected.append({"ref": f'{s}:{a}', "neden": "json"}); continue
            errs = validate(s, a, d, counts)
            if errs:
                bad += 1; rejected.append({"ref": f'{s}:{a}', "neden": errs}); continue
            write_content(s, a, d); ok += 1
        b['status'] = 'done'; save_state(st)
    print(f'{ok} ayet yazıldı, {bad} ayet reddedildi (yeniden göndermek için: submit)')
    print(f"kullanım: girdi {usage['in']:,} (önbellek {usage['cache']:,}), çıktı {usage['out']:,} token")
    if rejected:
        json.dump(rejected, open(os.path.join(ROOT, 'data', 'generation_rejected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('reddedilenler: data/generation_rejected.json')

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    for name in ('estimate', 'submit'):
        q = sub.add_parser(name); q.add_argument('--from', dest='frm', type=int, default=1); q.add_argument('--to', type=int, default=114)
        q.add_argument('--force', action='store_true'); q.add_argument('--model', default=DEFAULT_MODEL); q.add_argument('--batch-size', type=int, default=1000)
    for name in ('preview', 'sync'):
        q = sub.add_parser(name); q.add_argument('sure', type=int); q.add_argument('ayet', type=int)
        q.add_argument('--force', action='store_true'); q.add_argument('--model', default=DEFAULT_MODEL)
    sub.add_parser('collect'); sub.add_parser('status')
    args = p.parse_args()
    globals()['cmd_' + args.cmd](args)

if __name__ == '__main__':
    main()

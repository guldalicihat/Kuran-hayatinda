# -*- coding: utf-8 -*-
"""
social/posts/{sure}/{ayet}.json (soru+köprü) -> üç platform için hazır gönderi metni.

Yapı:
  - GÖRSEL: yalnız kanca soru (bu script görsel üretmez, metni üretir; kart ayrı hazırlanır).
  - METİN (caption): köprü cümlesi -> ayet meali -> günlük hayat uygulaması (kısa) -> siteye yönlendirme -> hashtag.
  - Arapça metin caption'a girmez (uzunluk/sınır nedeniyle); ayet meali önceliklidir.

Kullanım:
  python3 scripts/social/build_post.py 1 1
  python3 scripts/social/build_post.py --all
  python3 scripts/social/build_post.py --export out.json
"""
import argparse, glob, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://kuranhayatimda.com/#/sure/{s}/{a}"
SITE_ADI = "kuranhayatimda.com"
HASHTAG_SABIT = ["#Kuran", "#Ayet", "#KuranHayatında"]
# src/lib/baglantilar.ts'teki telegramKanal ile aynı adres.
TELEGRAM_KANAL = "https://t.me/kuranhayatimda"
TELEGRAM_CTA = f"📢 Her sabah bir ayet için Telegram kanalımıza katıl: {TELEGRAM_KANAL}"
TELEGRAM_CTA_KISA = f"📢 Telegram: {TELEGRAM_KANAL}"

def load_chapter(s):
    chs = json.load(open(os.path.join(ROOT, 'public', 'data', 'chapters.json'), encoding='utf-8'))
    return next(c for c in chs if c['n'] == s)

def load_content(s, a):
    try:
        return json.load(open(os.path.join(ROOT, 'content', str(s), f'{a}.json'), encoding='utf-8'))
    except FileNotFoundError:
        return None

def first_sentence(text, max_len=160):
    """Bir paragrafın ilk cümlesini döndürür; çok uzunsa kısaltır."""
    m = re.search(r'[^.!?]*[.!?]', text.strip())
    s = m.group(0).strip() if m else text.strip()
    if len(s) > max_len:
        s = s[:max_len - 1].rsplit(' ', 1)[0] + '…'
    return s

def gunluk_hayat_teaser(content):
    """gunlukHayat alanındaki en uygulanabilir cümleyi seçer (genelde 2. paragraf)."""
    gh = content.get('gunlukHayat', [])
    if not gh:
        return None
    paragraf = gh[1] if len(gh) > 1 else gh[0]
    return first_sentence(paragraf)

X_LIMIT = 280
X_LINK_WEIGHT = 23  # X (t.co) her linki uzunluğundan bağımsız 23 karakter sayar


def build_x_short(post):
    """X formatı: meal ASLA gösterilmez ve ASLA kırpılmaz (proje kuralı).
    X'in standart hesabı 280 karakterle sınırlı olduğundan, ayet meali ve
    'bugün ne yapmalısın' bölümü yalnız sitede, tam haliyle okunur; X'te
    yalnızca kart (soru) + köprü cümlesi + doğrudan siteye link paylaşılır."""
    s, a = post['sure'], post['ayet']
    content = load_content(s, a)
    if not content:
        return None
    link = SITE.format(s=s, a=a)
    hashtag = "#Kuran #KuranHayatında"
    koprusor = post['koprusor']
    if len(koprusor) > 60:
        koprusor = "Peki Kur'an bu konuda ne diyor?"

    return f"{koprusor} Cevap ve bugünün adımı için: {link}\n\n{TELEGRAM_CTA_KISA}\n\n{hashtag}"


def build(post):
    s, a = post['sure'], post['ayet']
    ch = load_chapter(s)
    content = load_content(s, a)
    ref = f"{ch['ad']} {a}"
    link = SITE.format(s=s, a=a)
    hashtags = ' '.join(HASHTAG_SABIT + [f"#{h}" for h in post.get('hashtagEk', [])])

    if not content:
        meal = "(meal henüz hazır değil — bu ayet için gönderi üretilemez)"
        teaser = None
    else:
        meal = content['meal']
        teaser = gunluk_hayat_teaser(content)

    gövde = f"{post['koprusor']}\n\n\"{meal}\"\n({ref})"
    if teaser:
        gövde += f"\n\nGünlük hayatta ne anlama gelir? {teaser}"

    return {
        "sure": s, "ayet": a, "ref": ref, "soru": post['soru'],
        "gorsel_metni": post['soru'],
        "x_kisa": build_x_short(post),
        "x": f"{gövde}\n\nDetaylı açıklama ve bugünün adımı için siteye bak: {link}\n\n{TELEGRAM_CTA_KISA}\n\n{hashtags}",
        "facebook": f"{gövde}\n\nDetaylı açıklama ve bugünün adımı için siteye bak: {link}\n\n{TELEGRAM_CTA}\n\n{hashtags}",
        "instagram": f"{gövde}\n\nDetaylı açıklama ve bugünün adımı için: {SITE_ADI} — {ref}\n\n{TELEGRAM_CTA}\n\n{hashtags}",
    }

def all_posts():
    for f in sorted(glob.glob(os.path.join(ROOT, 'social', 'posts', '*', '*.json'))):
        yield json.load(open(f, encoding='utf-8'))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('sure', nargs='?', type=int)
    p.add_argument('ayet', nargs='?', type=int)
    p.add_argument('--all', action='store_true')
    p.add_argument('--export')
    args = p.parse_args()
    if args.export:
        out = [build(post) for post in all_posts()]
        json.dump(out, open(args.export, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f'{len(out)} gönderi {args.export} dosyasına yazıldı')
        return
    posts = list(all_posts()) if args.all else [json.load(open(os.path.join(ROOT, 'social', 'posts', str(args.sure), f'{args.ayet}.json'), encoding='utf-8'))]
    for post in posts:
        b = build(post)
        print(f"\n{'='*60}\n{b['ref']}  |  GÖRSEL: \"{b['gorsel_metni']}\"\n{'='*60}")
        link = SITE.format(s=b['sure'], a=b['ayet'])
        for plat in ('x_kisa', 'x', 'facebook', 'instagram'):
            if plat == 'x_kisa':
                etiket = 'X (standart, X-ağırlıklı uzunluk)'
                agirlikli = len(b[plat]) - len(link) + X_LINK_WEIGHT
                uzunluk_notu = f"{agirlikli}/280 krk (X'in link=23 krk sayımıyla)"
            else:
                etiket = plat.upper()
                uzunluk_notu = f"{len(b[plat])} krk"
            print(f"\n--- {etiket} (caption, {uzunluk_notu}) ---\n{b[plat]}")

if __name__ == '__main__':
    main()

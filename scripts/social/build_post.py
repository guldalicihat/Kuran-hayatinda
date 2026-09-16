# -*- coding: utf-8 -*-
"""
social/posts/{sure}/{ayet}.json (soru+köprü) -> üç platform için hazır gönderi metni.
Kullanım:
  python3 scripts/social/build_post.py 1 1                 # tek gönderiyi göster
  python3 scripts/social/build_post.py --all                # tüm hazır olanları göster
  python3 scripts/social/build_post.py --export out.json    # tümünü tek JSON'a yaz (paylaşım kuyruğu)
"""
import argparse, glob, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://guldalicihat.github.io/Kuran-hayatinda/#/sure/{s}/{a}"
HASHTAG_SABIT = ["#Kuran", "#Ayet", "#KuranHayatında"]

def load_ayah(s, a):
    d = json.load(open(os.path.join(ROOT, 'public', 'data', 'surah', f'{s}.json'), encoding='utf-8'))
    return d['ayetler'][a - 1]

def load_chapter(s):
    chs = json.load(open(os.path.join(ROOT, 'public', 'data', 'chapters.json'), encoding='utf-8'))
    return next(c for c in chs if c['n'] == s)

def short_meal(s, a):
    try:
        c = json.load(open(os.path.join(ROOT, 'content', str(s), f'{a}.json'), encoding='utf-8'))
        return c['meal']
    except FileNotFoundError:
        return None

def build(post):
    s, a = post['sure'], post['ayet']
    ayah = load_ayah(s, a)
    ch = load_chapter(s)
    meal = short_meal(s, a) or "(meal henüz hazır değil)"
    link = SITE.format(s=s, a=a)
    ref = f"{ch['ad']} {a}"
    hashtags = ' '.join(HASHTAG_SABIT + [f"#{h}" for h in post.get('hashtagEk', [])])
    ar_kisa = ayah['ar'] if len(ayah['ar']) < 200 else ayah['ar'][:180] + '…'
    meal_kisa = meal if len(meal) < 220 else meal[:200] + '…'
    core = f"{post['soru']}\n\n{post['koprusor']}\n\n\"{ar_kisa}\"\n\n{meal_kisa}\n\n({ref})"
    return {
        "sure": s, "ayet": a, "ref": ref,
        "x": f"{core}\n\nTam açıklama: {link}\n\n{hashtags}",
        "facebook": f"{core}\n\nTam açıklama: {link}\n\n{hashtags}",
        "instagram": f"{core}\n\nTam açıklama ve bugünün adımı → bio'daki link.\n\n{hashtags}",
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
        print(f"\n{'='*60}\n{b['ref']}\n{'='*60}")
        for plat in ('x', 'facebook', 'instagram'):
            print(f"\n--- {plat.upper()} ---\n{b[plat]}")

if __name__ == '__main__':
    main()

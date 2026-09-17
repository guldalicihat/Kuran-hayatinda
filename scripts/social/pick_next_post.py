# -*- coding: utf-8 -*-
"""
social/posts/**/*.json içinden "denetim": "onaylandı" olan, ve verilen platform için
henüz social/posted_log.json'da kaydı olmayan bir sonraki postu (mushaf sırasına göre) döndürür.

Kullanım:
  python3 scripts/social/pick_next_post.py x
"""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POSTED_LOG = os.path.join(ROOT, 'social', 'posted_log.json')


def load_posted_log():
    if not os.path.exists(POSTED_LOG):
        return []
    return json.load(open(POSTED_LOG, encoding='utf-8'))


def already_posted(log, sure, ayet, platform):
    return any(e['sure'] == sure and e['ayet'] == ayet and e['platform'] == platform for e in log)


def pick_next(platform):
    log = load_posted_log()
    onaylanmis = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'social', 'posts', '*', '*.json'))):
        post = json.load(open(f, encoding='utf-8'))
        if post.get('denetim') != 'onaylandı':
            continue
        onaylanmis.append(post)
    onaylanmis.sort(key=lambda p: (p['sure'], p['ayet']))

    for post in onaylanmis:
        if not already_posted(log, post['sure'], post['ayet'], platform):
            return post
    return None


if __name__ == '__main__':
    platform = sys.argv[1] if len(sys.argv) > 1 else 'x'
    post = pick_next(platform)
    if post is None:
        print('Sırada bekleyen onaylı post yok.', file=sys.stderr)
        sys.exit(2)
    print(json.dumps(post, ensure_ascii=False))

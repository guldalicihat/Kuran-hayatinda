# -*- coding: utf-8 -*-
"""
public/data/chapters.json'dan public/sitemap.xml üretir: ana sayfa + 114 sure sayfası.
Not: Site HashRouter kullandığı için (#/sure/N) tekil ayet sayfaları arama motorlarınca
ayrı URL olarak indekslenmez; bu yüzden sitemap sure seviyesinde tutulur.
Çalıştır: python3 scripts/build_sitemap.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kuranhayatimda.com'


def main():
    chapters = json.load(open(os.path.join(ROOT, 'public', 'data', 'chapters.json'), encoding='utf-8'))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    lines.append('  <url>')
    lines.append(f'    <loc>{SITE}/</loc>')
    lines.append('    <changefreq>daily</changefreq>')
    lines.append('    <priority>1.0</priority>')
    lines.append('  </url>')
    for c in sorted(chapters, key=lambda x: x['n']):
        lines.append('  <url>')
        lines.append(f'    <loc>{SITE}/#/sure/{c["n"]}</loc>')
        lines.append('    <changefreq>monthly</changefreq>')
        lines.append('    <priority>0.8</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')
    out_path = os.path.join(ROOT, 'public', 'sitemap.xml')
    open(out_path, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print(f'{len(chapters) + 1} URL ile sitemap.xml yazıldı')


if __name__ == '__main__':
    main()

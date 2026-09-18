# -*- coding: utf-8 -*-
"""
social/card_template.html şablonundaki {{SORU_HTML}} yerine verilen soruyu koyup
1080x1080 PNG görsel üretir (Playwright ile ekran görüntüsü).

Kullanım:
  python3 scripts/social/render_card.py "Soru metni?" cikti.png
"""
import html
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card_template.html')
STORY_TEMPLATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card_story_template.html')


def render(soru: str, out_path: str, story: bool = False):
    from playwright.sync_api import sync_playwright

    template = STORY_TEMPLATE if story else TEMPLATE
    size = 1920 if story else 1080
    tpl = open(template, encoding='utf-8').read()
    soru_html = html.escape(soru).replace('\n', '<br>')
    page_html = tpl.replace('{{SORU_HTML}}', soru_html)

    tmp_html = out_path + '.tmp.html'
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(page_html)

    launch_kwargs = {}
    local_chromium = '/opt/pw-browsers/chromium'
    if os.path.exists(local_chromium):
        launch_kwargs['executable_path'] = local_chromium

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(**launch_kwargs)
            page = browser.new_page(viewport={'width': 1080, 'height': size})
            page.goto('file://' + os.path.abspath(tmp_html))
            page.wait_for_timeout(200)
            page.screenshot(path=out_path)
            browser.close()
    finally:
        os.remove(tmp_html)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Kullanım: render_card.py "Soru metni" cikti.png', file=sys.stderr)
        sys.exit(1)
    render(sys.argv[1], sys.argv[2])
    print(f'yazıldı: {sys.argv[2]}')

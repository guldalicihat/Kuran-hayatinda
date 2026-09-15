# -*- coding: utf-8 -*-
"""
Harekeli Arapça (Tanzil Uthmani / Quranic Corpus biçimi) -> Türkçe okunuş.

Girdi: Corpus'taki kelime parçaları (segment) listesi. Kurallar (özet):
- Kalın harflerden (خ ص ض ط ظ غ ق ر ح ع) sonra fetha "a", damme "u"; ince harflerden sonra "e", "ü".
  Kesre, kalın harflerden (خ ص ض ط ظ غ ق) sonra "ı", diğerlerinde "i". Uzun ünlüler her zaman â/î/û.
- Sonraki harf sâkin ve boğaz/kalın (خ ح ع غ ص ض ط ظ) ise fetha "a" olur (na'büdü, mağdûb, nahnü).
- Vasl elifi: ayet başında okunur (el-, Allâh, i-), ortada düşer; önceki kelimenin son uzun ünlüsü kısalır.
  "el" + kamerî harf: "l" önceki kelimeye eklenir, sonrası ayrı yazılır (rabbil âlemîn).
  "el" + şemsî harf: şemsî harf önceki kelimeye eklenir, sonrası ayrı yazılır (ver rasûl, ihdinas sırât).
  Allâh ve ellezî gibi "ٱلَّ" ile başlayanlar önceki kelimeye bitişik yazılır (fettekullâhe, sırâtallezîne).
- "ve" bağlacı ve "yâ" nidası ayrı yazılır (ve iyyâke, yâ eyyühen).
- Tenvin ve sâkin nun, sonraki kelime ي ر م ل و ن ile başlıyorsa o harfe dönüşür (kavmül lâ, gafûrur rahîm),
  ب ile başlıyorsa "m" olur.
- Ayet sonunda vakıf: son kısa ünlü ve tenvin düşer, fetha tenvini "â" olur, tâ-i merbûta "h" olur.
- Mukattaa harfleri (الٓمٓ) harf adlarıyla yazılır (Elif lâm mîm).
"""
import re

HEAVY_FATHA = set("خصضطظغقرحع")
HEAVY_KASRA = set("خصضطظغق")
HEAVY_DAMMA = set("خصضطظغقرحع")
NEXT_HEAVY = set("خحعغصضطظ")
SUN = set("تثدذرزسشصضطظلن")

CONS = {
    'ب':'b','ت':'t','ث':'s','ج':'c','ح':'h','خ':'h','د':'d','ذ':'z','ر':'r','ز':'z','س':'s','ش':'ş',
    'ص':'s','ض':'d','ط':'t','ظ':'z','ع':'ʿ','غ':'ğ','ف':'f','ق':'k','ك':'k','ل':'l','م':'m','ن':'n',
    'ه':'h','و':'v','ي':'y','ى':'y','ء':'ʾ','أ':'ʾ','إ':'ʾ','ؤ':'ʾ','ئ':'ʾ','ة':'t','ا':'A',
}
LETTER_NAMES = {'ا':'elif','ل':'lâm','م':'mîm','ص':'sâd','ر':'râ','ك':'kâf','ه':'hâ','ي':'yâ',
                'ع':'ayn','ط':'tâ','س':'sîn','ح':'hâ','ق':'kâf','ن':'nûn'}

FATHA, DAMMA, KASRA, SUKUN, SHADDA = 'َ', 'ُ', 'ِ', 'ْ', 'ّ'
TANWIN_F, TANWIN_D, TANWIN_K = 'ً', 'ٌ', 'ٍ'
DAGGER, SMALL_WAW, SMALL_YEH = 'ٰ', 'ۥ', 'ۦ'
HAMZA_ABOVE, WASL = 'ٔ', 'ٱ'
SILENT_MARKS = '۟۠'
IQLAB_MARKS = 'ۭۢ'
IGNORE = set('ٓـ۪ۣٖۜ۫ۨ۬ۧٗ٘')
VOWELS = set([FATHA, DAMMA, KASRA, TANWIN_F, TANWIN_D, TANWIN_K])
SHORT = {'â':'a','î':'i','û':'u'}

def normalize(w):
    w = re.sub('ـ([ً-ْ]?)' + HAMZA_ABOVE, lambda m: 'ء' + m.group(1), w)
    w = re.sub('([اوى])([ً-ْ]?)' + HAMZA_ABOVE, lambda m: 'ء' + m.group(2), w)
    w = w.replace(HAMZA_ABOVE, 'ء')
    # Allah lafzı: ikinci lâm uzun okunur (llâh)
    w = re.sub('ل([\u064B-\u0652]?)ل' + SHADDA + FATHA + '?ه', lambda m: 'ل' + m.group(1) + 'ل' + SHADDA + FATHA + DAGGER + 'ه', w)
    return ''.join(c for c in w if c not in IGNORE)

def parse(w):
    units = []
    for c in w:
        if c in CONS or c == WASL or c in LETTER_NAMES:
            units.append([c, []])
        elif units:
            units[-1][1].append(c)
    return units

class Tok:
    __slots__ = ('text', 'wasl', 'nasal_end', 'is_allah')
    def __init__(self):
        self.text = ''; self.wasl = None; self.nasal_end = False; self.is_allah = False

def _translit_units(units, last, keep_first_shadda):
    """Harekeli harf birimlerini (kind, val) dizisine çevirir."""
    out = []
    n = len(units)
    pause_alt = None
    def next_info(j):
        for k in range(j+1, n):
            L, marks = units[k]
            if L in CONS and L not in 'اى' and not any(m in SILENT_MARKS for m in marks):
                vow = next((m for m in marks if m in VOWELS), None)
                coda = (SUKUN in marks) or (vow is None and SHADDA not in marks and DAGGER not in marks)
                return L, coda
        return None, False
    for i in range(n):
        L, marks = units[i]
        if any(m in SILENT_MARKS for m in marks):
            continue
        has_dagger, has_sw, has_sy = DAGGER in marks, SMALL_WAW in marks, SMALL_YEH in marks
        vow = next((m for m in marks if m in VOWELS), None)
        shadda = SHADDA in marks and (i > 0 or keep_first_shadda)
        sukun = SUKUN in marks
        iqlab = any(m in IQLAB_MARKS for m in marks)
        # uzun ünlü taşıyıcıları
        if L in 'اى' and vow is None and SHADDA not in marks:
            if out and out[-1][0] == 'v':
                pv = out[-1][1]
                if pv in 'ae':
                    out.append(('c', 'y')) if (sukun and L == 'ى') else out.__setitem__(-1, ('v', 'â'))
                elif pv in 'iı' and L == 'ى':
                    out[-1] = ('v', 'î')
            if has_dagger and out and out[-1][0] == 'v':
                out[-1] = ('v', 'â')
            continue
        if L in 'وي' and has_dagger and vow is None and SHADDA not in marks and out and out[-1][0] == 'v':
            out[-1] = ('v', 'â'); continue
        if L in 'وي' and SHADDA not in marks and out and out[-1][0] == 'v' and (vow is None):
            pv = out[-1][1]
            if L == 'و' and pv in 'uü':
                out[-1] = ('v', 'û'); continue
            if L == 'ي' and pv in 'iı':
                out[-1] = ('v', 'î'); continue
            if sukun or vow is None:
                out.append(('c', 'v' if L == 'و' else 'y')); continue
        c = CONS.get(L, '')
        if L == 'ا' and vow is not None:
            c = 'ʾ'
        if c == 'A':
            continue
        if L == 'ة' and last and i == n - 1:
            pause_alt = 'h'
        if L == 'غ' and not out:
            c = 'g'
        out.append(('c', c))
        if shadda:
            out.append(('c', c))
        heavy_self = L in HEAVY_FATHA
        nl, ncoda = next_info(i)
        a_or_e = 'a' if (heavy_self or (ncoda and nl in NEXT_HEAVY)) else 'e'
        if vow == FATHA:
            out.append(('v', 'â' if has_dagger else a_or_e))
        elif vow == KASRA:
            out.append(('v', 'î' if has_sy else ('ı' if L in HEAVY_KASRA else 'i')))
        elif vow == DAMMA:
            out.append(('v', 'û' if has_sw else ('u' if L in HEAVY_DAMMA else 'ü')))
        elif vow == TANWIN_F:
            out.append(('v', a_or_e)); out.append(('c', 'N')); pause_alt = pause_alt or 'â'
        elif vow == TANWIN_D:
            out.append(('v', 'u' if L in HEAVY_DAMMA else 'ü')); out.append(('c', 'N'))
        elif vow == TANWIN_K:
            out.append(('v', 'ı' if L in HEAVY_KASRA else 'i')); out.append(('c', 'N'))
        else:
            if has_dagger: out.append(('v', 'â'))
            elif has_sw: out.append(('v', 'û'))
            elif has_sy: out.append(('v', 'î'))
        if L == 'ن' and vow is None and not shadda and out and out[-1] == ('c', 'n'):
            out[-1] = ('c', 'N')
        if iqlab and out and out[-1] == ('c', 'N'):
            out[-1] = ('c', 'M')
    # kelime içi sâkin nun
    res = []
    for k, (kind, val) in enumerate(out):
        if kind == 'c' and val == 'N':
            nxt = out[k+1][1] if k+1 < len(out) else None
            if nxt == 'b': res.append(('c', 'm'))
            elif k == len(out) - 1: res.append(('c', 'N'))
            else: res.append(('c', 'n'))
        else:
            res.append((kind, val))
    out = res
    # vakıf
    if last and out:
        if out[-1][1] in ('N', 'M'):
            out.pop()
            if out and out[-1][0] == 'v':
                if pause_alt == 'â': out[-1] = ('v', 'â')
                else: out.pop()
        elif out[-1][0] == 'v' and out[-1][1] in 'aeiıuü':
            out.pop()
        if pause_alt == 'h' and out and out[-1] == ('c', 't'):
            out[-1] = ('c', 'h')
    return out

def units_to_text(out):
    s = ''
    for k, (kind, val) in enumerate(out):
        if kind == 'c' and val in ('ʾ', 'ʿ'):
            if k == 0:
                continue
            prev, nxt = out[k-1], (out[k+1] if k+1 < len(out) else None)
            if prev[0] == 'c' or nxt is None or nxt[0] == 'c':
                s += "'"
        elif kind == 'c' and val == 'N':
            s += 'n'
        elif kind == 'c' and val == 'M':
            s += 'm'
        else:
            s += val
    return s

def make_tok(w, pos_tag, first, last):
    """Tek bir Arapça parça -> Tok."""
    tok = Tok()
    w = normalize(w)
    units = parse(w)
    if pos_tag == 'INL':
        tok.text = ' '.join(LETTER_NAMES.get(c, '') for c in w if c in LETTER_NAMES)
        return tok
    keep_first_shadda = False
    if units and units[0][0] == WASL:
        units = units[1:]
        keep_first_shadda = True
        if units and units[0][0] == 'ل' and SHADDA in units[0][1]:
            tok.wasl = 'join'
        elif len(units) > 2 and units[0][0] == 'ل' and not units[0][1] and units[1][0] == 'ل' and SHADDA in units[1][1] and units[2][0] == 'ه':
            tok.wasl = 'join'; tok.is_allah = True; units = units[1:]
        elif units and units[0][0] == 'ل' and (not units[0][1] or SUKUN in units[0][1]):
            if len(units) > 1 and units[1][0] in SUN and SHADDA in units[1][1]:
                tok.wasl = ('sun', units[1][0])
            else:
                tok.wasl = 'moon'
            units = units[1:]
        else:
            tok.wasl = 'other'
    out = _translit_units(units, last, keep_first_shadda)
    if out and out[-1] == ('c', 'N'):
        tok.nasal_end = True
    s = units_to_text(out)
    if tok.wasl and tok.wasl[0] == 'sun':
        s = s[1:]   # şemsî harfin ilk kopyası önceki kelimeye gider
    if first and tok.wasl:
        if tok.wasl == 'join':
            s = ('a' if tok.is_allah else 'e') + s
        elif tok.wasl == 'moon':
            s = 'el' + ("'" if out and out[0][1] in ('ʾ', 'ʿ') else '') + s
        elif tok.wasl[0] == 'sun':
            s = 'e' + CONS[tok.wasl[1]] + s
        else:
            vs = [x[1] for x in out if x[0] == 'v'][:2]
            s = ('u' if (len(vs) > 1 and vs[1] in 'uüû') else 'i') + s
        tok.wasl = None
    tok.text = s
    return tok

def split_atoms(segments):
    """Corpus kelime parçaları -> ayrı yazılacak parçalar [(arapça, pos)]."""
    atoms = []
    segs = list(segments)
    if segs and 'PREF' in segs[0][2]:
        f = segs[0][0]
        if f in ('وَ',) and ('CONJ' in segs[0][2] or 'REM' in segs[0][2] or 'CIRC' in segs[0][2] or 'SUP' in segs[0][2] or 'COM' in segs[0][2] or 'P|' in segs[0][2]):
            atoms.append(('وَ', 'CONJ')); segs = segs[1:]
        elif 'VOC' in segs[0][2]:
            atoms.append((f, 'VOC')); segs = segs[1:]
    rest = ''.join(s[0] for s in segs)
    pos = 'INL' if (segs and 'INL' in segs[0][2]) else (segs[0][1] if segs else 'N')
    if not rest:
        return atoms
    k = rest.find(WASL)
    if k > 0:
        atoms.append((rest[:k], 'PREFX')); atoms.append((rest[k:], pos))
    else:
        atoms.append((rest, pos))
    return atoms

def verse_to_turkish(word_segments, capitalize=True, pause=True):
    """word_segments: her kelime için [(form, pos, feats), ...] listesi."""
    atoms = []
    for wi, segs in enumerate(word_segments):
        for a in split_atoms(segs):
            atoms.append((a, wi == len(word_segments) - 1))
    pieces = []
    owners = []
    n = len(atoms)
    for i, ((ar, pos), last_word) in enumerate(atoms):
        is_last = pause and last_word and (i == n - 1)
        first = (i == 0)
        tok = make_tok(ar, pos, first=first, last=is_last)
        if tok.wasl and pieces:
            prev = pieces[-1]
            if prev and prev[-1] in SHORT: prev = prev[:-1] + SHORT[prev[-1]]
            if tok.wasl == 'join':
                if tok.is_allah and prev and prev[-1] == 'e': prev = prev[:-1] + 'a'
                pieces[-1] = prev + tok.text; owners[-1] = tok
            elif tok.wasl == 'moon':
                pieces[-1] = prev + 'l'; pieces.append(tok.text); owners.append(tok)
            elif tok.wasl[0] == 'sun':
                pieces[-1] = prev + CONS[tok.wasl[1]]; pieces.append(tok.text); owners.append(tok)
            else:
                pieces[-1] = prev + tok.text; owners[-1] = tok
        elif tok.wasl:
            pieces.append(tok.text); owners.append(tok)
        else:
            if pieces and atoms[i-1][0][1] == 'PREFX':
                pieces[-1] = pieces[-1] + tok.text; owners[-1] = tok
            else:
                pieces.append(tok.text); owners.append(tok)
    # tenvin / sâkin nun idgamı
    for i in range(len(pieces) - 1):
        if owners[i].nasal_end and pieces[i].endswith('n') and pieces[i+1]:
            f = pieces[i+1][0]
            if f in 'lrmnvy':
                pieces[i] = pieces[i][:-1] + f
            elif f == 'b':
                pieces[i] = pieces[i][:-1] + 'm'
    pieces = [p for p in pieces if p]
    text = ' '.join(pieces)
    if capitalize and text:
        text = ('İ' if text[0] == 'i' else text[0].upper()) + text[1:]
    return text

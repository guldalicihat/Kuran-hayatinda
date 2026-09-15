# Kur'an Hayatında

Tüm sureler ve ayetler için Arapça metin, Türkçe okunuş, kök temelli meal ve günlük hayata bağlanan açıklamalar sunan, mobil görünümlü ve çevrimdışı çalışabilen web sitesi.

Site: https://guldalicihat.github.io/kuran-hayatinda/

## Özellikler
- Sure listesi: Mushaf sırası veya iniş sırası (Mekki / Medeni bölümlü), Türkçe ad ve anlam, ayet sayısı.
- Sure sayfası: her ayet için okunuş, meal ve Arapça (sıra ve görünürlük ayarlanabilir), sure içinde filtre.
- Ayet sayfası: 1) meal ve kaynak notu, kelime kökleri tablosu, 2) ayet ne anlatıyor, 3) Kur'an'ı Kur'an'a sor, 4) günlük hayatla bağlantısı, 5) bugün ne yapabilirsin, bugünün adımı.
- Etiketler ve notlar: cihazda saklanır, Ayarlar'dan yedeklenir.
- Ara: okunuşta ve hazır meallerde arama, `8:65` biçiminde doğrudan gitme.
- Ayarlar: aydınlık/karanlık, sıralama, yazı ve Arapça boyutu, yazı tipleri.
- PWA: ana ekrana eklenebilir, ziyaret edilen sureler çevrimdışı açılır.

## Yapı
```
data/raw/quran-morphology.txt   Quranic Arabic Corpus verisi (Arapça metin + kökler)
data/surah_meta.json            Türkçe sure adları ve anlamları
data/nuzul.json                 iniş sırası ve Medeni sureler
scripts/translit.py             harekeli Arapça -> Türkçe okunuş
scripts/build_data.py           public/data/{chapters,search}.json ve surah/*.json üretir
content/{sure}/{ayet}.json      ayet açıklamaları (düzenlenebilir kaynak)
scripts/build_content.py        content/ -> public/content ve public/data/meal
scripts/check_data.py           veri ve içerik doğrulaması
src/                            React uygulaması
```

## Geliştirme
```
python3 scripts/build_data.py
python3 scripts/build_content.py
python3 scripts/check_data.py
npm install
npm run dev
```
`npm run build` üretim çıktısını `dist/` altına yazar. `main` dalına her gönderimde GitHub Actions siteyi yayınlar.

## İçerik durumu
Her açıklama `durum: "taslak"` ile başlar ve sitede "Yapay zekâ destekli taslak" etiketiyle görünür. İnceleme sonrası `"incelendi"` yapılır. Kaynak ve lisans notları için `KAYNAKLAR.md`.

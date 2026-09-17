# Kur'an Hayatında

Tüm sureler ve ayetler için Arapça metin, Türkçe okunuş, kök temelli meal ve günlük hayata bağlanan açıklamalar sunan, mobil görünümlü ve çevrimdışı çalışabilen web sitesi.

Site: https://kuranhayatimda.com/ (eski adres https://guldalicihat.github.io/Kuran-hayatinda/ buraya yönlenir)

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

## Alan adı
Site GitHub Pages üzerinde `kuranhayatimda.com` özel alan adıyla yayınlanır (`public/CNAME`; derlemede `VITE_BASE=/`).
DNS (alan adı sağlayıcısında): `@` için A kayıtları `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
`www` için CNAME `guldalicihat.github.io`. HTTPS sertifikasını GitHub Pages otomatik verir (Settings → Pages → Enforce HTTPS).
`kuranhayatimda.com.tr` sağlayıcı tarafında `https://kuranhayatimda.com` adresine yönlendirilir.

## Toplu içerik üretimi
`scripts/generate_content.py` tüm ayetler için kök temelli meal ve açıklama üretir (Claude Message Batches API, %50 indirimli).
```
python3 scripts/generate_content.py estimate        # maliyet tahmini
python3 scripts/generate_content.py submit          # batch gönder (ANTHROPIC_API_KEY gerekir)
python3 scripts/generate_content.py collect         # sonuçları indir, doğrula, content/ altına yaz
```
GitHub üzerinden: Actions → "İçerik üret (Claude Batch)" → Run workflow. `ANTHROPIC_API_KEY` deponun Secrets ayarında tanımlı olmalıdır.
Üretilen her ayet, kök ve çapraz referans doğrulamasından geçmeden depoya yazılmaz; reddedilenler `data/generation_rejected.json` dosyasına düşer.

## İçerik durumu
Her açıklama `durum: "taslak"` ile başlar ve sitede "Yapay zekâ destekli taslak" etiketiyle görünür. İnceleme sonrası `"incelendi"` yapılır. Kaynak ve lisans notları için `KAYNAKLAR.md`.

# Sosyal medya gönderi rehberi

Amaç: Kur'an'ın günlük hayata dokunan yönünü göstermek; "sadece namaz/oruç/cami" algısını kırmak.
Her gönderi, siteye zaten yazılmış `content/{sure}/{ayet}.json` dosyasındaki `gunlukHayat` ve `bugununAdimi`
alanlarından türetilir; uydurma veya ayet dışı bir mesaj eklenmez.

## Kalıp (üç platformda da aynı çekirdek)

1. **Kanca soru** — günlük hayattan, herkesin yaşadığı bir an/duygu. Doğrudan ikinci tekil şahısla ("sen").
   Ayetin `gunlukHayat` temasından çıkar, ama ayetten alıntı değildir — okuyanın kendi hayatından bir soru.
2. **Köprü cümlesi** — sabit: "Peki Kur'an bu konuda ne diyor?" (veya "Allah ne diyor?" varyasyonu, tekdüzeliği kırmak için)
3. **Ayet** — kısa Arapça + meal. Uzun ayetlerde yalnız ilgili kısım, "…" ile.
4. **Kapanış / CTA** — platforma göre değişir (aşağıda).

## Platforma göre CTA

| Platform | İçerik | Not |
|---|---|---|
| X | Köprü cümlesi + "Cevap ve bugünün adımı için: {link}" | **Ayet meali X'te GÖSTERİLMEZ, kısaltılmaz da.** X'in standart (ücretsiz) hesabı 280 karakter sınırlıdır; meal çoğu ayette bu sınırı aşar ve proje kuralı gereği meal asla kırpılamaz. Bu yüzden X'te görsel (soru) + kısa köprü + doğrudan siteye link paylaşılır; meal ve "bugün ne yapmalısın" sitede tam haliyle okunur. |
| Facebook | Köprü cümlesi + tam ayet meali + günlük hayat özeti + link | Karakter sınırı yok, tam format kullanılır. |
| Instagram | Köprü cümlesi + tam ayet meali + günlük hayat özeti + "{site adı} — {sure adı} {ayet}" | Instagram caption'da tıklanabilir link çalışmaz; link yerine site adı + ayet referansı yazılır, kullanıcı bio'daki linkten veya siteyi arayarak ulaşır. |

Link biçimi: `https://kuranhayatimda.com/#/sure/{sure}/{ayet}`

Uygulama: `scripts/social/build_post.py`'deki `build()` fonksiyonu üç platform için ayrı caption
üretir (`x_kisa` alanı X için kullanılır, `x` alanı bilgi amaçlı tam formattır ama Premium/Blue
hesap olmadıkça kullanılmaz); `build_x_short()` fonksiyonu bu kuralı uygular.

## Ek kurallar
- Her gönderide **tam olarak bir** ayet işlenir; birden fazla ayet karıştırılmaz.
- Hook soru asla ayetin kendisini spoiler etmez; merak uyandırır, cevap vermez.
- Kaynak sadakati: `content_helper.py` doğrulamasından geçmiş ayetler (kökleri doğrulanmış) dışında ayet kullanılmaz.
- Hashtag: sabit havuz + ayete özgü 1-2 kelime. Sabit: #Kuran #Ayet #KuranHayatında
- Görsel: sitenin turuncu/iOS temasıyla uyumlu kart (ayrı iş, bu script yalnız metni üretir).

## Dosya biçimi: social/posts/{sure}/{ayet}.json
```json
{
  "sure": 1, "ayet": 1,
  "soru": "Bugüne nasıl başladın, hiç düşündün mü?",
  "koprusor": "Peki Kur'an bu konuda ne diyor?",
  "hashtagEk": ["Besmele", "Niyet"],
  "durum": "taslak"
}
```
Arapça, meal ve link `scripts/social/build_post.py` tarafından `public/data` ve şemadan otomatik eklenir; burada elle yazılmaz.

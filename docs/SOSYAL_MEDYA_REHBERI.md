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

| Platform | CTA | Not |
|---|---|---|
| X | "Tam açıklama: {link}" | Link doğrudan gönderiye konur. |
| Facebook | "Tam açıklama: {link}" | Link doğrudan gönderiye konur. |
| Instagram | "Tam açıklama ve bugünün adımı → bio'daki link." | Instagram caption'da tıklanabilir link çalışmaz; her zaman bio linkine yönlendirilir. |

Link biçimi: `https://guldalicihat.github.io/Kuran-hayatinda/#/sure/{sure}/{ayet}`

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

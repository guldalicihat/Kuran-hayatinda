# İçerik yazım rehberi (ajanlar ve katkıcılar için)

Her ayet için bir `content/{sure}/{ayet}.json` dosyası üretilir. Dosya, **kök temelli meal** ve **5 bölümlük açıklama** içerir. Aşağıdaki kurallar bağlayıcıdır; `scripts/content_helper.py` içindeki `w()` fonksiyonu her dosyayı yazmadan önce doğrular.

## Çalışma akışı
1. Ayet verisini al: `python3 scripts/dump_verses.py SURE BAŞ SON` (Arapça, okunuş, her kelimenin kökü, önceki/sonraki ayet bağlamı).
2. Her ayet için Python içinde bir sözlük kur ve `w(d)` ile yaz. JSON'u elle yazma; Python sözlüğü kullan (tırnak sorunları olmaz).
3. `w()` "HATA" basarsa düzelt ve tekrar çağır. Bitince `python3 scripts/check_data.py` çalıştır; "Tüm kontroller geçti" görmelisin.

```python
import sys; sys.path.insert(0, 'scripts')
from content_helper import w, K
w({"sure": 103, "ayet": 1,
   "meal": "Asra (akıp giden zamana) andolsun.",
   "mealNotu": "'Asr' kökü sıkmayı, çağı ve ikindi vaktini anlatır ...",
   "kokler": [K("وَٱلْعَصْرِ", "vel asri", "عصر", "sıkma, öz çıkarma; çağ; günün sonuna doğru sıkışan vakit", "asra andolsun")],
   "neAnlatiyor": ["paragraf 1", "paragraf 2"],
   "kuraniKurana": [{"ref": "30:55", "meal": "...", "baglanti": "..."}, {"ref": "79:46", "meal": "...", "baglanti": "..."}],
   "gunlukHayat": ["paragraf 1", "paragraf 2"],
   "bugun": [{"baslik": "...", "aciklama": "..."}, {"baslik": "...", "aciklama": "..."}, {"baslik": "...", "aciklama": "..."}],
   "bugununAdimi": "..."})
```

## Kurallar
1. **Meal** verilen kelime köklerine dayanır. Kökleri sen belirlemezsin; verilen kökleri Türkçeleştirirsin. Kelimelerde olmayan bir anlamı eklemen gerekiyorsa köşeli parantez içinde yaz: `[yoluna]`. Yorum ekleme. Allah, Rab, Rahmân gibi özel adlar korunur. Akıcı, doğru Türkçe.
2. **mealNotu**: 1-3 cümle; kritik kelimelerin kök seçimi ve köşeli parantez eklemeleri.
3. **kokler**: ayetteki HER kelime için sırayla bir `K(...)`; hiçbirini atlama. `kelime` = dump'taki harekeli Arapça biçim (aynısını kopyala), `okunus` = dump'taki okunuş, `kok` = dump'taki kök (yoksa `"—"`), `kokAnlam` = kökün temel anlam alanı (3-6 kelime), `karsilik` = bu ayetteki Türkçe karşılığı. Verilmeyen kök uydurma; doğrulama reddeder.
4. **neAnlatiyor**: 2 paragraf. Bağlam (önceki/sonraki ayet), kritik kelimelerin kök anlamı, ana mesaj. Kesin olmayanı kesin gibi yazma. Tefsir görüşüne yalnız "klasik tefsir ... olarak açıklar" gibi genel ifadeyle değin. Hadis alıntısı yok, isimle tefsir alıntısı yok, uydurma tarih/sayı yok.
5. **kuraniKurana**: tam 2 çapraz referans; gerçek ayet olmalı (`"sure:ayet"`), ayetin kendisi olamaz. Mümkünse aynı kökü paylaşan veya konuyu açan ayetler; en az biri başka sureden. `meal` alanına o ayetin kısa, sadık meali; `baglanti` alanına ilişkiyi 1-2 cümleyle yaz. **Emin olmadığın ayet numarası verme**; emin olduğun, iyi bilinen ayetleri seç.
6. **gunlukHayat**: 2 paragraf. Önce ayetin doğrudan konusunu söyle, sonra bugüne taşınabilecek dersi ver. Konu savaş, miras, hukuk gibi özel bir alansa bunu belirt; dersi zorlamadan çıkar.
7. **bugun**: tam 3 öneri; her biri somut ve bugün yapılabilir. `baslik` kısa, `aciklama` 1-2 cümle. **bugununAdimi**: tek cümle, ölçülebilir eylem.
8. **Dil**: sade Türkçe, kısa cümleler, "sen" hitabı, vaaz üslubu ve abartı yok. Okunuşlardaki â, î, û korunur. Ayrı olan tırnaklar için ' kullan.
9. **Uzunluk**: kısa ayetlerde (1-5 kelime) paragraflar 2-3 cümle; uzun ayetlerde en fazla 5 cümle. Ayet başına toplam 250-600 kelime.
10. Aynı sure içinde tekrar eden ayetlerde (Rahmân suresi nakaratı, Mürselât "veyl" nakaratı gibi) her seferinde bağlama özgü, farklı bir vurgu yaz; kopyala-yapıştır yapma.
11. Bir ayet birden çok konu içeriyorsa açıklama ana konuya odaklanır; hepsini saymaya çalışma.

## Yapılmayacaklar
- `content/` dışında dosya değiştirme; commit veya push yapma (ana oturum yapar).
- `w()` hatalarını yok sayma; hatalı dosya yazılmaz.
- Şablon dışına çıkma; ek alan ekleme.

## Örnek
Tam örnek: `content/8/65.json` ve `content/1/2.json`.

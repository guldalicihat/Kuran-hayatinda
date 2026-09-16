# Sosyal medya: ayet uygunluğu ve eşleşme kuralları

Amaç: her sosyal medya sorusu, ilgili ayetin gerçek anlamına dayansın; zorlama, çarpıtma veya
bağlam dışı genelleme yapılmasın. Bu doküman, hangi ayetlerin soru-kanca formatına girebileceğini
ve her eşleşmenin nasıl denetleneceğini tanımlar.

## Temel ilke

**Soru ayetten çıkar, ayete uydurulmaz.** Bir ayetin sosyal medyaya uygun olup olmadığı,
o ayetin `content/{sure}/{ayet}.json` dosyasındaki `gunlukHayat` alanına bakılarak anlaşılır.
Bu alan zaten "ayetin doğrudan konusunu söyle, sonra zorlamadan günlük hayata bağla" kuralıyla
yazıldı. `gunlukHayat` metninde açık bir uygulama cümlesi yoksa veya metin "bu ayetin konusu
özeldir, genel bir ders zorlanmadan çıkarılamaz" türünde bir çekince taşıyorsa, o ayet sosyal
medya için KULLANILMAZ.

## Otomatik dışlanan kategoriler

Aşağıdaki konulardaki ayetler, ne kadar ilgi çekici görünürse görünsün soru-kanca formatına
sokulmaz (site içeriğinde tam açıklamaları vardır, sosyal medyada değil):

- Miras payları, vasiyet, mehir, nafaka gibi özel hukuki hükümler
- Hadd cezaları (hırsızlık, hırabe, zina isnadı vb.)
- Boşanma, iddet, çok evlilik hükümleri
- Savaş izni, ganimet, esir hükümleri
- Belirli bir topluluğa, olaya veya döneme özgü tarihî anlatılar (Bedir, Uhud, Hendek gibi)
- Ehl-i kitapla ilişkiler, itikadi karşılaştırmalar (teslis, kader-irade gibi hassas tartışmalar)
- Mukattaa harfleri gibi anlamı kapalı ayetler

## Uygun kategoriler (öncelikli havuz)

- Sabır, tevekkül, şükür
- Aile ilişkileri (anne-baba, evlilik saygısı — hüküm değil, ahlaki tutum)
- Kalp hâlleri: kibir, kıskançlık, öfke, huzur, korku
- Dua, tövbe, bağışlama
- Doğruluk, adalet, emanet (genel ahlaki ilke olarak, hukuki madde olarak değil)
- Ölüm, geçicilik, ahiret bilinci (genel hatırlatma olarak)
- Yaratılış ve tefekkür ayetleri (gökyüzü, doğa, insanın kendisi)

## Eşleşme denetim süreci (her ayet için zorunlu)

1. **Yazım:** Bir ajan, yalnızca yukarıdaki uygun kategorilerden ve `gunlukHayat` alanı net olan
   ayetler için soru + köprü cümlesi yazar.
2. **Karşı-okuma (ayrı ajan veya ayrı geçiş):** Her soru-ayet çifti şu sorularla test edilir:
   - Soru, ayetin `neAnlatiyor` ve `gunlukHayat` alanlarındaki gerçek anlamla tutarlı mı?
   - Ayetin özel bir tarihî/hukuki bağlamı var mı; soru bunu gizleyip genelliyor mu?
   - Ayetin ciddiyeti (örn. büyük bir uyarı ayeti) hafif bir "hayat tüyosu" diline indirgeniyor mu?
   - Meal, kökten sapıyor mu? (content_helper doğrulamasından geçmiş olmalı)
   Şüpheli bulunan her çift reddedilir, yerine yazılmaz.
3. **Son kontrol:** Onaylanmadan önce örneklem, ana oturumda (ben) tekrar okunur.

## Durum alanı

`social/posts/{sure}/{ayet}.json` içine `"denetim": "bekliyor" | "onaylandı" | "reddedildi"` eklenir.
Yalnızca `"onaylandı"` durumundaki gönderiler `build_post.py --export` çıktısına dahil edilir.

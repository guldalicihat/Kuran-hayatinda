# Kaynaklar ve lisans notları

| Veri | Kaynak | Lisans | Durum |
|---|---|---|---|
| Arapça metin (harekeli, Uthmani) | Tanzil.net metni, Quranic Arabic Corpus morfoloji dosyası içinden | Tanzil metin lisansı: değiştirilmeden kopyalanabilir (CC-BY 3.0) | Metin değiştirilmeden kullanılır; kaynak bu sayfada belirtilir |
| Kelime kökleri ve sarf bilgisi | Quranic Arabic Corpus Morphology v0.4 (corpus.quran.com), mustafa0x/quran-morphology çatalı | GNU GPL (Corpus'un beyanı) | Kaynak gösterilerek kullanılır; lisans metninin tam doğrulaması yapılacak |
| Sure adları, anlamları, Mekki/Medeni, iniş sırası | Bu proje için hazırlandı; iniş sırası Tanzil/Mısır standardı ile uyumlu | Proje lisansı | Ekran görüntülerindeki referans değerlerle doğrulandı |
| Arapça sure adları | fawazahmed0/quran-api info.json | Unlicense (depo beyanı) | Kullanımda |
| Türkçe okunuş | Bu projede, harekeli metinden kurala dayalı üretim (`scripts/translit.py`) | Proje lisansı | Otomatik üretim; hatalar düzeltilerek iyileştirilir |
| Kök temelli meal ve açıklamalar | Bu projede, Corpus kökleri temel alınarak yapay zekâ desteğiyle üretilir | Proje lisansı | Her ayet "taslak" olarak başlar, inceleme sonrası "incelendi" olur |
| Yazı tipleri: Amiri, Scheherazade New, Noto Naskh Arabic | Google Fonts deposu | SIL Open Font License 1.1 (public/fonts altındaki OFL dosyaları) | Siteye gömülü |

## Bilerek kullanılmayanlar
- Tanzil üzerinden dağıtılan Türkçe mealler (Diyanet vb.): Tanzil, çevirilerin yeniden dağıtımına izin vermediğini belirtir. Bu mealler siteye konmaz; yalnız test amaçlı karşılaştırmada, dağıtılmadan kullanılabilir.
- Quran.com API içerikleri: Kullanım şartları kişisel ve ticari olmayan kullanımla sınırlıdır; veri toplama yasaktır.

## Açıklamaların kaynak politikası
- Kökler yapay zekâ tarafından belirlenmez; Corpus verisinden alınır. `scripts/check_data.py`, açıklamadaki her kökün o ayette gerçekten bulunduğunu doğrular.
- "Kur'an'ı Kur'an'a sor" bölümündeki her referansın gerçek bir ayet olduğu otomatik doğrulanır.
- Hadis veya tefsir metni alıntılanmaz; tefsir görüşlerine yalnız genel ifadeyle ("klasik tefsir ... açıklar") değinilir ve kaynak bağlantısı verilir.

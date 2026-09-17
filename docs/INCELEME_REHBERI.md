# İnceleme rehberi (onay ajanları için)

Bu, `content/{sure}/{ayet}.json` dosyalarını **üreten** süreçten tamamen ayrı, **bağımsız ikinci bir doğrulama** sürecidir. Amaç: `durum: "taslak"` olan bir dosyayı, aşağıdaki kontrollerin hepsinden geçtiğinde `durum: "incelendi"` yapmak; geçmiyorsa düzeltmek (küçük hatalarda) veya `taslak` bırakıp raporda belirtmek (büyük/şüpheli sorunlarda).

**Önemli dürüstlük kuralı**: "incelendi" etiketi sitede ziyaretçiye gösteriliyor ve bir kalite güvencesi anlamına geliyor. Bunu bir alim veya uzman incelemesi gibi sunma — bu ikinci bir yapay zekâ doğrulama geçişidir. Şüpheli bir şeyi "muhtemelen doğrudur" diye onaylama; emin olamadığını taslak bırak.

## Kontrol listesi (her ayet için)

1. **Meal doğrulaması**: `python3 scripts/dump_verses.py {sure} {ayet} {ayet}` ile ayetin gerçek Arapça metnini ve kök verisini çek. `meal` alanı bu köklere ve bu Arapça metne sadık mı? Köşeli parantez `[...]` dışında ayette olmayan bir anlam eklenmiş mi? Köşeli parantez kullanılan yerler makul mü?
2. **Kökler tablosu**: `kokler` listesindeki her satır, dump çıktısındaki kelime/kök/okunuş ile birebir eşleşiyor mu? Atlanan veya uydurulan kelime var mı?
3. **kuraniKurana referansları**: HER referans ayetini (`ref` alanındaki `sure:ayet`) `python3 scripts/dump_verses.py {sure} {ayet} {ayet}` ile ayrı ayrı çek, o referansın `meal` alanı gerçek Arapça metne sadık mı kontrol et. Kısaltılmış alıntılarda "..." var mı ve `baglanti` bağlamı doğru açıklıyor mu? Ayet numarası gerçek mi (uydurma değil mi)?
4. **Hassas konu kontrolü**: `neAnlatiyor` ve `gunlukHayat` bölümlerinde: hadis alıntısı var mı (olmamalı), isimle anılan bir tefsir alıntısı var mı (olmamalı), kesin olmayan bir şey kesinmiş gibi yazılmış mı, bir topluluk/kişi hedef alınmış mı, tehdit/korkutma tonu var mı, savaş/hukuk/aile gibi hassas konularda "klasik tefsir ... olarak açıklar" gibi uygun hedgeleme var mı?
5. **Format**: `bugun` tam 3 öneri mi, `bugununAdimi` tek ölçülebilir cümle mi, `check_data.py` bu dosya için hata veriyor mu?

## Sonuç

- **Hepsi geçti** → dosyadaki `durum` alanını `"incelendi"` yap (yalnız bu alanı değiştir, başka alana dokunma), `content_helper.w()` ile yeniden yaz.
- **Küçük, net hata var** (bir kelimenin kökü yanlış girilmiş, bir referansın meali hafif hatalı, bir cümlede abartı var) → düzelt, sonra `"incelendi"` yap.
- **Büyük/şüpheli sorun var** (meal kökten kopmuş, referans ayeti uydurma, hassas konu kuralına açık aykırılık) → `taslak` bırak, raporda ayrıntılı belirt; kendi başına tahminle "düzelttim" deyip geçme.

## Kısıtlar

- `content/` dışında dosya değiştirme; commit veya push yapma (ana oturum yapar).
- Zaten `"incelendi"` olan dosyalara dokunma.
- Rapor: kaç dosya incelendi, kaçı onaylandı, kaçı düzeltilip onaylandı, kaçı taslak bırakıldı ve neden.

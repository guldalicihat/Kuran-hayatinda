/** Dış bağlantılar tek yerden okunur (tasarım: docs/IYILIK_KOPRUSU_TASARIM.md §10, §18). */
export const BAGLANTILAR = {
  telegramKanal: 'https://t.me/kuranhayatimda',
  telegramBot: 'https://t.me/iyilikkoprusu_bot',
  x: 'https://x.com/kuranhayatimda',
  // Mağaza adresleri: uygulamalar yayına girince doldurulur. Boşken "Uygulamayı indir" penceresi ve bağlantısı görünmez.
  appStore: '',
  googlePlay: '',
} as const satisfies Record<string, string>

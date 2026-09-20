export interface Chapter { n: number; ad: string; anlam: string; ar: string; tip: 'mekki' | 'medeni'; nuzul: number; ayet: number }
export interface Word { ar: string; kok: string | null; lemma: string | null; tur: string; okunus: string }
export interface Ayah { n: number; ar: string; okunus: string; kelimeler: Word[] }
export interface Surah { n: number; ad: string; ayetler: Ayah[] }
export interface RootEntry { kelime: string; okunus?: string; kok: string; kokAnlam: string; karsilik: string }
export interface CrossRef { ref: string; meal: string; baglanti: string }
export interface Suggestion { baslik: string; aciklama: string }
export interface Source { ad: string; url: string }
export interface Content {
  sure: number; ayet: number; durum: 'taslak' | 'incelendi';
  meal: string; mealNotu?: string;
  kokler: RootEntry[];
  neAnlatiyor: string[];
  kuraniKurana: CrossRef[];
  gunlukHayat: string[];
  bugun: Suggestion[];
  bugununAdimi: string;
  kaynaklar?: Source[];
}
export type ContentIndex = Record<string, number[]>
export type MealMap = Record<string, string>
export type SearchRow = [number, number, string]
export type ContentSearchRow = [sure: number, ayet: number, meal: string, extra: string]
export interface Topic { id: string; ad: string; ornek: string; anahtar: string[]; ayetler: [sure: number, ayet: number, puan: number][] }
export interface TopicsData { konular: Topic[]; ayetler: Record<string, { d: 'taslak' | 'incelendi'; b: string }> }

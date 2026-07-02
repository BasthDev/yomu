// utils/books.ts

/**
 * Tipe data status perilisan novel
 */
export type BookStatus = "Ongoing" | "Completed" | "Hiatus";

/**
 * Interface untuk detail satu buah Bab / Chapter Novel
 */
export interface ChapterItem {
  id: string;
  bookId: string; // Relasi ke ID Buku
  chapterNumber: number; // Urutan bab (misal: 1, 2, 3)
  title: string; // Judul bab (misal: "The Beginning")
  content: string; // Teks isi cerita novel panjang
  createdAt: string; // Tanggal rilis bab
  releasedAt: string; // Tanggal rilis untuk perhitungan auto-unlock (2 hari)
  isLocked?: boolean; // Set on each chapter in data; true = needs coins or 2-day wait
  isFree?: boolean; // Bab gratis (tidak perlu koin)
}

/**
 * Interface untuk komentar pembaca pada novel
 */
export interface CommentItem {
  id: string;
  bookId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  comment: string;
  createdAt: string;
  likesCount: number;
}

/**
 * Interface Utama untuk Data Satu Buah Buku / Novel (Sangat Lengkap)
 */
export interface BookItem {
  id: string;
  title: string;
  description: string;
  genre: string[]; // Diubah jadi Array agar manipulasi filter kategori/chips lebih mudah & akurat
  banner: string; // URL gambar lanskap untuk Hero Slider
  cover: string; // URL gambar potret untuk Grid Card
  isHot: boolean; // Penanda novel sedang tren
  status: BookStatus; // Menggunakan tipe data khusus (Ongoing/Completed)
  rating: number; // Diubah jadi Number agar bisa dihitung rata-ratanya matematik (misal: 4.85)
  author: string; // Nama penulis novel
  authorId: string; // ID penulis untuk sistem dompet koin
  isFree: boolean; // Buku gratis (tidak perlu koin untuk membaca)
  viewsCount: number; // Statistik total pembaca (misal: 15400)
  favoritesCount: number; // Jumlah pengguna yang menyimpan ke pustaka
  createdAt: string; // Tanggal rilis pertama
  updatedAt: string; // Tanggal pembaruan bab terakhir
  chaptersList?: ChapterItem[]; // Array berisi daftar bab di dalam novel ini
  comments?: CommentItem[]; // Array komentar komunitas pembaca
}

/**
 * Interface untuk Riwayat Baca Pengguna (History / Library)
 */
export interface ReadingHistoryItem {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  lastReadChapterId: string;
  lastReadChapterNumber: number;
  lastReadChapterTitle: string;
  progressPercentage: number; // Progres gulir layar terakhir pengguna (0 - 100)
  updatedAt: string;
}

// ==========================================
// INTERFACE PROPS UNTUK KOMPONEN UI
// ==========================================

/**
 * Props untuk komponen HeroSlider
 */
export interface HeroSliderProps {
  data: BookItem[];
  onPress?: (item: BookItem) => void;
}

/**
 * Props untuk komponen BookGridCard
 */
export interface BookGridCardProps {
  item: BookItem;
  onPress?: (item: BookItem) => void;
}

/**
 * Props untuk komponen ChapterNavigation (Layar Baca)
 */
export interface ChapterNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentChapterNumber: number; // Menampilkan angka bab aktif pada tombol
}

/**
 * Props untuk komponen CustomHeader
 */
export interface CustomHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  onFilterPress?: () => void;
  selectedFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  notificationsCount?: number;
  hideIcons?: boolean;
}

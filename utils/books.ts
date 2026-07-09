// utils/books.ts

/**
 * Novel release status data type
 */
export type BookStatus = "Ongoing" | "Completed" | "Hiatus";

/**
 * Interface for the details of a single Chapter
 */
export interface ChapterItem {
  id: string;
  bookId: string; // Relation to Book ID
  chapterNumber: number; // Chapter order (e.g.: 1, 2, 3)
  title: string; // Chapter title (e.g.: "The Beginning")
  content: string; // Full novel story text content
  createdAt: string; // Chapter release date
  releasedAt: string; // Release date for auto-unlock calculation (2 days)
  isLocked?: boolean; // Set on each chapter in data; true = needs coins or 2-day wait
  isFree?: boolean; // Free chapter (no coins needed)
  comments?: CommentItem[]; // Comments specific to this chapter
}

/**
 * Interface for reader comments on the novel
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
 * Main Interface for Data of a Single Book / Novel (Very Complete)
 */
export interface BookItem {
  id: string;
  title: string;
  description: string;
  genre: string[]; // Changed to Array for easier & more accurate category/chip filter manipulation
  banner: string; // URL of landscape image for Hero Slider
  cover: string; // URL of portrait image for Grid Card
  isHot: boolean; // Trending novel flag
  status: BookStatus; // Using special data type (Ongoing/Completed)
  rating: number; // Changed to Number for mathematical average calculation (e.g.: 4.85)
  author: string; // Novel author name
  authorId: string; // Author ID for coin wallet system
  isFree: boolean; // Free book (no coins needed to read)
  viewsCount: number; // Total reader statistics (e.g.: 15400)
  favoritesCount: number; // Number of users who saved to library
  createdAt: string; // First release date
  updatedAt: string; // Last chapter update date
  chaptersList?: ChapterItem[]; // Array containing list of chapters in this novel
  comments?: CommentItem[]; // Array of reader community comments
}

/**
 * Interface for User Reading History (History / Library)
 */
export interface ReadingHistoryItem {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  lastReadChapterId: string;
  lastReadChapterNumber: number;
  lastReadChapterTitle: string;
  progressPercentage: number; // User's last screen scroll progress (0 - 100)
  updatedAt: string;
}

// ==========================================
// INTERFACE PROPS FOR UI COMPONENTS
// ==========================================

/**
 * Props for HeroSlider component
 */
export interface HeroSliderProps {
  data: BookItem[];
  onPress?: (item: BookItem) => void;
}

/**
 * Props for BookGridCard component
 */
export interface BookGridCardProps {
  item: BookItem;
  onPress?: (item: BookItem) => void;
}

/**
 * Props for ChapterNavigation component (Reading Screen)
 */
export interface ChapterNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentChapterNumber: number; // Displays the active chapter number on button
}

/**
 * Props for CustomHeader component
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

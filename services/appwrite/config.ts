import { Client, Databases, Storage } from "appwrite";

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "",
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || "",
};

// Export database ID for convenience
export const DATABASE_ID = APPWRITE_CONFIG.databaseId;

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);

// Collection IDs as constants
export const COLLECTIONS = {
  // User & Authentication
  PROFILES: "profiles",
  USER_ROLES: "user_roles",

  // Novels
  NOVELS: "novels",
  VOLUMES: "volumes",
  CHAPTERS: "chapters",
  DRAFT_CHAPTERS: "draft_chapters",

  // Library & Reading
  BOOKMARKS: "bookmarks",
  READING_HISTORY: "reading_history",
  FAVORITES: "favorites",
  LIKES: "likes",
  RATINGS: "ratings",
  REVIEWS: "reviews",

  // Social & Interactions
  COMMENTS: "comments",
  COMMENT_LIKES: "comment_likes",
  FOLLOWINGS: "followings",
  WRITER_FOLLOWERS: "writer_followers",

  // Moderation
  REPORTS: "reports",

  // Notifications
  NOTIFICATIONS: "notifications",
  ANNOUNCEMENTS: "announcements",

  // Categories
  GENRES: "genres",
  NOVEL_GENRES: "novel_genres",
  TAGS: "tags",
  NOVEL_TAGS: "novel_tags",
  COLLECTIONS: "collections",
  COLLECTION_NOVELS: "collection_novels",

  // Achievements & Badges
  ACHIEVEMENTS: "achievements",
  BADGES: "badges",
  READING_STREAKS: "reading_streaks",

  // Economy & Monetization
  COIN_TRANSACTIONS: "coin_transactions",
  PURCHASES: "purchases",
  SUBSCRIPTIONS: "subscriptions",
  AD_WATCHES: "ad_watches",
  PREMIUM_CHAPTERS: "premium_chapters",
  COUPONS: "coupons",
  PROMO_CODES: "promo_codes",

  // Analytics
  READING_STATISTICS: "reading_statistics",
  WRITER_STATISTICS: "writer_statistics",
  DASHBOARD_STATISTICS: "dashboard_statistics",

  // System
  SYSTEM_LOGS: "system_logs",
} as const;

// Storage bucket IDs
// Using single bucket with folder-based organization (free plan limitation)
export const BUCKETS = {
  STORAGE: APPWRITE_CONFIG.bucketId || "6a4ff198003306c34294", // YOMU - STORAGE (from env or fallback)
  // Folder paths for organization
  NOVEL_COVERS: "novel-covers",
  NOVEL_BANNERS: "novel-banners",
  PROFILE_IMAGES: "profile-images",
  CHAPTER_IMAGES: "chapter-images",
  INLINE_IMAGES: "inline-images",
  BANNERS: "banners",
  ADS: "ads",
  AUDIO: "audio",
  VIDEOS: "videos",
  DOCUMENTS: "documents",
  TEMPORARY_UPLOADS: "temporary-uploads",
} as const;

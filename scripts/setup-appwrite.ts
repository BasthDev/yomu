import 'dotenv/config';
import { Client, Databases, Permission, Role } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.EXPO_PUBLIC_APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

// Table schemas with all attributes and indexes
const tableSchemas = [
  // 1. User Profiles
  {
    id: 'profiles',
    name: 'User Profiles',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'display_name', type: 'string', required: true, size: 255 },
      { key: 'bio', type: 'string', required: false, size: 1000 },
      { key: 'avatar_url', type: 'string', required: false, size: 500 },
      { key: 'website', type: 'string', required: false, size: 500 },
      { key: 'social_links', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'unique', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'display_name', type: 'fulltext', attributes: ['display_name'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 2. User Roles
  {
    id: 'user_roles',
    name: 'User Roles',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'role', type: 'enum', required: true, elements: ['reader', 'writer', 'editor', 'moderator', 'admin'] },
      { key: 'assigned_by', type: 'string', required: false, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_role', type: 'unique', attributes: ['user_id', 'role'], orders: ['ASC', 'ASC'] },
      { key: 'role', type: 'key', attributes: ['role'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 3. Novels
  {
    id: 'novels',
    name: 'Novels',
    attributes: [
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'slug', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 5000 },
      { key: 'cover_url', type: 'string', required: false, size: 500 },
      { key: 'banner_url', type: 'string', required: false, size: 500 },
      { key: 'author_id', type: 'string', required: true, size: 255 },
      { key: 'status', type: 'enum', required: true, elements: ['draft', 'ongoing', 'completed', 'hiatus', 'cancelled'], default: 'draft' },
      { key: 'visibility', type: 'enum', required: true, elements: ['public', 'private', 'unlisted', 'password_protected'], default: 'public' },
      { key: 'password', type: 'string', required: false, size: 255 },
      { key: 'is_free', type: 'boolean', required: false, default: false },
      { key: 'views_count', type: 'integer', required: false, default: 0 },
      { key: 'favorites_count', type: 'integer', required: false, default: 0 },
      { key: 'likes_count', type: 'integer', required: false, default: 0 },
      { key: 'ratings_count', type: 'integer', required: false, default: 0 },
      { key: 'average_rating', type: 'float', required: false, default: 0 },
      { key: 'chapters_count', type: 'integer', required: false, default: 0 },
      { key: 'published_at', type: 'datetime', required: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'], orders: ['ASC'] },
      { key: 'author_id', type: 'key', attributes: ['author_id'], orders: ['ASC'] },
      { key: 'status', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'visibility', type: 'key', attributes: ['visibility'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
      { key: 'updated_at', type: 'key', attributes: ['$updatedAt'], orders: ['DESC'] },
      { key: 'views_count', type: 'key', attributes: ['views_count'], orders: ['DESC'] },
      { key: 'average_rating', type: 'key', attributes: ['average_rating'], orders: ['DESC'] },
      { key: 'title', type: 'fulltext', attributes: ['title'], orders: ['ASC'] },
      { key: 'description', type: 'fulltext', attributes: ['description'], orders: ['ASC'] },
    ],
  },
  // 4. Volumes
  {
    id: 'volumes',
    name: 'Volumes',
    attributes: [
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'volume_number', type: 'integer', required: true },
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 5000 },
      { key: 'cover_url', type: 'string', required: false, size: 500 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'novel_id_volume', type: 'unique', attributes: ['novel_id', 'volume_number'], orders: ['ASC', 'ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['ASC'] },
    ],
  },
  // 5. Chapters
  {
    id: 'chapters',
    name: 'Chapters',
    attributes: [
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'volume_id', type: 'string', required: false, size: 255 },
      { key: 'chapter_number', type: 'integer', required: true },
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'slug', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: false, size: 100000 },
      { key: 'notes', type: 'string', required: false, size: 1000 },
      { key: 'status', type: 'enum', required: true, elements: ['draft', 'scheduled', 'published', 'archived'], default: 'draft' },
      { key: 'visibility', type: 'enum', required: true, elements: ['public', 'private', 'password_protected'], default: 'public' },
      { key: 'password', type: 'string', required: false, size: 255 },
      { key: 'is_free', type: 'boolean', required: false, default: false },
      { key: 'coins_cost', type: 'integer', required: false, default: 0 },
      { key: 'words_count', type: 'integer', required: false, default: 0 },
      { key: 'reading_time', type: 'integer', required: false, default: 0 },
      { key: 'views_count', type: 'integer', required: false, default: 0 },
      { key: 'likes_count', type: 'integer', required: false, default: 0 },
      { key: 'published_at', type: 'datetime', required: false },
      { key: 'scheduled_at', type: 'datetime', required: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'novel_id_chapter', type: 'unique', attributes: ['novel_id', 'chapter_number'], orders: ['ASC', 'ASC'] },
      { key: 'slug', type: 'key', attributes: ['slug'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'volume_id', type: 'key', attributes: ['volume_id'], orders: ['ASC'] },
      { key: 'status', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'published_at', type: 'key', attributes: ['published_at'], orders: ['DESC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
      { key: 'title', type: 'fulltext', attributes: ['title'], orders: ['ASC'] },
    ],
  },
  // 6. Draft Chapters
  {
    id: 'draft_chapters',
    name: 'Draft Chapters',
    attributes: [
      { key: 'chapter_id', type: 'string', required: true, size: 255 },
      { key: 'author_id', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: false, size: 100000 },
      { key: 'version', type: 'integer', required: false, default: 1 },
      { key: 'version_history', type: 'json', required: false, default: '[]' },
    ],
    indexes: [
      { key: 'chapter_id', type: 'unique', attributes: ['chapter_id'], orders: ['ASC'] },
      { key: 'author_id', type: 'key', attributes: ['author_id'], orders: ['ASC'] },
      { key: 'updated_at', type: 'key', attributes: ['$updatedAt'], orders: ['DESC'] },
    ],
  },
  // 7. Bookmarks
  {
    id: 'bookmarks',
    name: 'Bookmarks',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'chapter_id', type: 'string', required: false, size: 255 },
      { key: 'position', type: 'integer', required: false, default: 0 },
      { key: 'note', type: 'string', required: false, size: 1000 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel', type: 'unique', attributes: ['user_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 8. Reading History
  {
    id: 'reading_history',
    name: 'Reading History',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'chapter_id', type: 'string', required: true, size: 255 },
      { key: 'last_position', type: 'integer', required: false, default: 0 },
      { key: 'last_read_at', type: 'datetime', required: false },
      { key: 'total_read_time', type: 'integer', required: false, default: 0 },
      { key: 'is_completed', type: 'boolean', required: false, default: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel_chapter', type: 'unique', attributes: ['user_id', 'novel_id', 'chapter_id'], orders: ['ASC', 'ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'last_read_at', type: 'key', attributes: ['last_read_at'], orders: ['DESC'] },
    ],
  },
  // 9. Favorites
  {
    id: 'favorites',
    name: 'Favorites',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel', type: 'unique', attributes: ['user_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 10. Likes
  {
    id: 'likes',
    name: 'Likes',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel', type: 'unique', attributes: ['user_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 11. Ratings
  {
    id: 'ratings',
    name: 'Ratings',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'rating', type: 'integer', required: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel', type: 'unique', attributes: ['user_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'rating', type: 'key', attributes: ['rating'], orders: ['DESC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 12. Reviews
  {
    id: 'reviews',
    name: 'Reviews',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'rating', type: 'integer', required: true },
      { key: 'content', type: 'string', required: false, size: 5000 },
      { key: 'likes_count', type: 'integer', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_novel', type: 'unique', attributes: ['user_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 13. Comments
  {
    id: 'comments',
    name: 'Comments',
    attributes: [
      { key: 'chapter_id', type: 'string', required: true, size: 255 },
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: true, size: 2000 },
      { key: 'parent_comment_id', type: 'string', required: false, size: 255 },
      { key: 'likes_count', type: 'integer', required: false, default: 0 },
      { key: 'replies_count', type: 'integer', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'chapter_id', type: 'key', attributes: ['chapter_id'], orders: ['ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'parent_comment_id', type: 'key', attributes: ['parent_comment_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 14. Comment Likes
  {
    id: 'comment_likes',
    name: 'Comment Likes',
    attributes: [
      { key: 'comment_id', type: 'string', required: true, size: 255 },
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'comment_id_user', type: 'unique', attributes: ['comment_id', 'user_id'], orders: ['ASC', 'ASC'] },
      { key: 'comment_id', type: 'key', attributes: ['comment_id'], orders: ['ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
    ],
  },
  // 15. Reports
  {
    id: 'reports',
    name: 'Reports',
    attributes: [
      { key: 'reporter_id', type: 'string', required: true, size: 255 },
      { key: 'target_type', type: 'enum', required: true, elements: ['novel', 'chapter', 'comment', 'user'] },
      { key: 'target_id', type: 'string', required: true, size: 255 },
      { key: 'reason', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'status', type: 'enum', required: true, elements: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
      { key: 'moderator_id', type: 'string', required: false, size: 255 },
      { key: 'moderator_notes', type: 'string', required: false, size: 1000 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
      { key: 'reviewed_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'target', type: 'key', attributes: ['target_type', 'target_id'], orders: ['ASC', 'ASC'] },
      { key: 'status', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 16. Notifications
  {
    id: 'notifications',
    name: 'Notifications',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'string', required: true, size: 255 },
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: false, size: 1000 },
      { key: 'data', type: 'json', required: false, default: '{}' },
      { key: 'is_read', type: 'boolean', required: false, default: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'is_read', type: 'key', attributes: ['is_read'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 17. Announcements
  {
    id: 'announcements',
    name: 'Announcements',
    attributes: [
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: true, size: 5000 },
      { key: 'priority', type: 'enum', required: true, elements: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'starts_at', type: 'datetime', required: false },
      { key: 'ends_at', type: 'datetime', required: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'is_active', type: 'key', attributes: ['is_active'], orders: ['ASC'] },
      { key: 'priority', type: 'key', attributes: ['priority'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 18. Genres
  {
    id: 'genres',
    name: 'Genres',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'slug', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'icon_url', type: 'string', required: false, size: 500 },
      { key: 'novels_count', type: 'integer', required: false, default: 0 },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'], orders: ['ASC'] },
      { key: 'name', type: 'fulltext', attributes: ['name'], orders: ['ASC'] },
      { key: 'novels_count', type: 'key', attributes: ['novels_count'], orders: ['DESC'] },
    ],
  },
  // 19. Novel Genres
  {
    id: 'novel_genres',
    name: 'Novel Genres',
    attributes: [
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'genre_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'novel_genre', type: 'unique', attributes: ['novel_id', 'genre_id'], orders: ['ASC', 'ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'genre_id', type: 'key', attributes: ['genre_id'], orders: ['ASC'] },
    ],
  },
  // 20. Tags
  {
    id: 'tags',
    name: 'Tags',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'slug', type: 'string', required: true, size: 255 },
      { key: 'novels_count', type: 'integer', required: false, default: 0 },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'], orders: ['ASC'] },
      { key: 'name', type: 'fulltext', attributes: ['name'], orders: ['ASC'] },
      { key: 'novels_count', type: 'key', attributes: ['novels_count'], orders: ['DESC'] },
    ],
  },
  // 21. Novel Tags
  {
    id: 'novel_tags',
    name: 'Novel Tags',
    attributes: [
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'tag_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'novel_tag', type: 'unique', attributes: ['novel_id', 'tag_id'], orders: ['ASC', 'ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'tag_id', type: 'key', attributes: ['tag_id'], orders: ['ASC'] },
    ],
  },
  // 22. Collections
  {
    id: 'collections',
    name: 'Collections',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'cover_url', type: 'string', required: false, size: 500 },
      { key: 'is_public', type: 'boolean', required: false, default: false },
      { key: 'novels_count', type: 'integer', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'is_public', type: 'key', attributes: ['is_public'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 23. Collection Novels
  {
    id: 'collection_novels',
    name: 'Collection Novels',
    attributes: [
      { key: 'collection_id', type: 'string', required: true, size: 255 },
      { key: 'novel_id', type: 'string', required: true, size: 255 },
      { key: 'order', type: 'integer', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'collection_novel', type: 'unique', attributes: ['collection_id', 'novel_id'], orders: ['ASC', 'ASC'] },
      { key: 'collection_id', type: 'key', attributes: ['collection_id'], orders: ['ASC'] },
      { key: 'novel_id', type: 'key', attributes: ['novel_id'], orders: ['ASC'] },
      { key: 'order', type: 'key', attributes: ['order'], orders: ['ASC'] },
    ],
  },
  // 24. Followings
  {
    id: 'followings',
    name: 'Followings',
    attributes: [
      { key: 'follower_id', type: 'string', required: true, size: 255 },
      { key: 'following_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'follower_following', type: 'unique', attributes: ['follower_id', 'following_id'], orders: ['ASC', 'ASC'] },
      { key: 'follower_id', type: 'key', attributes: ['follower_id'], orders: ['ASC'] },
      { key: 'following_id', type: 'key', attributes: ['following_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 25. Writer Followers
  {
    id: 'writer_followers',
    name: 'Writer Followers',
    attributes: [
      { key: 'writer_id', type: 'string', required: true, size: 255 },
      { key: 'follower_id', type: 'string', required: true, size: 255 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'writer_follower', type: 'unique', attributes: ['writer_id', 'follower_id'], orders: ['ASC', 'ASC'] },
      { key: 'writer_id', type: 'key', attributes: ['writer_id'], orders: ['ASC'] },
      { key: 'follower_id', type: 'key', attributes: ['follower_id'], orders: ['ASC'] },
    ],
  },
  // 26. Achievements
  {
    id: 'achievements',
    name: 'Achievements',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'string', required: true, size: 255 },
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'icon_url', type: 'string', required: false, size: 500 },
      { key: 'points', type: 'integer', required: false, default: 0 },
      { key: 'is_unlocked', type: 'boolean', required: false, default: false },
      { key: 'unlocked_at', type: 'datetime', required: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_type', type: 'unique', attributes: ['user_id', 'type'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'is_unlocked', type: 'key', attributes: ['is_unlocked'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 27. Badges
  {
    id: 'badges',
    name: 'Badges',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'icon_url', type: 'string', required: false, size: 500 },
      { key: 'criteria', type: 'string', required: false, size: 1000 },
      { key: 'points', type: 'integer', required: false, default: 0 },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'name', type: 'key', attributes: ['name'], orders: ['ASC'] },
      { key: 'is_active', type: 'key', attributes: ['is_active'], orders: ['ASC'] },
    ],
  },
  // 28. Reading Streaks
  {
    id: 'reading_streaks',
    name: 'Reading Streaks',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'current_streak', type: 'integer', required: false, default: 0 },
      { key: 'longest_streak', type: 'integer', required: false, default: 0 },
      { key: 'last_read_date', type: 'datetime', required: false },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'unique', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'current_streak', type: 'key', attributes: ['current_streak'], orders: ['DESC'] },
      { key: 'longest_streak', type: 'key', attributes: ['longest_streak'], orders: ['DESC'] },
    ],
  },
  // 29. Coin Transactions
  {
    id: 'coin_transactions',
    name: 'Coin Transactions',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'enum', required: true, elements: ['earned', 'spent', 'received', 'purchased', 'bonus'] },
      { key: 'amount', type: 'integer', required: true },
      { key: 'balance_after', type: 'integer', required: true },
      { key: 'description', type: 'string', required: false, size: 500 },
      { key: 'metadata', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'type', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 30. Purchases
  {
    id: 'purchases',
    name: 'Purchases',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'enum', required: true, elements: ['coins', 'subscription', 'chapter'] },
      { key: 'item_id', type: 'string', required: true, size: 255 },
      { key: 'amount', type: 'integer', required: true },
      { key: 'currency', type: 'string', required: false, size: 10, default: 'usd' },
      { key: 'transaction_id', type: 'string', required: false, size: 255 },
      { key: 'status', type: 'enum', required: true, elements: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
      { key: 'metadata', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'type', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'status', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'transaction_id', type: 'key', attributes: ['transaction_id'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 31. Subscriptions
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'plan', type: 'enum', required: true, elements: ['basic', 'premium', 'pro'] },
      { key: 'status', type: 'enum', required: true, elements: ['inactive', 'active', 'cancelled', 'expired'], default: 'inactive' },
      { key: 'starts_at', type: 'datetime', required: true },
      { key: 'ends_at', type: 'datetime', required: true },
      { key: 'auto_renew', type: 'boolean', required: false, default: false },
      { key: 'metadata', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'unique', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'status', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'ends_at', type: 'key', attributes: ['ends_at'], orders: ['ASC'] },
    ],
  },
  // 32. Ad Watches
  {
    id: 'ad_watches',
    name: 'Ad Watches',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'ad_type', type: 'string', required: true, size: 255 },
      { key: 'coins_earned', type: 'integer', required: true },
      { key: 'metadata', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'watched_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 33. Premium Chapters
  {
    id: 'premium_chapters',
    name: 'Premium Chapters',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'chapter_id', type: 'string', required: true, size: 255 },
      { key: 'coins_spent', type: 'integer', required: false, default: 0 },
      { key: 'unlock_method', type: 'enum', required: true, elements: ['coins', 'wait', 'subscription', 'promo'], default: 'coins' },
      { key: 'metadata', type: 'json', required: false, default: '{}' },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_chapter', type: 'unique', attributes: ['user_id', 'chapter_id'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'chapter_id', type: 'key', attributes: ['chapter_id'], orders: ['ASC'] },
      { key: 'unlocked_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 34. Coupons
  {
    id: 'coupons',
    name: 'Coupons',
    attributes: [
      { key: 'code', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'enum', required: true, elements: ['fixed_amount', 'percentage', 'free_chapters', 'free_coins'] },
      { key: 'value', type: 'integer', required: true },
      { key: 'max_uses', type: 'integer', required: false },
      { key: 'used_count', type: 'integer', required: false, default: 0 },
      { key: 'starts_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'code', type: 'unique', attributes: ['code'], orders: ['ASC'] },
      { key: 'is_active', type: 'key', attributes: ['is_active'], orders: ['ASC'] },
      { key: 'expires_at', type: 'key', attributes: ['expires_at'], orders: ['ASC'] },
    ],
  },
  // 35. Promo Codes
  {
    id: 'promo_codes',
    name: 'Promo Codes',
    attributes: [
      { key: 'code', type: 'string', required: true, size: 255 },
      { key: 'type', type: 'enum', required: true, elements: ['fixed_amount', 'percentage', 'free_chapters', 'free_coins'] },
      { key: 'value', type: 'integer', required: true },
      { key: 'max_uses', type: 'integer', required: false },
      { key: 'used_count', type: 'integer', required: false, default: 0 },
      { key: 'starts_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'is_active', type: 'boolean', required: false, default: true },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'code', type: 'unique', attributes: ['code'], orders: ['ASC'] },
      { key: 'is_active', type: 'key', attributes: ['is_active'], orders: ['ASC'] },
    ],
  },
  // 36. Reading Statistics
  {
    id: 'reading_statistics',
    name: 'Reading Statistics',
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'date', type: 'string', required: true, size: 20 }, // Using string for date (YYYY-MM-DD) since Appwrite doesn't have date type
      { key: 'chapters_read', type: 'integer', required: false, default: 0 },
      { key: 'words_read', type: 'integer', required: false, default: 0 },
      { key: 'reading_time_minutes', type: 'integer', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_date', type: 'unique', attributes: ['user_id', 'date'], orders: ['ASC', 'ASC'] },
      { key: 'user_id', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'date', type: 'key', attributes: ['date'], orders: ['DESC'] },
    ],
  },
  // 37. Writer Statistics
  {
    id: 'writer_statistics',
    name: 'Writer Statistics',
    attributes: [
      { key: 'writer_id', type: 'string', required: true, size: 255 },
      { key: 'date', type: 'string', required: true, size: 20 }, // Using string for date (YYYY-MM-DD)
      { key: 'views', type: 'integer', required: false, default: 0 },
      { key: 'new_favorites', type: 'integer', required: false, default: 0 },
      { key: 'new_chapters', type: 'integer', required: false, default: 0 },
      { key: 'coins_earned', type: 'integer', required: false, default: 0 },
      { key: 'revenue', type: 'float', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'writer_id_date', type: 'unique', attributes: ['writer_id', 'date'], orders: ['ASC', 'ASC'] },
      { key: 'writer_id', type: 'key', attributes: ['writer_id'], orders: ['ASC'] },
      { key: 'date', type: 'key', attributes: ['date'], orders: ['DESC'] },
    ],
  },
  // 38. Dashboard Statistics
  {
    id: 'dashboard_statistics',
    name: 'Dashboard Statistics',
    attributes: [
      { key: 'date', type: 'string', required: true, size: 20 }, // Using string for date (YYYY-MM-DD)
      { key: 'new_users', type: 'integer', required: false, default: 0 },
      { key: 'new_novels', type: 'integer', required: false, default: 0 },
      { key: 'new_chapters', type: 'integer', required: false, default: 0 },
      { key: 'total_views', type: 'integer', required: false, default: 0 },
      { key: 'total_revenue', type: 'float', required: false, default: 0 },
      { key: 'is_deleted', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'date', type: 'unique', attributes: ['date'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
  // 39. System Logs
  {
    id: 'system_logs',
    name: 'System Logs',
    attributes: [
      { key: 'level', type: 'enum', required: true, elements: ['debug', 'info', 'warning', 'error'], default: 'info' },
      { key: 'message', type: 'string', required: true, size: 2000 },
      { key: 'context', type: 'json', required: false, default: '{}' },
    ],
    indexes: [
      { key: 'level', type: 'key', attributes: ['level'], orders: ['ASC'] },
      { key: 'created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
    ],
  },
];

// Main setup function
async function setupAppwrite() {
  console.log('🚀 Starting Appwrite setup...');
  console.log('Endpoint:', client.config.endpoint);
  console.log('Project ID:', client.config.project);
  console.log('Database ID:', DATABASE_ID);
  console.log('----------------------------------------');

  for (const schema of tableSchemas) {
    console.log(`\nCreating table: ${schema.name} (${schema.id})`);
    try {
      // Create collection
      const collection = await databases.createCollection({
        databaseId: DATABASE_ID,
        collectionId: schema.id,
        name: schema.name,
        permissions: [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
        documentSecurity: false,
        enabled: true,
      });
      console.log(`✅ Table created: ${schema.id}`);

      // Create attributes
      for (const attr of schema.attributes) {
        try {
          console.log(`  Creating attribute: ${attr.key}`);
          if (attr.type === 'string') {
            await databases.createStringAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              size: (attr as any).size || 255,
              required: attr.required,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              required: attr.required,
              min: (attr as any).min,
              max: (attr as any).max,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              required: attr.required,
              min: (attr as any).min,
              max: (attr as any).max,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              required: attr.required,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              required: attr.required,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'json') {
            // Appwrite uses string attribute to store JSON
            await databases.createStringAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              size: 100000,
              required: attr.required,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          } else if (attr.type === 'enum') {
            await databases.createEnumAttribute({
              databaseId: DATABASE_ID,
              collectionId: schema.id,
              key: attr.key,
              elements: (attr as any).elements,
              required: attr.required,
              xdefault: attr.required ? undefined : (attr as any).default,
              array: false,
            });
          }
          console.log(`  ✅ Attribute created: ${attr.key}`);
        } catch (err: any) {
          if (err.code !== 409) {
            // Ignore already exists errors
            console.error(`  ❌ Error creating ${attr.key}:`, err.message);
            throw err;
          }
        }
      }

      // Wait for attributes to be processed
      console.log('  Waiting for attributes to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create indexes
      for (const idx of schema.indexes) {
        try {
          console.log(`  Creating index: ${idx.key}`);
          await databases.createIndex({
            databaseId: DATABASE_ID,
            collectionId: schema.id,
            key: idx.key,
            type: idx.type as any,
            attributes: idx.attributes,
            orders: idx.orders as any,
          });
          console.log(`  ✅ Index created: ${idx.key}`);
        } catch (err: any) {
          if (err.code !== 409) {
            console.error(`  ❌ Error creating ${idx.key}:`, err.message);
            throw err;
          }
        }
      }
    } catch (err: any) {
      if (err.code === 409) {
        console.log(`ℹ️ Table ${schema.id} already exists`);
      } else {
        console.error(`❌ Error creating ${schema.name}:`, err.message);
        throw err;
      }
    }
  }

  console.log('\n----------------------------------------');
  console.log('✅ Appwrite setup complete!');
}

// Run setup
setupAppwrite().catch(console.error);

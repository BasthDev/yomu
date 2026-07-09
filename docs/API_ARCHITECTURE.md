# YOMU Novel Platform - API Architecture & Folder Structure

## Overview

This document defines the API architecture, Appwrite Functions, and recommended folder structure for the YOMU novel platform.

---

## API Architecture

### RESTful API Principles

- **Stateless**: Each request contains all necessary information
- **Resource-Based**: Endpoints organized around resources
- **Standard Methods**: GET, POST, PUT, PATCH, DELETE
- **Proper Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Versioning**: `/api/v1/` prefix for future compatibility

### API Endpoints

#### Novels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/novels` | List novels (paginated, filtered, sorted) |
| GET | `/api/v1/novels/:id` | Get novel details |
| POST | `/api/v1/novels` | Create novel (writer/admin) |
| PUT | `/api/v1/novels/:id` | Update novel (owner/admin) |
| DELETE | `/api/v1/novels/:id` | Delete novel (owner/admin) |
| GET | `/api/v1/novels/trending` | Get trending novels |
| GET | `/api/v1/novels/recommended` | Get recommended novels |
| GET | `/api/v1/novels/:id/chapters` | List novel chapters |

#### Chapters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chapters/:id` | Get chapter details |
| POST | `/api/v1/chapters` | Create chapter (writer/admin) |
| PUT | `/api/v1/chapters/:id` | Update chapter (owner/admin) |
| DELETE | `/api/v1/chapters/:id` | Delete chapter (owner/admin) |
| POST | `/api/v1/chapters/:id/unlock` | Unlock chapter |
| GET | `/api/v1/chapters/:id/comments` | Get chapter comments |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update current user profile |
| GET | `/api/v1/users/:id` | Get user profile |
| GET | `/api/v1/users/:id/novels` | Get user's novels (writer) |

#### Reading History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reading-history` | Get user's reading history |
| POST | `/api/v1/reading-history` | Add/update reading progress |
| DELETE | `/api/v1/reading-history/:id` | Remove from history |

#### Bookmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookmarks` | Get user's bookmarks |
| POST | `/api/v1/bookmarks` | Add bookmark |
| DELETE | `/api/v1/bookmarks/:id` | Remove bookmark |

#### Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/favorites` | Get user's favorites |
| POST | `/api/v1/favorites` | Add favorite |
| DELETE | `/api/v1/favorites/:id` | Remove favorite |

#### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/comments/:id` | Get comment |
| POST | `/api/v1/comments` | Create comment |
| PUT | `/api/v1/comments/:id` | Update comment (owner/mod/admin) |
| DELETE | `/api/v1/comments/:id` | Delete comment (owner/mod/admin) |
| POST | `/api/v1/comments/:id/like` | Like/unlike comment |
| POST | `/api/v1/comments/:id/replies` | Add reply |

#### Ratings & Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/novels/:id/ratings` | Get novel ratings |
| POST | `/api/v1/novels/:id/ratings` | Add/update rating |
| DELETE | `/api/v1/novels/:id/ratings` | Delete rating |
| GET | `/api/v1/novels/:id/reviews` | Get novel reviews |
| POST | `/api/v1/novels/:id/reviews` | Add review |
| PUT | `/api/v1/novels/:id/reviews/:id` | Update review (owner) |
| DELETE | `/api/v1/novels/:id/reviews/:id` | Delete review (owner/mod/admin) |

#### Coins & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/coins/balance` | Get user's coin balance |
| GET | `/api/v1/coins/transactions` | Get coin transactions |
| POST | `/api/v1/coins/purchase` | Purchase coins |
| POST | `/api/v1/coins/reward` | Earn coins (admin) |
| GET | `/api/v1/subscriptions` | Get subscription plans |
| POST | `/api/v1/subscriptions` | Subscribe to plan |
| PUT | `/api/v1/subscriptions` | Update subscription |
| DELETE | `/api/v1/subscriptions` | Cancel subscription |

#### Genres & Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/genres` | List all genres |
| GET | `/api/v1/genres/:id/novels` | Get novels by genre |
| GET | `/api/v1/tags` | List all tags |
| GET | `/api/v1/tags/:id/novels` | Get novels by tag |

#### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Search novels, chapters, users |
| GET | `/api/v1/search/novels` | Search novels only |
| GET | `/api/v1/search/autocomplete` | Autocomplete suggestions |

#### Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/moderation/queue` | Get moderation queue (mod/admin) |
| PUT | `/api/v1/moderation/queue/:id` | Review moderation item (mod/admin) |
| GET | `/api/v1/moderation/reports` | Get reports (mod/admin) |
| PUT | `/api/v1/moderation/reports/:id` | Review report (mod/admin) |

#### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Get admin dashboard stats |
| GET | `/api/v1/admin/users` | List users (admin) |
| PUT | `/api/v1/admin/users/:id` | Update user (admin) |
| GET | `/api/v1/admin/novels` | List all novels (admin) |
| PUT | `/api/v1/admin/novels/:id` | Moderate novel (admin) |
| GET | `/api/v1/admin/analytics` | Get analytics (admin) |
| GET | `/api/v1/admin/settings` | Get system settings (admin) |
| PUT | `/api/v1/admin/settings` | Update system settings (admin) |

---

## Appwrite Functions

### Serverless Functions

Appwrite Functions handle business logic that shouldn't be in the client app.

#### Function List

1. **novels-create** - Create a new novel
2. **novels-update** - Update novel details
3. **novels-delete** - Delete novel (with cleanup)
4. **chapters-publish** - Publish/schedule chapter
5. **chapters-unlock** - Unlock chapter (coins/wait)
6. **comments-create** - Create comment with moderation checks
7. **ratings-update** - Update novel average rating
8. **coins-transact** - Handle coin transactions
9. **subscriptions-manage** - Manage subscriptions
10. **notifications-send** - Send push/email notifications
11. **analytics-track** - Track analytics events
12. **trending-update** - Update trending novels (cron)
13. **rankings-update** - Update rankings (cron)
14. **backup-database** - Database backup (cron)
15. **cleanup-temporary** - Cleanup temporary files (cron)

### Function Execution Model

- **HTTP Triggers**: REST API endpoints
- **Database Triggers**: On document create/update/delete
- **Schedule Triggers**: Cron jobs
- **Event Triggers**: Custom events

---

## Folder Structure

### Project Root Structure

```
d:\Yomu\
├── .agents/                    # Agent configuration
├── .github/                    # GitHub workflows
├── .vscode/                    # VS Code settings
├── app/                        # Expo Router app (main entry)
├── assets/                     # Static assets
├── components/                 # Reusable UI components
├── context/                    # React Context providers
├── docs/                       # Documentation (you are here)
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
├── plugins/                    # Expo plugins
├── scripts/                    # Build/utility scripts
├── services/                   # API/services layer
├── src/                        # Source code
├── store/                      # Zustand state management
├── .env                        # Environment variables
├── .gitignore                  # Git ignore
├── AGENTS.md                   # Agent documentation
├── app.json                    # Expo configuration
├── clerk-config.json           # Clerk configuration
├── eas.json                    # EAS configuration
├── eslint.config.js            # ESLint config
├── package.json                # Dependencies
├── plan.md                     # Original project plan
├── skills-lock.json            # Agent skills lock
└── tsconfig.json               # TypeScript config
```

### `app/` - Expo Router Structure

```
app/
├── (auth)/                     # Auth flow
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── (tabs)/                     # Main tab navigator
│   ├── _layout.tsx
│   ├── index.tsx               # Home feed
│   ├── browse.tsx              # Browse/search
│   ├── library.tsx             # Library (bookmarks/favorites)
│   ├── history.tsx             # Reading history
│   ├── writer.tsx              # Writer dashboard
│   ├── wallet.tsx              # Coins/payments
│   └── profile.tsx             # User profile
├── book/
│   ├── [id].tsx                # Novel details
│   └── [id]/
│       ├── chapters.tsx        # Chapter list
│       └── reviews.tsx         # Reviews
├── read/
│   └── [chapterId].tsx         # Reader screen
├── comments/
│   └── [chapterId].tsx         # Comments for chapter
├── writer/
│   ├── _layout.tsx
│   ├── novels.tsx              # My novels
│   ├── create-novel.tsx        # Create novel
│   ├── edit-novel/
│   │   └── [id].tsx
│   ├── chapters/
│   │   └── [novelId].tsx
│   ├── create-chapter/
│   │   └── [novelId].tsx
│   ├── edit-chapter/
│   │   └── [id].tsx
│   ├── analytics.tsx           # Writer analytics
│   └── earnings.tsx            # Earnings dashboard
├── admin/
│   ├── _layout.tsx
│   ├── dashboard.tsx           # Admin dashboard
│   ├── users.tsx               # User management
│   ├── novels.tsx              # Novel moderation
│   ├── moderation.tsx          # Moderation queue
│   ├── analytics.tsx           # Platform analytics
│   └── settings.tsx            # System settings
├── _layout.tsx                 # Root layout
└── test-ad.tsx                 # Test ad (existing)
```

### `components/` - Reusable Components

```
components/
├── BonusCoinsModal/
│   └── index.tsx
├── BookListRow/
│   └── index.tsx
├── Card/
│   └── index.tsx
├── ChapterNavigation/
│   └── index.tsx
├── Container/
│   └── index.tsx
├── Content/
│   └── index.tsx
├── Header/
│   └── index.tsx
├── HeroSlider/
│   └── index.tsx
├── SplashScreen/
│   ├── index.tsx
│   └── planTheme.md
├── UnlockModal/
│   └── index.tsx
├── ui/                         # Generic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   ├── Image.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Loading.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   └── index.ts
├── novel/                      # Novel-related components
│   ├── NovelCard.tsx
│   ├── NovelGrid.tsx
│   ├── NovelCover.tsx
│   ├── NovelDetail.tsx
│   ├── ChapterList.tsx
│   ├── ChapterCard.tsx
│   └── index.ts
├── reader/                     # Reader components
│   ├── ReaderView.tsx
│   ├── ReaderControls.tsx
│   ├── ChapterContent.tsx
│   ├── ReadingProgress.tsx
│   └── index.ts
├── comments/                   # Comments components
│   ├── CommentList.tsx
│   ├── CommentItem.tsx
│   ├── CommentForm.tsx
│   └── index.ts
├── writer/                     # Writer components
│   ├── RichTextEditor.tsx
│   ├── ChapterEditor.tsx
│   ├── NovelForm.tsx
│   ├── DraftList.tsx
│   └── index.ts
└── common/                     # Common components
    ├── Avatar.tsx
    ├── RatingStars.tsx
    ├── CoinDisplay.tsx
    └── index.ts
```

### `hooks/` - Custom React Hooks

```
hooks/
├── queries/                    # React Query hooks
│   ├── useBooks.ts
│   ├── useComments.ts
│   ├── useNovel.ts
│   ├── useChapter.ts
│   ├── useUser.ts
│   ├── useReadingHistory.ts
│   ├── useBookmarks.ts
│   ├── useFavorites.ts
│   ├── useCoins.ts
│   └── index.ts
├── useAuth.ts                  # Auth state hook
├── useDebouncedValue.ts
├── useRewardedAd.ts
├── useRewardedInterstitialAd.ts
├── useBonusCoinsPrompt.ts
├── useReadingProgress.ts       # Track reading progress
├── useTheme.ts                 # Theme management
├── useOffline.ts               # Offline reading
├── useLocalStorage.ts          # Local storage wrapper
└── index.ts
```

### `services/` - API & Services Layer

```
services/
├── repositories/
│   └── bookRepository.ts       # (existing)
├── api/                        # API clients
│   ├── client.ts               # Base API client
│   ├── novels.ts
│   ├── chapters.ts
│   ├── users.ts
│   ├── comments.ts
│   ├── coins.ts
│   └── index.ts
├── appwrite/                   # Appwrite integration
│   ├── client.ts
│   ├── database.ts
│   ├── storage.ts
│   ├── functions.ts
│   ├── realtime.ts
│   └── index.ts
├── clerk/                      # Clerk integration
│   ├── client.ts
│   ├── auth.ts
│   └── index.ts
├── analytics/                  # Analytics service
│   ├── track.ts
│   └── index.ts
├── notifications/              # Notifications service
│   ├── push.ts
│   └── index.ts
├── payments/                   # Payment service (future)
│   ├── coins.ts
│   ├── subscriptions.ts
│   └── index.ts
└── storage/                    # Storage service
    ├── upload.ts
    └── index.ts
```

### `store/` - Zustand State Management

```
store/
├── authStore.ts
├── bookRatingsStore.ts
├── bookmarkStore.ts
├── chapterUnlockStore.ts
├── coinStore.ts
├── commentStore.ts
├── ratingStore.ts
├── themeStore.ts
├── readerStore.ts              # Reading state
├── uiStore.ts                  # UI state (modals, etc.)
└── index.ts
```

### `lib/` - Utility Libraries

```
lib/
├── queryClient.ts              # (existing)
├── constants.ts                # App constants
├── types.ts                    # TypeScript type definitions
├── utils.ts                    # Generic utilities
├── validation.ts               # Validation schemas (Zod)
├── formatting.ts               # Number/date formatting
├── storage.ts                  # Storage helpers
├── crypto.ts                   # Encryption utilities
└── index.ts
```

### `src/` - Source Code

```
src/
└── auth/
    └── clerk.tsx               # (existing)
```

### `context/` - React Context

```
context/
├── AdContext.tsx               # (existing)
├── SecurityContext.tsx         # (existing)
├── ThemeContext.tsx            # Theme provider
├── AuthContext.tsx             # Auth provider (wrapper around store)
└── AppwriteContext.tsx         # Appwrite provider
```

### `assets/` - Static Assets

```
assets/
├── fonts/                      # (existing)
│   ├── Audiowide-Regular.ttf
│   ├── Literata-Italic-VariableFont_opsz,wght.ttf
│   ├── Literata-VariableFont_opsz,wght.ttf
│   ├── Lora-Bold.ttf
│   ├── Lora-BoldItalic.ttf
│   ├── Lora-Italic.ttf
│   ├── Lora-Regular.ttf
│   ├── Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf
│   └── Merriweather-VariableFont_opsz,wdth,wght.ttf
├── images/                     # (existing)
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── appLogo.png
│   ├── favicon.png
│   ├── icon.png
│   ├── partial-react-logo.png
│   ├── react-logo.png
│   ├── react-logo@2x.png
│   ├── react-logo@3x.png
│   ├── splash-icon.png
│   ├── yomu-crop.png
│   └── yomu.png
└── icons/                      # Custom icons
    └── (future)
```

### Backend Folder Structure (Future)

For future when we have a separate backend:

```
backend/
├── appwrite/                   # Appwrite configuration
│   ├── collections/            # Collection JSON schemas
│   ├── buckets/                # Bucket configurations
│   ├── functions/              # Appwrite functions
│   │   ├── novels-create/
│   │   ├── chapters-publish/
│   │   └── ...
│   └── appwrite.json
├── prisma/                     # (if we migrate to PostgreSQL)
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── functions/              # Function source code
│   ├── lib/                    # Shared utilities
│   └── types/                  # TypeScript types
└── package.json
```

---

## Data Flow Architecture

### Client-Side Data Flow

```
UI Component → Hook (useQuery/useMutation) 
  → API Client → Appwrite SDK → Network
  → React Query Cache → Zustand Store → UI
```

### Reader Flow

1. User navigates to chapter
2. Check if chapter is unlocked
3. If locked: Show unlock options
4. If unlocked: Load chapter content
5. Track reading progress
6. Auto-save progress periodically
7. Update reading history

### Writer Flow

1. Writer creates novel
2. Draft chapters with rich text editor
3. Auto-save to draft collection
4. Preview chapter
5. Schedule or publish
6. Monitor analytics

---

## Real-Time Architecture

### Real-Time Events

- **novel-updated** - Novel metadata changed
- **chapter-published** - New chapter published
- **comment-added** - New comment posted
- **like-received** - Someone liked your content
- **notification** - New notification received

### Subscription Model

```typescript
// Example real-time subscription
const unsubscribe = appwrite.realtime.subscribe(
  ['collections.novels.documents', 'collections.chapters.documents'],
  (response) => {
    // Handle real-time event
  }
);
```

---

## Caching Strategy

### React Query Cache

- **Novel Lists**: 5 minutes
- **Novel Details**: 1 minute
- **Chapter Content**: 30 minutes (or until unlocked)
- **User Profile**: 10 seconds
- **Reading History**: 30 seconds
- **Comments**: 1 minute

### Offline Support

- **SQLite**: Chapter content, reading history
- **AsyncStorage**: User preferences
- **Expo File System**: Downloaded chapters

---

## Performance Optimization

### Image Optimization

- CDN-based resizing
- WebP format
- Lazy loading with FlashList
- Blurhash placeholders

### Infinite Scroll

- Cursor-based pagination
- Prefetch next page
- Virtualized lists with FlashList

### Code Splitting

- Route-based splitting (Expo Router)
- Component-level lazy loading
- Dynamic imports for heavy features

---

## Testing Strategy

### Unit Tests

- Utility functions
- Store logic
- API client wrappers

### Integration Tests

- Hooks and queries
- Component interactions

### E2E Tests

- Critical user flows
- Authentication
- Payment flows

---

## Deployment Architecture

### Environments

- **Development**: Local Appwrite + Expo Go
- **Staging**: Staging Appwrite + TestFlight/Internal Track
- **Production**: Production Appwrite + App Store/Google Play

### CI/CD Pipeline (GitHub Actions)

1. **Lint & Type Check**
2. **Run Tests**
3. **Build App**
4. **Deploy to EAS** (Expo Application Services)
5. **Submit to Stores** (if production)

---

## Migration Path (Future)

### From Appwrite to Custom Backend

1. **API Compatibility Layer**: Keep same API contract
2. **Database Migration**: Export Appwrite data, import to PostgreSQL
3. **Storage Migration**: Move from Appwrite Storage to S3/R2
4. **Auth Migration**: JWT compatibility
5. **Gradual Rollout**: Canary deployment

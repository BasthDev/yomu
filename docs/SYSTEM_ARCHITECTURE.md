# YOMU Novel Platform - System Architecture

## Overview

YOMU is an industrial-grade novel publishing platform designed to scale to millions of users. It provides a complete ecosystem for readers, writers, editors, moderators, and administrators.

## Architecture Principles

1. **Scalability**: Designed to support millions of concurrent users and content items
2. **Maintainability**: Clean architecture with clear separation of concerns
3. **Security**: Enterprise-grade security with defense in depth
4. **Future-proof**: Easy migration to PostgreSQL, Supabase, AWS, GCP, or microservices
5. **Availability**: High availability with proper caching and redundancy

## Technology Stack

### Frontend (Mobile)
- **Framework**: Expo React Native (Latest SDK)
- **Navigation**: Expo Router
- **State Management**: Zustand + React Query
- **Styling**: NativeWind
- **Form Handling**: React Hook Form
- **Lists**: FlashList

### Backend
- **BaaS**: Appwrite (Self-hosted)
- **Database**: Appwrite Database (Document-oriented)
- **Storage**: Appwrite Storage + Cloudflare R2 (Future)
- **Realtime**: Appwrite Realtime
- **Search**: Appwrite Search (Future: Elasticsearch/Meilisearch)

### Authentication
- **Primary**: Clerk
- **Integration**: Appwrite JWT for backend authorization

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Clients                           │
│                    (Expo React Native Apps)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Appwrite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth API   │  │ Database API │  │  Storage API │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Realtime API  │  │ Functions API│  │  Search API  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌───────────────┐
│   Database    │    │    Storage     │    │   Functions   │
│ (Collections) │    │   (Buckets)    │    │  (Serverless) │
└───────────────┘    └────────────────┘    └───────────────┘
                              │
                              ▼
                    ┌────────────────┐
                    │   Cloudflare   │
                    │      R2        │
                    └────────────────┘
```

## Core Components

### 1. User Management
- **Authentication**: Clerk handles all auth flows
- **Profiles**: User profiles with roles (Reader, Writer, Editor, Moderator, Admin)
- **Wallet**: Coin balance, transactions, subscriptions

### 2. Content Management
- **Novels**: Complete novel metadata and relationships
- **Volumes**: Volume organization for series
- **Chapters**: Draft, scheduled, and published chapters
- **Rich Text**: Full rich text support for chapter content

### 3. Social & Engagement
- **Comments**: Threaded comments with likes
- **Reviews**: Star ratings and written reviews
- **Bookmarks & Favorites**: Reading list management
- **Reading History**: Track reading progress
- **Following**: Follow writers and other users

### 4. Monetization
- **Coins System**: Virtual currency for chapter unlocks
- **Subscriptions**: Premium subscription tiers
- **Author Earnings**: Revenue tracking and payouts
- **Ads Integration**: Rewarded ads for coin earning

### 5. Analytics & Reporting
- **Reader Analytics**: Reading statistics, streaks
- **Writer Analytics**: Views, engagement, earnings
- **Admin Dashboard**: System-wide analytics

### 6. Moderation & Administration
- **Content Moderation**: Report system and moderation queue
- **User Management**: Role and permission management
- **Audit Logs**: Comprehensive audit trail

## Data Flow

### Reader Flow
1. User authenticates via Clerk
2. App fetches novels from Appwrite Database
3. User reads chapters (unlocks with coins or waits)
4. Reading progress is synced
5. User can leave comments, ratings, bookmarks

### Writer Flow
1. Writer creates/edits novels and chapters
2. Rich text editor with auto-save
3. Draft management and version history
4. Chapter scheduling
5. Analytics and earnings dashboard

### Admin Flow
1. Dashboard overview
2. User and content management
3. Moderation tools
4. Analytics and reporting
5. System settings

## Caching Strategy

- **Client-side**: React Query with automatic caching
- **Local Storage**: Expo SQLite for offline reading
- **Server-side**: Appwrite's built-in caching
- **Future**: Redis for distributed caching

## Future Migration Path

The architecture is designed to support migration to:

1. **PostgreSQL**: Collections map directly to tables
2. **Supabase**: Similar BaaS with PostgreSQL under the hood
3. **AWS/GCP/Azure**: Full cloud migration with microservices
4. **Kubernetes**: Container orchestration for high-scale deployments

## Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Components, Screens, Hooks)           │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Use Cases, Repositories)              │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  (Entities, Value Objects)              │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│  (Appwrite, Clerk, SQLite)              │
└─────────────────────────────────────────┘
```

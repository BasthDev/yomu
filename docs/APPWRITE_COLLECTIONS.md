# YOMU Novel Platform - Appwrite Collections Schema

## Overview

This document defines all Appwrite collections for the YOMU novel platform with comprehensive details including attributes, data types, required fields, defaults, indexes, unique constraints, permissions, and example documents.

---

## 1. profiles

**Purpose**: Stores user profile information

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | Clerk user ID (foreign key) |
| display_name | string | Yes | - | User's display name |
| bio | string | No | null | User bio/description |
| avatar_url | string | No | null | Profile image URL |
| website | string | No | null | Personal website |
| social_links | json | No | {} | Social media links (JSON object) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | unique | user_id | ASC |
| display_name | fulltext | display_name | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: team:owner + user:$id
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_1234567890",
  "display_name": "NovelLover42",
  "bio": "I love reading fantasy and romance novels!",
  "avatar_url": "https://example.com/avatar.jpg",
  "website": "https://example.com",
  "social_links": {
    "twitter": "@novellover42",
    "instagram": "@novellover42"
  },
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 2. user_roles

**Purpose**: Manages user roles and permissions

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| role | enum | Yes | - | User role (reader, writer, editor, moderator, admin) |
| assigned_by | string | No | null | Admin who assigned the role |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_role | unique | user_id, role | ASC, ASC |
| role | key | role | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_1234567890",
  "role": "writer",
  "assigned_by": "admin_987654321",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. novels

**Purpose**: Stores novel metadata and information

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | Yes | - | Novel title |
| slug | string | Yes | - | URL-friendly slug |
| description | string | No | null | Novel description |
| cover_url | string | No | null | Cover image URL |
| banner_url | string | No | null | Banner image URL |
| author_id | string | Yes | - | Author's user ID |
| status | enum | Yes | draft | Novel status (draft, ongoing, completed, hiatus, cancelled) |
| visibility | enum | Yes | public | Visibility (public, private, unlisted, password_protected) |
| password | string | No | null | Password hash (for password_protected) |
| is_free | boolean | No | false | Is the novel free to read? |
| views_count | integer | No | 0 | Total views |
| favorites_count | integer | No | 0 | Number of favorites |
| likes_count | integer | No | 0 | Number of likes |
| ratings_count | integer | No | 0 | Number of ratings |
| average_rating | float | No | 0.0 | Average rating (1-5) |
| chapters_count | integer | No | 0 | Number of chapters |
| published_at | datetime | No | null | Publication date |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| slug | unique | slug | ASC |
| author_id | key | author_id | ASC |
| status | key | status | ASC |
| visibility | key | visibility | ASC |
| created_at | key | created_at | DESC |
| updated_at | key | updated_at | DESC |
| views_count | key | views_count | DESC |
| average_rating | key | average_rating | DESC |
| title | fulltext | title | ASC |
| description | fulltext | description | ASC |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "title": "The Hidden Royal Bloodline",
  "slug": "the-hidden-royal-bloodline",
  "description": "An epic fantasy about an ordinary college student who discovers he's the heir to an ancient throne.",
  "cover_url": "https://example.com/cover.jpg",
  "banner_url": "https://example.com/banner.jpg",
  "author_id": "author_12345",
  "status": "ongoing",
  "visibility": "public",
  "password": null,
  "is_free": false,
  "views_count": 154200,
  "favorites_count": 8900,
  "likes_count": 12500,
  "ratings_count": 3420,
  "average_rating": 4.8,
  "chapters_count": 150,
  "published_at": "2024-01-10T08:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-07-02T12:30:00.000Z"
}
```

---

## 4. volumes

**Purpose**: Organizes novels into volumes/books

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| volume_number | integer | Yes | - | Volume number |
| title | string | Yes | - | Volume title |
| description | string | No | null | Volume description |
| cover_url | string | No | null | Volume cover URL |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| novel_id_volume | unique | novel_id, volume_number | ASC, ASC |
| novel_id | key | novel_id | ASC |
| created_at | key | created_at | ASC |

### Permissions

```
create: team:owner + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "volume_number": 1,
  "title": "The Awakening",
  "description": "The first volume of the epic saga.",
  "cover_url": "https://example.com/volume1.jpg",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. chapters

**Purpose**: Stores chapter information

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| volume_id | string | No | null | Volume ID (foreign key) |
| chapter_number | integer | Yes | - | Chapter number |
| title | string | Yes | - | Chapter title |
| slug | string | Yes | - | URL-friendly slug |
| content | string | No | null | Chapter content (rich text) |
| notes | string | No | null | Author notes |
| status | enum | Yes | draft | Chapter status (draft, scheduled, published, archived) |
| visibility | enum | Yes | public | Visibility (public, private, password_protected) |
| password | string | No | null | Password hash (for password_protected) |
| is_free | boolean | No | false | Is the chapter free? |
| coins_cost | integer | No | 0 | Coins required to unlock |
| words_count | integer | No | 0 | Word count |
| reading_time | integer | No | 0 | Estimated reading time (minutes) |
| views_count | integer | No | 0 | Number of views |
| likes_count | integer | No | 0 | Number of likes |
| published_at | datetime | No | null | Publication date |
| scheduled_at | datetime | No | null | Scheduled publication date |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| novel_id_chapter | unique | novel_id, chapter_number | ASC, ASC |
| slug | key | slug | ASC |
| novel_id | key | novel_id | ASC |
| volume_id | key | volume_id | ASC |
| status | key | status | ASC |
| published_at | key | published_at | DESC |
| created_at | key | created_at | DESC |
| title | fulltext | title | ASC |

### Permissions

```
create: team:owner + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "volume_id": "volume_123",
  "chapter_number": 1,
  "title": "The Hidden Royal Bloodline",
  "slug": "chapter-1-the-hidden-royal-bloodline",
  "content": "<p>The valley was deathly silent...</p>",
  "notes": "Author's note: Welcome to the first chapter!",
  "status": "published",
  "visibility": "public",
  "password": null,
  "is_free": true,
  "coins_cost": 0,
  "words_count": 2500,
  "reading_time": 10,
  "views_count": 15000,
  "likes_count": 890,
  "published_at": "2024-01-10T08:00:00.000Z",
  "scheduled_at": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 6. draft_chapters

**Purpose**: Stores draft versions of chapters

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| author_id | string | Yes | - | Author's user ID |
| content | string | No | null | Draft content |
| version | integer | No | 1 | Version number |
| version_history | json | No | [] | Version history |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| chapter_id | unique | chapter_id | ASC |
| author_id | key | author_id | ASC |
| updated_at | key | updated_at | DESC |

### Permissions

```
create: team:owner
read: team:owner + role:admin
update: team:owner
delete: team:owner + role:admin
```

### Example Document

```json
{
  "chapter_id": "chapter_123",
  "author_id": "author_12345",
  "content": "<p>Draft content...</p>",
  "version": 3,
  "version_history": [
    {
      "version": 1,
      "content": "<p>Original draft...</p>",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-03T00:00:00.000Z"
}
```

---

## 7. bookmarks

**Purpose**: Stores user bookmarks

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| chapter_id | string | No | null | Chapter ID (foreign key) |
| position | integer | No | 0 | Reading position |
| note | string | No | null | Personal note |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "chapter_id": "chapter_123",
  "position": 1500,
  "note": "Great cliffhanger!",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 8. reading_history

**Purpose**: Tracks user reading history and progress

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| last_position | integer | No | 0 | Last reading position |
| last_read_at | datetime | No | $now | Last read timestamp |
| total_read_time | integer | No | 0 | Total reading time (seconds) |
| is_completed | boolean | No | false | Is the chapter completed? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel_chapter | unique | user_id, novel_id, chapter_id | ASC, ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| last_read_at | key | last_read_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "chapter_id": "chapter_123",
  "last_position": 2500,
  "last_read_at": "2024-07-05T10:30:00.000Z",
  "total_read_time": 600,
  "is_completed": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-07-05T10:30:00.000Z"
}
```

---

## 9. favorites

**Purpose**: Tracks user's favorite novels

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 10. likes

**Purpose**: Tracks likes on novels

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 11. ratings

**Purpose**: Stores novel ratings

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| rating | integer | Yes | - | Rating (1-5) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| rating | key | rating | DESC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "rating": 5,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 12. reviews

**Purpose**: Stores novel reviews

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| rating | integer | Yes | - | Rating (1-5) |
| content | string | No | null | Review content |
| likes_count | integer | No | 0 | Number of likes |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| novel_id | key | novel_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "rating": 5,
  "content": "This is the best novel I've ever read!",
  "likes_count": 45,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 13. comments

**Purpose**: Stores chapter comments

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| user_id | string | Yes | - | User ID (foreign key) |
| content | string | Yes | - | Comment content |
| parent_comment_id | string | No | null | Parent comment ID (for replies) |
| likes_count | integer | No | 0 | Number of likes |
| replies_count | integer | No | 0 | Number of replies |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| chapter_id | key | chapter_id | ASC |
| user_id | key | user_id | ASC |
| parent_comment_id | key | parent_comment_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: user:$id + role:admin + role:moderator
delete: user:$id + role:admin + role:moderator
```

### Example Document

```json
{
  "chapter_id": "chapter_123",
  "user_id": "user_12345",
  "content": "This chapter was amazing!",
  "parent_comment_id": null,
  "likes_count": 45,
  "replies_count": 3,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 14. comment_likes

**Purpose**: Tracks likes on comments

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| comment_id | string | Yes | - | Comment ID (foreign key) |
| user_id | string | Yes | - | User ID (foreign key) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| comment_id_user | unique | comment_id, user_id | ASC, ASC |
| comment_id | key | comment_id | ASC |
| user_id | key | user_id | ASC |

### Permissions

```
create: role:member
read: role:member
update: role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "comment_id": "comment_123",
  "user_id": "user_12345",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 15. reports

**Purpose**: Stores content reports

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| reporter_id | string | Yes | - | Reporter's user ID |
| target_type | enum | Yes | - | Target type (novel, chapter, comment, user) |
| target_id | string | Yes | - | Target ID |
| reason | string | Yes | - | Report reason |
| description | string | No | null | Additional description |
| status | enum | Yes | pending | Status (pending, reviewed, resolved, dismissed) |
| moderator_id | string | No | null | Moderator who reviewed |
| moderator_notes | string | No | null | Moderator notes |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| reviewed_at | datetime | No | null | Review timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| target | key | target_type, target_id | ASC, ASC |
| status | key | status | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:moderator + role:admin
update: role:moderator + role:admin
delete: role:admin
```

### Example Document

```json
{
  "reporter_id": "user_12345",
  "target_type": "comment",
  "target_id": "comment_123",
  "reason": "inappropriate_content",
  "description": "This comment contains hate speech.",
  "status": "pending",
  "moderator_id": null,
  "moderator_notes": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "reviewed_at": null,
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 16. notifications

**Purpose**: Stores user notifications

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| type | enum | Yes | - | Notification type |
| title | string | Yes | - | Notification title |
| content | string | No | null | Notification content |
| data | json | No | {} | Additional data (JSON) |
| is_read | boolean | No | false | Is the notification read? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| is_read | key | is_read | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "new_chapter",
  "title": "New Chapter Available!",
  "content": "The Hidden Royal Bloodline has a new chapter!",
  "data": {
    "novel_id": "novel_12345",
    "chapter_id": "chapter_456"
  },
  "is_read": false,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 17. announcements

**Purpose**: Stores system announcements

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | Yes | - | Announcement title |
| content | string | Yes | - | Announcement content |
| priority | enum | Yes | normal | Priority (low, normal, high, urgent) |
| is_active | boolean | No | true | Is the announcement active? |
| starts_at | datetime | No | null | Start timestamp |
| ends_at | datetime | No | null | End timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| is_active | key | is_active | ASC |
| priority | key | priority | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "title": "Maintenance Scheduled",
  "content": "The system will undergo maintenance this weekend.",
  "priority": "high",
  "is_active": true,
  "starts_at": "2024-07-10T00:00:00.000Z",
  "ends_at": "2024-07-12T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 18. genres

**Purpose**: Stores novel genres

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | - | Genre name |
| slug | string | Yes | - | URL-friendly slug |
| description | string | No | null | Genre description |
| icon_url | string | No | null | Genre icon URL |
| novels_count | integer | No | 0 | Number of novels in this genre |
| is_active | boolean | No | true | Is the genre active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| slug | unique | slug | ASC |
| name | fulltext | name | ASC |
| novels_count | key | novels_count | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "name": "Fantasy",
  "slug": "fantasy",
  "description": "Epic fantasy novels with magic and adventure.",
  "icon_url": "https://example.com/fantasy-icon.png",
  "novels_count": 150,
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 19. novel_genres

**Purpose**: Junction table for novel-genre relationships

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| genre_id | string | Yes | - | Genre ID (foreign key) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| novel_genre | unique | novel_id, genre_id | ASC, ASC |
| novel_id | key | novel_id | ASC |
| genre_id | key | genre_id | ASC |

### Permissions

```
create: team:owner + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "genre_id": "genre_123",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 20. tags

**Purpose**: Stores novel tags

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | - | Tag name |
| slug | string | Yes | - | URL-friendly slug |
| novels_count | integer | No | 0 | Number of novels with this tag |
| is_active | boolean | No | true | Is the tag active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| slug | unique | slug | ASC |
| name | fulltext | name | ASC |
| novels_count | key | novels_count | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "name": "Magic",
  "slug": "magic",
  "novels_count": 200,
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 21. novel_tags

**Purpose**: Junction table for novel-tag relationships

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| tag_id | string | Yes | - | Tag ID (foreign key) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| novel_tag | unique | novel_id, tag_id | ASC, ASC |
| novel_id | key | novel_id | ASC |
| tag_id | key | tag_id | ASC |

### Permissions

```
create: team:owner + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "tag_id": "tag_123",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 22. collections

**Purpose**: Stores user-created novel collections

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| name | string | Yes | - | Collection name |
| description | string | No | null | Collection description |
| cover_url | string | No | null | Collection cover URL |
| is_public | boolean | No | false | Is the collection public? |
| novels_count | integer | No | 0 | Number of novels in the collection |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| is_public | key | is_public | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin + (role:member && is_public: true)
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "name": "My Favorite Novels",
  "description": "A collection of my all-time favorite novels.",
  "cover_url": "https://example.com/collection.jpg",
  "is_public": true,
  "novels_count": 10,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 23. collection_novels

**Purpose**: Junction table for collection-novel relationships

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| collection_id | string | Yes | - | Collection ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| order | integer | No | 0 | Display order |
| is_deleted | boolean | No | false | Soft delete flag |
| added_at | datetime | Yes | $now | Added timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| collection_novel | unique | collection_id, novel_id | ASC, ASC |
| collection_id | key | collection_id | ASC |
| novel_id | key | novel_id | ASC |
| order | key | order | ASC |

### Permissions

```
create: user:$id + role:admin
read: role:member
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "collection_id": "collection_123",
  "novel_id": "novel_12345",
  "order": 1,
  "is_deleted": false,
  "added_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 24. followings

**Purpose**: Tracks user follow relationships

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| follower_id | string | Yes | - | Follower's user ID |
| following_id | string | Yes | - | Following's user ID |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| follower_following | unique | follower_id, following_id | ASC, ASC |
| follower_id | key | follower_id | ASC |
| following_id | key | following_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: role:member
update: role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "follower_id": "user_12345",
  "following_id": "user_67890",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 25. writer_followers

**Purpose**: Tracks writer followers (for analytics)

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| writer_id | string | Yes | - | Writer's user ID |
| follower_id | string | Yes | - | Follower's user ID |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| writer_follower | unique | writer_id, follower_id | ASC, ASC |
| writer_id | key | writer_id | ASC |
| follower_id | key | follower_id | ASC |

### Permissions

```
create: role:member
read: role:member
update: role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "writer_id": "author_12345",
  "follower_id": "user_12345",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 26. achievements

**Purpose**: Stores user achievements

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| type | string | Yes | - | Achievement type |
| title | string | Yes | - | Achievement title |
| description | string | No | null | Achievement description |
| icon_url | string | No | null | Achievement icon URL |
| points | integer | No | 0 | Points awarded |
| is_unlocked | boolean | No | false | Is the achievement unlocked? |
| unlocked_at | datetime | No | null | Unlock timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_type | unique | user_id, type | ASC, ASC |
| user_id | key | user_id | ASC |
| is_unlocked | key | is_unlocked | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "first_novel",
  "title": "First Novel",
  "description": "Read your first novel!",
  "icon_url": "https://example.com/achievement.png",
  "points": 100,
  "is_unlocked": true,
  "unlocked_at": "2024-01-01T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 27. badges

**Purpose**: Stores badge definitions

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | - | Badge name |
| description | string | No | null | Badge description |
| icon_url | string | No | null | Badge icon URL |
| criteria | string | No | null | Criteria to earn the badge |
| points | integer | No | 0 | Points awarded |
| is_active | boolean | No | true | Is the badge active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| name | key | name | ASC |
| is_active | key | is_active | ASC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "name": "Top Reader",
  "description": "Read 100 novels!",
  "icon_url": "https://example.com/badge.png",
  "criteria": "Read 100 novels",
  "points": 1000,
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 28. reading_streaks

**Purpose**: Tracks user reading streaks

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| current_streak | integer | No | 0 | Current streak (days) |
| longest_streak | integer | No | 0 | Longest streak (days) |
| last_read_date | datetime | No | null | Last read date |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | unique | user_id | ASC |
| current_streak | key | current_streak | DESC |
| longest_streak | key | longest_streak | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "current_streak": 7,
  "longest_streak": 30,
  "last_read_date": "2024-07-05T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 29. coin_transactions

**Purpose**: Tracks coin transactions

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| type | enum | Yes | - | Transaction type (earned, spent, received, purchased, bonus) |
| amount | integer | Yes | - | Amount of coins (can be negative) |
| balance_after | integer | Yes | - | Balance after transaction |
| description | string | No | null | Transaction description |
| metadata | json | No | {} | Additional data (JSON) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| type | key | type | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "earned",
  "amount": 50,
  "balance_after": 150,
  "description": "Daily login bonus",
  "metadata": {},
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 30. purchases

**Purpose**: Tracks purchases

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| type | enum | Yes | - | Purchase type (coins, subscription, chapter) |
| item_id | string | Yes | - | Purchased item ID |
| amount | integer | Yes | - | Amount paid (in cents or coins) |
| currency | string | No | usd | Currency code |
| transaction_id | string | No | null | External transaction ID |
| status | enum | Yes | pending | Status (pending, completed, failed, refunded) |
| metadata | json | No | {} | Additional data (JSON) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| type | key | type | ASC |
| status | key | status | ASC |
| transaction_id | key | transaction_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member + role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "chapter",
  "item_id": "chapter_123",
  "amount": 50,
  "currency": "coins",
  "transaction_id": null,
  "status": "completed",
  "metadata": {
    "novel_id": "novel_12345"
  },
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 31. subscriptions

**Purpose**: Tracks user subscriptions

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| plan | enum | Yes | - | Subscription plan (basic, premium, pro) |
| status | enum | Yes | inactive | Status (inactive, active, cancelled, expired) |
| starts_at | datetime | Yes | - | Subscription start date |
| ends_at | datetime | Yes | - | Subscription end date |
| auto_renew | boolean | No | false | Auto-renewal enabled |
| metadata | json | No | {} | Additional data (JSON) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | unique | user_id | ASC |
| status | key | status | ASC |
| ends_at | key | ends_at | ASC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "plan": "premium",
  "status": "active",
  "starts_at": "2024-01-01T00:00:00.000Z",
  "ends_at": "2025-01-01T00:00:00.000Z",
  "auto_renew": true,
  "metadata": {},
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 32. ad_watches

**Purpose**: Tracks ad views

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| ad_type | string | Yes | - | Ad type |
| coins_earned | integer | Yes | - | Coins earned |
| metadata | json | No | {} | Additional data (JSON) |
| is_deleted | boolean | No | false | Soft delete flag |
| watched_at | datetime | Yes | $now | Watch timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| watched_at | key | watched_at | DESC |

### Permissions

```
create: role:member + role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "ad_type": "rewarded",
  "coins_earned": 10,
  "metadata": {},
  "is_deleted": false,
  "watched_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 33. premium_chapters

**Purpose**: Tracks unlocked premium chapters

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| coins_spent | integer | No | 0 | Coins spent |
| unlock_method | enum | Yes | coins | Unlock method (coins, wait, subscription, promo) |
| metadata | json | No | {} | Additional data (JSON) |
| is_deleted | boolean | No | false | Soft delete flag |
| unlocked_at | datetime | Yes | $now | Unlock timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_chapter | unique | user_id, chapter_id | ASC, ASC |
| user_id | key | user_id | ASC |
| chapter_id | key | chapter_id | ASC |
| unlocked_at | key | unlocked_at | DESC |

### Permissions

```
create: role:member + role:admin
read: user:$id + role:admin
update: role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "chapter_id": "chapter_123",
  "coins_spent": 50,
  "unlock_method": "coins",
  "metadata": {},
  "is_deleted": false,
  "unlocked_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 34. coupons

**Purpose**: Stores coupon codes

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| code | string | Yes | - | Coupon code |
| type | enum | Yes | - | Coupon type (fixed_amount, percentage, free_chapters, free_coins) |
| value | integer | Yes | - | Coupon value |
| max_uses | integer | No | null | Maximum uses (null = unlimited) |
| used_count | integer | No | 0 | Number of times used |
| starts_at | datetime | No | null | Start timestamp |
| expires_at | datetime | No | null | Expiration timestamp |
| is_active | boolean | No | true | Is the coupon active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| code | unique | code | ASC |
| is_active | key | is_active | ASC |
| expires_at | key | expires_at | ASC |

### Permissions

```
create: role:admin
read: role:member + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "code": "WELCOME100",
  "type": "free_coins",
  "value": 100,
  "max_uses": 1000,
  "used_count": 500,
  "starts_at": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-12-31T00:00:00.000Z",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 35. promo_codes

**Purpose**: Stores promo codes (similar to coupons but different use case)

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| code | string | Yes | - | Promo code |
| type | enum | Yes | - | Promo type |
| value | integer | Yes | - | Promo value |
| max_uses | integer | No | null | Maximum uses |
| used_count | integer | No | 0 | Number of times used |
| starts_at | datetime | No | null | Start timestamp |
| expires_at | datetime | No | null | Expiration timestamp |
| is_active | boolean | No | true | Is the promo active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| code | unique | code | ASC |
| is_active | key | is_active | ASC |

### Permissions

```
create: role:admin
read: role:member + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "code": "SUMMERSALE",
  "type": "percentage",
  "value": 50,
  "max_uses": null,
  "used_count": 100,
  "starts_at": "2024-06-01T00:00:00.000Z",
  "expires_at": "2024-08-31T00:00:00.000Z",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 36. reading_statistics

**Purpose**: Daily reading statistics per user

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| date | date | Yes | - | Statistics date |
| chapters_read | integer | No | 0 | Number of chapters read |
| words_read | integer | No | 0 | Number of words read |
| reading_time_minutes | integer | No | 0 | Reading time (minutes) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_date | unique | user_id, date | ASC, ASC |
| user_id | key | user_id | ASC |
| date | key | date | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "date": "2024-07-05",
  "chapters_read": 5,
  "words_read": 12500,
  "reading_time_minutes": 50,
  "is_deleted": false,
  "created_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 37. writer_statistics

**Purpose**: Daily writer statistics

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| writer_id | string | Yes | - | Writer's user ID |
| date | date | Yes | - | Statistics date |
| views | integer | No | 0 | Total views |
| new_favorites | integer | No | 0 | New favorites |
| new_chapters | integer | No | 0 | New chapters published |
| coins_earned | integer | No | 0 | Coins earned |
| revenue | float | No | 0.0 | Revenue earned |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| writer_id_date | unique | writer_id, date | ASC, ASC |
| writer_id | key | writer_id | ASC |
| date | key | date | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "writer_id": "author_12345",
  "date": "2024-07-05",
  "views": 5000,
  "new_favorites": 50,
  "new_chapters": 1,
  "coins_earned": 1000,
  "revenue": 10.50,
  "is_deleted": false,
  "created_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 38. dashboard_statistics

**Purpose**: Daily platform-wide statistics

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| date | date | Yes | - | Statistics date |
| new_users | integer | No | 0 | New users |
| new_novels | integer | No | 0 | New novels |
| new_chapters | integer | No | 0 | New chapters |
| total_views | integer | No | 0 | Total views |
| total_revenue | float | No | 0.0 | Total revenue |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| date | unique | date | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "date": "2024-07-05",
  "new_users": 100,
  "new_novels": 10,
  "new_chapters": 50,
  "total_views": 100000,
  "total_revenue": 1500.00,
  "is_deleted": false,
  "created_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 39. system_logs

**Purpose**: System logs

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| level | enum | Yes | info | Log level (debug, info, warn, error, fatal) |
| message | string | Yes | - | Log message |
| metadata | json | No | {} | Additional data (JSON) |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| level | key | level | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "level": "info",
  "message": "User logged in",
  "metadata": {
    "user_id": "user_12345"
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 40. audit_logs

**Purpose**: Audit logs for tracking changes

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | No | null | User ID (foreign key) |
| action | string | Yes | - | Action performed |
| resource_type | string | Yes | - | Resource type |
| resource_id | string | Yes | - | Resource ID |
| old_values | json | No | null | Old values (JSON) |
| new_values | json | No | null | New values (JSON) |
| ip_address | string | No | null | IP address |
| user_agent | string | No | null | User agent |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| resource | key | resource_type, resource_id | ASC, ASC |
| action | key | action | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "action": "update",
  "resource_type": "novel",
  "resource_id": "novel_12345",
  "old_values": {
    "title": "Old Title"
  },
  "new_values": {
    "title": "New Title"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 41. activity_logs

**Purpose**: User activity logs

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| type | string | Yes | - | Activity type |
| data | json | No | {} | Activity data (JSON) |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| type | key | type | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "read_chapter",
  "data": {
    "novel_id": "novel_12345",
    "chapter_id": "chapter_123"
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 42. novel_collaborators

**Purpose**: Manages novel collaborators (co-authors, editors)

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| user_id | string | Yes | - | Collaborator's user ID |
| role | enum | Yes | co_author | Role (co_author, editor, proofreader) |
| invited_by | string | No | null | Inviter's user ID |
| invited_at | datetime | No | $now | Invitation timestamp |
| accepted_at | datetime | No | null | Acceptance timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| novel_user | unique | novel_id, user_id | ASC, ASC |
| novel_id | key | novel_id | ASC |
| user_id | key | user_id | ASC |
| role | key | role | ASC |

### Permissions

```
create: team:owner + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "user_id": "user_67890",
  "role": "editor",
  "invited_by": "author_12345",
  "invited_at": "2024-01-01T00:00:00.000Z",
  "accepted_at": "2024-01-02T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-02T00:00:00.000Z"
}
```

---

## 43. reading_highlights

**Purpose**: Stores user reading highlights

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| start_position | integer | Yes | - | Start position |
| end_position | integer | Yes | - | End position |
| text | string | Yes | - | Highlighted text |
| color | string | No | yellow | Highlight color |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_chapter | key | user_id, chapter_id | ASC, ASC |
| user_id | key | user_id | ASC |
| chapter_id | key | chapter_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "chapter_id": "chapter_123",
  "start_position": 100,
  "end_position": 200,
  "text": "This is a great quote!",
  "color": "yellow",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 44. reading_notes

**Purpose**: Stores user reading notes

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| chapter_id | string | Yes | - | Chapter ID (foreign key) |
| position | integer | No | 0 | Position in chapter |
| note | string | Yes | - | Note content |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_chapter | key | user_id, chapter_id | ASC, ASC |
| user_id | key | user_id | ASC |
| chapter_id | key | chapter_id | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "chapter_id": "chapter_123",
  "position": 500,
  "note": "Interesting plot twist!",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 45. media

**Purpose**: Stores media files metadata

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | No | null | User ID (foreign key) |
| type | enum | Yes | - | Media type (image, video, audio, document) |
| file_url | string | Yes | - | File URL |
| file_name | string | Yes | - | File name |
| file_size | integer | Yes | - | File size (bytes) |
| mime_type | string | Yes | - | MIME type |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| type | key | type | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member + role:admin
read: role:member
update: user:$id + role:admin
delete: user:$id + role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "type": "image",
  "file_url": "https://example.com/image.jpg",
  "file_name": "cover.jpg",
  "file_size": 1024000,
  "mime_type": "image/jpeg",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 46. banners

**Purpose**: Stores banner ads/announcements

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | No | null | Banner title |
| description | string | No | null | Banner description |
| image_url | string | Yes | - | Banner image URL |
| link_url | string | No | null | Link URL |
| order | integer | No | 0 | Display order |
| is_active | boolean | No | true | Is the banner active? |
| starts_at | datetime | No | null | Start timestamp |
| ends_at | datetime | No | null | End timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| is_active | key | is_active | ASC |
| order | key | order | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "title": "Summer Sale!",
  "description": "Get 50% off all purchases!",
  "image_url": "https://example.com/banner.jpg",
  "link_url": "https://example.com/sale",
  "order": 1,
  "is_active": true,
  "starts_at": "2024-06-01T00:00:00.000Z",
  "ends_at": "2024-08-31T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 47. carousel_items

**Purpose**: Stores carousel items for the home screen

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | No | null | Item title |
| description | string | No | null | Item description |
| image_url | string | Yes | - | Item image URL |
| link_url | string | No | null | Link URL |
| type | enum | Yes | novel | Item type (novel, banner, announcement) |
| target_id | string | No | null | Target ID |
| order | integer | No | 0 | Display order |
| is_active | boolean | No | true | Is the item active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| is_active | key | is_active | ASC |
| order | key | order | ASC |
| type | key | type | ASC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "title": "Featured Novel",
  "description": "Check out this amazing novel!",
  "image_url": "https://example.com/carousel.jpg",
  "link_url": "https://example.com/novel/12345",
  "type": "novel",
  "target_id": "novel_12345",
  "order": 1,
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 48. ads

**Purpose**: Stores ad definitions

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | No | null | Ad title |
| description | string | No | null | Ad description |
| image_url | string | No | null | Ad image URL |
| link_url | string | No | null | Link URL |
| type | enum | Yes | banner | Ad type (banner, interstitial, rewarded, native) |
| coins_reward | integer | No | 0 | Coins rewarded for watching |
| is_active | boolean | No | true | Is the ad active? |
| starts_at | datetime | No | null | Start timestamp |
| ends_at | datetime | No | null | End timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| is_active | key | is_active | ASC |
| type | key | type | ASC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "title": "Download our partner app!",
  "description": "Earn 50 coins!",
  "image_url": "https://example.com/ad.jpg",
  "link_url": "https://example.com/partner",
  "type": "rewarded",
  "coins_reward": 50,
  "is_active": true,
  "starts_at": "2024-01-01T00:00:00.000Z",
  "ends_at": "2024-12-31T00:00:00.000Z",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 49. recommendations

**Purpose**: Stores novel recommendations

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| novel_id | string | Yes | - | Novel ID (foreign key) |
| score | float | Yes | - | Recommendation score |
| algorithm | string | No | null | Algorithm used |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id_novel | unique | user_id, novel_id | ASC, ASC |
| user_id | key | user_id | ASC |
| novel_id | key | novel_id | ASC |
| score | key | score | DESC |

### Permissions

```
create: role:admin
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "novel_id": "novel_12345",
  "score": 0.95,
  "algorithm": "collaborative_filtering",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 50. trending

**Purpose**: Daily trending novels

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| rank | integer | Yes | - | Trending rank |
| score | float | Yes | - | Trending score |
| date | date | Yes | - | Trending date |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| date_rank | unique | date, rank | ASC, ASC |
| novel_id | key | novel_id | ASC |
| date | key | date | DESC |
| score | key | score | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "rank": 1,
  "score": 100.0,
  "date": "2024-07-05",
  "is_deleted": false,
  "created_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 51. rankings

**Purpose**: Novel rankings by category

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| novel_id | string | Yes | - | Novel ID (foreign key) |
| category | enum | Yes | - | Category (views, favorites, ratings, trending, new) |
| rank | integer | Yes | - | Ranking position |
| score | float | Yes | - | Ranking score |
| date | date | Yes | - | Ranking date |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| category_date_rank | unique | category, date, rank | ASC, ASC, ASC |
| novel_id | key | novel_id | ASC |
| category | key | category | ASC |
| date | key | date | DESC |
| score | key | score | DESC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "novel_id": "novel_12345",
  "category": "views",
  "rank": 1,
  "score": 100000,
  "date": "2024-07-05",
  "is_deleted": false,
  "created_at": "2024-07-05T00:00:00.000Z"
}
```

---

## 52. events

**Purpose**: Stores platform events

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | Yes | - | Event title |
| description | string | No | null | Event description |
| image_url | string | No | null | Event image URL |
| type | enum | Yes | contest | Event type (contest, challenge, promotion, holiday) |
| starts_at | datetime | Yes | - | Start timestamp |
| ends_at | datetime | Yes | - | End timestamp |
| is_active | boolean | No | true | Is the event active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| is_active | key | is_active | ASC |
| type | key | type | ASC |
| starts_at | key | starts_at | ASC |
| ends_at | key | ends_at | ASC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "title": "Summer Writing Contest",
  "description": "Submit your novel for a chance to win!",
  "image_url": "https://example.com/event.jpg",
  "type": "contest",
  "starts_at": "2024-06-01T00:00:00.000Z",
  "ends_at": "2024-08-31T00:00:00.000Z",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 53. feedback

**Purpose**: Stores user feedback

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | No | null | User ID (foreign key) |
| content | string | Yes | - | Feedback content |
| type | enum | Yes | general | Feedback type (general, bug, feature_request, suggestion) |
| status | enum | Yes | pending | Status (pending, reviewed, in_progress, resolved, closed) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| type | key | type | ASC |
| status | key | status | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "content": "Please add dark mode!",
  "type": "feature_request",
  "status": "pending",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 54. faqs

**Purpose**: Stores FAQ entries

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| question | string | Yes | - | FAQ question |
| answer | string | Yes | - | FAQ answer |
| category | string | No | null | FAQ category |
| order | integer | No | 0 | Display order |
| is_active | boolean | No | true | Is the FAQ active? |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| category | key | category | ASC |
| order | key | order | ASC |
| is_active | key | is_active | ASC |
| question | fulltext | question | ASC |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "question": "How do I earn coins?",
  "answer": "You can earn coins by watching ads or logging in daily!",
  "category": "Coins",
  "order": 1,
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 55. support_tickets

**Purpose**: Stores support tickets

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| subject | string | Yes | - | Ticket subject |
| description | string | Yes | - | Ticket description |
| status | enum | Yes | open | Status (open, in_progress, resolved, closed) |
| priority | enum | Yes | normal | Priority (low, normal, high, urgent) |
| assigned_to | string | No | null | Assigned staff user ID |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| updated_at | datetime | Yes | $now | Last update timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| status | key | status | ASC |
| priority | key | priority | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member
read: user:$id + role:admin + role:moderator
update: role:admin + role:moderator
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "subject": "Can't login",
  "description": "I forgot my password!",
  "status": "open",
  "priority": "high",
  "assigned_to": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 56. email_queue

**Purpose**: Queues emails to be sent

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| to | string | Yes | - | Recipient email |
| subject | string | Yes | - | Email subject |
| content | string | Yes | - | Email content |
| status | enum | Yes | pending | Status (pending, sending, sent, failed) |
| attempts | integer | No | 0 | Number of send attempts |
| last_attempt_at | datetime | No | null | Last attempt timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| status | key | status | ASC |
| created_at | key | created_at | ASC |
| attempts | key | attempts | ASC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "content": "Welcome to our platform!",
  "status": "pending",
  "attempts": 0,
  "last_attempt_at": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 57. push_queue

**Purpose**: Queues push notifications to be sent

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | User ID (foreign key) |
| title | string | Yes | - | Notification title |
| content | string | No | null | Notification content |
| data | json | No | {} | Additional data (JSON) |
| status | enum | Yes | pending | Status (pending, sending, sent, failed) |
| attempts | integer | No | 0 | Number of send attempts |
| last_attempt_at | datetime | No | null | Last attempt timestamp |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| user_id | key | user_id | ASC |
| status | key | status | ASC |
| created_at | key | created_at | ASC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "user_id": "user_12345",
  "title": "New Chapter!",
  "content": "Your favorite novel has a new chapter!",
  "data": {
    "novel_id": "novel_12345"
  },
  "status": "pending",
  "attempts": 0,
  "last_attempt_at": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 58. moderation_queue

**Purpose**: Content moderation queue

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| target_type | string | Yes | - | Target type (novel, chapter, comment, user) |
| target_id | string | Yes | - | Target ID |
| status | enum | Yes | pending | Status (pending, approved, rejected) |
| assigned_to | string | No | null | Assigned moderator ID |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| reviewed_at | datetime | No | null | Review timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| target | key | target_type, target_id | ASC, ASC |
| status | key | status | ASC |
| assigned_to | key | assigned_to | ASC |
| created_at | key | created_at | DESC |

### Permissions

```
create: role:member + role:admin + role:moderator
read: role:admin + role:moderator
update: role:admin + role:moderator
delete: role:admin
```

### Example Document

```json
{
  "target_type": "comment",
  "target_id": "comment_123",
  "status": "pending",
  "assigned_to": null,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "reviewed_at": null
}
```

---

## 59. ai_queue

**Purpose**: AI processing queue

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| task_type | string | Yes | - | Task type (summarization, translation, analysis, recommendation) |
| input_data | json | Yes | - | Input data (JSON) |
| output_data | json | No | null | Output data (JSON) |
| status | enum | Yes | pending | Status (pending, processing, completed, failed) |
| is_deleted | boolean | No | false | Soft delete flag |
| created_at | datetime | Yes | $now | Creation timestamp |
| completed_at | datetime | No | null | Completion timestamp |

### Indexes

| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| task_type | key | task_type | ASC |
| status | key | status | ASC |
| created_at | key | created_at | ASC |

### Permissions

```
create: role:admin
read: role:admin
update: role:admin
delete: role:admin
```

### Example Document

```json
{
  "task_type": "summarization",
  "input_data": {
    "text": "Long text to summarize..."
  },
  "output_data": null,
  "status": "pending",
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "completed_at": null
}
```

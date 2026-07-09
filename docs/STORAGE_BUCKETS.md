# YOMU Novel Platform - Storage Buckets Architecture

## Overview

This document defines the Appwrite storage buckets for the YOMU novel platform.

---

## Bucket List

1. [novel-covers](#1-novel-covers)
2. [novel-banners](#2-novel-banners)
3. [profile-images](#3-profile-images)
4. [chapter-images](#4-chapter-images)
5. [inline-images](#5-inline-images)
6. [banners](#6-banners)
7. [ads](#7-ads)
8. [audio](#8-audio)
9. [videos](#9-videos)
10. [documents](#10-documents)
11. [temporary-uploads](#11-temporary-uploads)

---

## 1. novel-covers

**Purpose**: Stores novel cover images

| Attribute | Value |
|-----------|-------|
| Bucket ID | `novel-covers` |
| Name | Novel Covers |
| Maximum File Size | 10 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{novel_id}-{version}.{extension}
```

Example: `novel_12345-1.webp`

### Subfolders

- `/original/` - Original full-resolution images
- `/thumbnails/` - Generated thumbnails (200x300)
- `/medium/` - Medium resolution (400x600)
- `/large/` - Large resolution (800x1200)

---

## 2. novel-banners

**Purpose**: Stores novel banner images

| Attribute | Value |
|-----------|-------|
| Bucket ID | `novel-banners` |
| Name | Novel Banners |
| Maximum File Size | 10 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{novel_id}-banner-{version}.{extension}
```

Example: `novel_12345-banner-1.webp`

### Subfolders

- `/original/` - Original full-resolution images
- `/thumbnails/` - Generated thumbnails (400x200)
- `/medium/` - Medium resolution (800x400)
- `/large/` - Large resolution (1600x800)

---

## 3. profile-images

**Purpose**: Stores user profile images

| Attribute | Value |
|-----------|-------|
| Bucket ID | `profile-images` |
| Name | Profile Images |
| Maximum File Size | 5 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:member
read: role:member
update: user:$id + role:admin
delete: user:$id + role:admin
```

### File Naming Convention

```
{user_id}-{timestamp}.{extension}
```

Example: `user_12345-1718900000.webp`

### Subfolders

- `/original/` - Original full-resolution images
- `/thumbnails/` - Generated thumbnails (100x100)
- `/small/` - Small resolution (200x200)
- `/medium/` - Medium resolution (400x400)

---

## 4. chapter-images

**Purpose**: Stores chapter-specific images (not inline content)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `chapter-images` |
| Name | Chapter Images |
| Maximum File Size | 20 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp`, `gif` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{chapter_id}-{image_name}.{extension}
```

Example: `chapter_123-illustration-1.webp`

### Subfolders

- `/{novel_id}/{chapter_id}/` - Organized by novel and chapter

---

## 5. inline-images

**Purpose**: Stores images embedded within chapter content (inline images)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `inline-images` |
| Name | Inline Images |
| Maximum File Size | 10 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp`, `gif` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{user_id}-{timestamp}-{random}.{extension}
```

Example: `user_12345-1718900000-abc123.webp`

### Subfolders

- `/{year}/{month}/{day}/` - Date-based organization

---

## 6. banners

**Purpose**: Stores platform banner ads and announcements

| Attribute | Value |
|-----------|-------|
| Bucket ID | `banners` |
| Name | Platform Banners |
| Maximum File Size | 10 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### File Naming Convention

```
banner-{banner_id}-{version}.{extension}
```

Example: `banner-123-1.webp`

### Subfolders

- `/original/` - Original full-resolution images
- `/mobile/` - Mobile-optimized (1080x608)
- `/tablet/` - Tablet-optimized (1536x864)
- `/desktop/` - Desktop-optimized (1920x1080)

---

## 7. ads

**Purpose**: Stores advertisement creatives

| Attribute | Value |
|-----------|-------|
| Bucket ID | `ads` |
| Name | Advertisements |
| Maximum File Size | 20 MB |
| Allowed File Types | `jpg`, `jpeg`, `png`, `webp`, `mp4`, `gif` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Enabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:admin
read: role:member
update: role:admin
delete: role:admin
```

### File Naming Convention

```
ad-{ad_id}-{type}-{version}.{extension}
```

Example: `ad-123-banner-1.webp`

### Subfolders

- `/banners/` - Banner ads
- `/interstitials/` - Interstitial ads
- `/natives/` - Native ads
- `/rewarded/` - Rewarded ads

---

## 8. audio

**Purpose**: Stores audio files (audiobook chapters, etc.)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `audio` |
| Name | Audio Files |
| Maximum File Size | 100 MB |
| Allowed File Types | `mp3`, `wav`, `ogg`, `m4a` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Disabled (audio is already compressed) |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{novel_id}-{chapter_id}-audio.{extension}
```

Example: `novel_12345-chapter_123-audio.mp3`

### Subfolders

- `/{novel_id}/` - Organized by novel
- `/samples/` - Audio samples (free previews)

---

## 9. videos

**Purpose**: Stores video files (book trailers, etc.)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `videos` |
| Name | Video Files |
| Maximum File Size | 500 MB |
| Allowed File Types | `mp4`, `webm`, `mov` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Disabled (video is already compressed) |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{novel_id}-{video_type}-{version}.{extension}
```

Example: `novel_12345-trailer-1.mp4`

### Subfolders

- `/trailers/` - Book trailers
- `/promos/` - Promotional videos
- `/tutorials/` - Tutorial videos

---

## 10. documents

**Purpose**: Stores document files (PDFs, etc.)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `documents` |
| Name | Documents |
| Maximum File Size | 50 MB |
| Allowed File Types | `pdf`, `doc`, `docx`, `txt`, `epub` |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Disabled |
| Cache TTL | 86400 (24 hours) |

### Permissions

```
create: role:writer + role:admin
read: role:member
update: team:owner + role:admin
delete: team:owner + role:admin
```

### File Naming Convention

```
{novel_id}-{document_type}.{extension}
```

Example: `novel_12345-manuscript.pdf`

### Subfolders

- `/manuscripts/` - Full manuscripts
- `/extras/` - Extra content
- `/contracts/` - Legal documents (admin-only)

---

## 11. temporary-uploads

**Purpose**: Stores temporary uploads (pre-optimization, pre-approval)

| Attribute | Value |
|-----------|-------|
| Bucket ID | `temporary-uploads` |
| Name | Temporary Uploads |
| Maximum File Size | 100 MB |
| Allowed File Types | All (but still scanned) |
| Encryption | Enabled |
| Antivirus | Enabled |
| Compression | Disabled |
| Cache TTL | 3600 (1 hour) |
| Auto Delete | 7 days |

### Permissions

```
create: role:member + role:writer + role:admin
read: user:$id + role:admin
update: user:$id + role:admin
delete: user:$id + role:admin
```

### File Naming Convention

```
{user_id}-{timestamp}-{random}.{extension}
```

Example: `user_12345-1718900000-abc123.jpg`

### Subfolders

- `/{user_id}/` - Organized by user

---

## Image Optimization Pipeline

All images uploaded to the platform will go through the following optimization pipeline:

1. **Antivirus Scan**: Files are scanned for malware
2. **Format Conversion**: Convert to WebP (with fallback to JPEG/PNG)
3. **Resize**: Generate multiple sizes (thumbnail, small, medium, large, original)
4. **Compression**: Apply lossless/lossy compression as appropriate
5. **Metadata Removal**: Remove EXIF data
6. **Storage**: Store optimized versions in appropriate buckets
7. **Cleanup**: Delete temporary files after 7 days

### Supported Image Transformations

- Resize
- Crop
- Rotate
- Flip
- Filter (grayscale, sepia, blur, sharpen)
- Quality adjustment
- Format conversion

---

## CDN Configuration (Future)

In the future, storage will integrate with Cloudflare R2 and CDN:

- **Global CDN**: Low-latency access worldwide
- **Cache Invalidation**: Automatic cache invalidation on updates
- **Image Resizing**: On-the-fly image transformation
- **Signed URLs**: Time-limited access to private content

---

## Future Migration Path

Storage is designed to support migration to:
- Cloudflare R2
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

without major changes to the application code.

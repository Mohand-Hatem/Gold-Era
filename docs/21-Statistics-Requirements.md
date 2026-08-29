# 21 — Statistics Requirements

Exact calculation logic and response shapes for user and admin statistics. Source: `File` and `User` tables (`09`). Endpoints in `11`. Charts: Recharts (ADR-014).

## 1. User statistics — `GET /stats/user` (STAT-001)

Scope: `WHERE ownerId = req.user.id`.

### 1.1 Total uploaded files

- **Source:** File rows owned by user.
- **Logic:** `COUNT(*)`.
- **Response:** `totalFiles: number`.

### 1.2 Storage usage

- **Source:** `File.size` (bytes).
- **Logic:** `SUM(size)`; return raw bytes (frontend formats to KB/MB).
- **Response:** `storageUsedBytes: number`.

### 1.3 File type distribution

- **Source:** `File.category`.
- **Logic:** `GROUP BY category → COUNT`.
- **Response:** `typeDistribution: { category, count }[]`.
- **Viz:** Recharts pie/donut.

### 1.4 Upload history

- **Source:** `File.createdAt`.
- **Logic:** trailing **30 days**; `GROUP BY date_trunc('day', createdAt) → COUNT`; fill missing days with 0 on the server or client.
- **Response:** `uploadHistory: { date: "YYYY-MM-DD", count }[]` ascending by date.
- **Viz:** Recharts line/area.

### 1.5 Response shape

```json
{
  "totalFiles": 12,
  "storageUsedBytes": 543210,
  "typeDistribution": [ { "category": "DOCUMENT", "count": 5 }, { "category": "IMAGE", "count": 7 } ],
  "uploadHistory": [ { "date": "2026-01-01", "count": 2 } ]
}
```

## 2. Admin statistics — `GET /stats/admin` (STAT-003)

Scope: entire system (admin only).

### 2.1 Total users

- **Logic:** `COUNT(User)`. **Response:** `totalUsers`.

### 2.2 Total files

- **Logic:** `COUNT(File)`. **Response:** `totalFiles`.

### 2.3 Storage usage

- **Logic:** `SUM(File.size)`. **Response:** `storageUsedBytes`.

### 2.4 Most uploaded file types

- **Logic:** `GROUP BY category → COUNT ORDER BY count DESC` (optionally limit top N).
- **Response:** `topFileTypes: { category, count }[]`.
- **Viz:** Recharts bar.

### 2.5 Recent uploads

- **Logic:** latest **N=10** files `ORDER BY createdAt DESC` with owner join.
- **Response:** `recentUploads: { id, originalName, size, createdAt, owner: { id, name } }[]`.
- **Viz:** table/list.

### 2.6 Response shape

```json
{
  "totalUsers": 25,
  "totalFiles": 340,
  "storageUsedBytes": 123456789,
  "topFileTypes": [ { "category": "IMAGE", "count": 180 }, { "category": "DOCUMENT", "count": 120 } ],
  "recentUploads": [ { "id": "cuid", "originalName": "a.png", "size": 2048, "createdAt": "...", "owner": { "id": "cuid", "name": "Jane" } } ]
}
```

## 3. Calculation implementation notes

- Use Prisma `count`, `aggregate({ _sum: { size } })`, and `groupBy({ by: ['category'], _count })`.
- Upload history: Prisma has no `date_trunc`; either a small raw SQL (`$queryRaw`, parameterised) or fetch `createdAt`s within the window and bucket in JS (acceptable at assessment volume). Prefer JS bucketing for portability.
- Run independent aggregations concurrently (`Promise.all`) to keep latency low.

## 4. Performance considerations (NFR-004/005)

| Query | Support |
|---|---|
| user counts/sum | index `File.ownerId` |
| user history | index `File.(ownerId, createdAt)`; window-limited |
| user distribution | index `File.(ownerId, category)` |
| admin totals | full-table COUNT/SUM — fine at assessment scale |
| admin top types | index `File.category` |
| admin recent | index `File.createdAt` + owner join |

No materialised views or caching in MVP (P3). If volume grew, cache stats with short TTL (documented future work).

## 5. Frontend visualisation summary

| Stat | Component | Chart |
|---|---|---|
| totalFiles / storage / totalUsers | `StatCard` | number + icon |
| typeDistribution / topFileTypes | chart | pie (user), bar (admin) |
| uploadHistory | chart | line/area |
| recentUploads | table | list |

Empty data → charts render with zero/empty state (NFR-006).

## 6. Requirement mapping

| Stat | SRS |
|---|---|
| user total/storage/types/history | STAT-001/002/005 |
| admin totals/types/recent | STAT-003/004 |

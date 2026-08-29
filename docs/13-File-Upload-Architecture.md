# 13 — File Upload Architecture

Complete upload pipeline. Decisions: ADR-002 (limits), ADR-003 (types), ADR-004 (storage), ADR-005/006 (extraction), ADR-015 (checksum), ADR-016 (filenames).

## 1. Pipeline

```mermaid
flowchart TD
  A[Browser: drag & drop / picker] --> B[Client validation: type, size, count]
  B -->|invalid| B1[Reject in UI, toast]
  B -->|valid| C[Axios multipart POST /files/upload + onUploadProgress]
  C --> D[Express route + rate limit]
  D --> E[Multer memoryStorage + limits]
  E --> F[Per-file server validation: ext + declared MIME + magic bytes]
  F -->|invalid| F1[push to failed[]; skip]
  F -->|valid| G[StorageService.write: uuid.ext]
  G --> H[Compute SHA-256 checksum]
  H --> I[Derive category from mimeType]
  I --> J[ExtractionService: text/pdf/docx | image/other]
  J --> K[Persist File row: metadata + extractedContent + status]
  K -->|db error| K1[cleanup blob; push failed[]]
  K --> L[201 { uploaded[], failed[] }]
  L --> M[React Query invalidate files + stats/user]
```

## 2. Supported types & limits (ADR-002/003)

| Category | Extensions | MIME (declared) |
|---|---|---|
| TEXT | txt, md, csv, json | text/plain, text/markdown, text/csv, application/json |
| DOCUMENT | pdf, docx | application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| IMAGE | png, jpg, jpeg, webp | image/png, image/jpeg, image/webp |

Limits: **≤10 MB/file**, **≤5 files/request**, **≤50 MB/request**.

## 3. Validation strategy (defence in depth)

1. **Client** (advisory): reject wrong extension/size/count before upload for UX.
2. **Multer limits**: `fileSize=10MB`, `files=5` → triggers 413 on breach.
3. **Server allow-list**: extension ∈ list AND declared MIME ∈ list.
4. **Magic-byte sniff** (`file-type`) on buffer: detected MIME must match declared/extension family. Mismatch → reject (`ERR_UNSUPPORTED_TYPE`) — blocks MIME spoofing (e.g. `.exe` renamed `.png`). Note: plain text types (txt/md/csv/json) have no reliable magic bytes → validated by extension + declared MIME + UTF-8 decode check.

## 4. Storage strategy (ADR-004)

- `Multer memoryStorage` → validate buffer → `StorageService.write(buffer, ext)` returns `storageKey = <uuid>.<ext>`.
- Files saved under `server/uploads/`. Path built from a sanitised base + storageKey; **client filename never used for path** (ADR-016) → no path traversal.
- `StorageService` interface: `write(buffer, ext) → key`, `read(key) → stream`, `remove(key)`, `path(key)`. Swap to S3/R2 later without touching controllers.
- **Ephemeral-disk risk** on free dynos documented (`24`, README).

## 5. Multiple upload & partial success (ADR-002)

- Field name `files`, up to 5. Each file validated/stored independently.
- Response reports `uploaded[]` (persisted) and `failed[]` (`{originalName, reason}`).
- If **every** file fails validation → respond 400/415 with details (nothing stored).

## 6. Duplicate & filename handling (ADR-015/016)

- Duplicates allowed; `checksum` (SHA-256) stored for future dedupe.
- `originalName` sanitised (≤255, control chars stripped) and stored for display.
- Disk name is opaque UUID; `storageKey` unique.

## 7. Content extraction (ADR-005/006)

| Type | Method | Status on success |
|---|---|---|
| txt/md/csv/json | UTF-8 decode buffer | DONE |
| pdf | `pdf-parse` | DONE |
| docx | `mammoth` (rawText) | DONE |
| png/jpg/jpeg/webp | none | SKIPPED |
| other | none | SKIPPED |

Rules:
- Truncate stored text to **20 000 chars**.
- Extraction runs after storage, before response, wrapped in try/catch.
- **Failure never fails upload**: on throw → `extractionStatus=FAILED`, `extractedContent=null`, file still persisted.
- Empty extraction (e.g. scanned PDF) → status DONE with empty/null content (OCR is P3).

## 8. Failure cleanup & consistency (NFR-010)

| Failure point | Action |
|---|---|
| Validation | nothing written; report failed. |
| Storage write error | no DB row; report failed. |
| Extraction error | file kept; status FAILED. |
| DB persist error after blob write | `StorageService.remove(key)` then report failed → no orphan blob. |

Order: **write blob → persist row (with checksum/metadata) → attempt extraction → update status**. Alternative: extract before persist so the row is written once with final status; either avoids orphans as long as blob cleanup runs on DB failure. Implementation uses: write blob → extract → single create with final status; on any error after write, remove blob.

## 9. Authorized access & download (ADR-023)

- Upload/list/details/delete are authenticated; ownership enforced (`08`).
- `GET /files/:id/download` streams via `StorageService.read` for owner/admin only; sets `Content-Type` from stored mimeType; `Content-Disposition` from `?disposition`.
- No public/static exposure of the uploads directory — all access flows through authorized routes.

## 10. Frontend upload UX (FILE-003/004/005)

- Dropzone (drag+click), selected-file list with per-file validation feedback.
- Per-request progress bar via Axios `onUploadProgress`.
- On success: toast + invalidate `['files']` and `['stats','user']` (`17`).
- On partial: toast summarises N ok / M failed with reasons.

## 11. Requirement mapping

| Step | SRS |
|---|---|
| Multipart upload | FILE-001 |
| Multiple/partial | FILE-002 |
| Drag & drop | FILE-003 |
| Progress | FILE-004 |
| Client validation | FILE-005 |
| Server validation | FILE-006 |
| Metadata persist | FILE-007 |
| Extraction | FILE-008/009 |
| Download/preview | FILE-017/018 |

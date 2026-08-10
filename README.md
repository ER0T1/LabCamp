# LabCamp

> 計算工程與資訊科技研究室的寒暑訓、課程管理與知識傳承平台。

![Version](https://img.shields.io/badge/version-v1.0.1-2563eb)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)

LabCamp 將歷屆寒暑訓、階層式課程、教材與附件集中管理，提供公開瀏覽、全文搜尋、會員帳號，以及依角色控管的內容後台。正式環境支援 Docker Compose、Nginx 反向代理與 Let's Encrypt HTTPS。

## v1.0.1 功能

### 公開內容

- 首頁展示當期訓練與最近更新
- 依年份與季節瀏覽歷屆寒暑訓
- 階層式課程目錄與前後篇導覽
- 課程頁章節導覽支援閱讀位置追蹤、階層縮排與獨立捲動
- 課程、講師與標籤搜尋
- 響應式介面與 PWA 安裝支援

### 帳號與權限

- 電子信箱註冊與 Credentials 登入
- Argon2 密碼雜湊、JWT Session 與角色授權
- 個人頭像、電子信箱與密碼設定
- `ADMIN`、`EDITOR`、`MEMBER` 三種角色
- 管理員可調整會員角色或刪除會員

### 內容管理

- 新增、編輯、發布及刪除訓練與課程
- 課程支援父子階層、自動產生唯一 slug 與標籤
- CKEditor 5 富文字編輯器
- 圖片內嵌與多檔附件上傳
- 刪除內容時同步清理實體附件
- Zod Server Actions 驗證與 HTML sanitizer

## 技術架構

| 類別 | 技術 |
| --- | --- |
| 前端／後端 | Next.js 16、React 19、TypeScript、Server Actions |
| 身分驗證 | Auth.js 5、Argon2 |
| 資料庫 | PostgreSQL 16、Prisma 6 |
| 內容編輯 | CKEditor 5、sanitize-html |
| 部署 | Docker Compose、Nginx、Let's Encrypt |

## 快速開始

### 環境需求

- Node.js 20.9 以上（建議使用 Node.js 22）
- npm
- PostgreSQL 16，或已安裝 Docker 與 Docker Compose

### 1. 安裝與設定

```bash
npm ci
cp .env.example .env
```

請至少設定以下環境變數：

| 變數 | 用途 |
| --- | --- |
| `POSTGRES_PASSWORD` | Docker Compose 建立 PostgreSQL 時使用 |
| `DATABASE_URL` | Prisma 連線字串 |
| `AUTH_SECRET` | Auth.js 簽章密鑰 |
| `AUTH_URL` / `NEXTAUTH_URL` | 網站公開網址 |
| `SEED_ADMIN_PASSWORD` | 初始管理員密碼 |
| `LETSENCRYPT_EMAIL` | Let's Encrypt 通知信箱 |

可用以下指令產生 `AUTH_SECRET`：

```bash
openssl rand -base64 32
```

### 2. 啟動資料庫並初始化

```bash
docker compose up -d postgres
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Seed 會建立管理員帳號 `admin@labcamp.local`，密碼取自 `.env` 的 `SEED_ADMIN_PASSWORD`。首次登入後請立即更換密碼。

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建立 production build |
| `npm start` | 啟動 production server |
| `npm run lint` | 執行 TypeScript 型別檢查 |
| `npm run db:seed` | 建立初始管理員 |
| `npx prisma studio` | 開啟 Prisma Studio |

## 主要路由

| 路由 | 說明 | 權限 |
| --- | --- | --- |
| `/` | 首頁 | 公開 |
| `/training` | 歷屆訓練 | 公開 |
| `/training/[slug]` | 訓練與課程目錄 | 公開 |
| `/training/[slug]/courses/[courseSlug]` | 課程內容 | 公開 |
| `/search?q=` | 課程搜尋 | 公開 |
| `/register`、`/login` | 註冊與登入 | 公開 |
| `/account`、`/account/settings` | 帳號與個人設定 | 會員 |
| `/admin` | 內容管理 | ADMIN／EDITOR |
| `/admin/members` | 會員與角色管理 | ADMIN |

## 檔案儲存

圖片與課程附件透過 `/api/uploads` 寫入 `storage/uploads`，資料庫僅保存檔案 URL。支援 JPEG、PNG、GIF、WebP、AVIF、PDF、ZIP 與常見文字／程式碼格式，單檔上限為 20 MB；上傳限 `ADMIN` 或 `EDITOR`。

正式部署時必須將上傳目錄掛載至持久化磁碟。若部署至無狀態平台，請改接 S3、Cloudflare R2 或相容的物件儲存服務。

## Docker 正式部署

設定 `.env` 後，使用以下指令建置並啟動完整服務：

```bash
docker compose up -d --build
```

Compose 會啟動 `app`、`postgres` 與 `nginx`，並保存資料庫、上傳檔案及憑證。Nginx 範例設定使用 `labcamp.duckdns.org`；若部署至其他網域，請同步修改：

- `docker-compose.yml` 的 `AUTH_URL` 與 `NEXTAUTH_URL`
- `deploy/conf.d/labcamp.conf`
- `deploy/conf.d/labcamp-ssl.conf`

憑證續期指令：

```bash
./deploy/renew-certificate.sh
```

`deploy/labcamp.crontab` 提供每日自動續期檢查範例。

## 專案結構

```text
LabCamp/
├── deploy/             # Nginx、Certbot 與 cron 設定
├── prisma/             # Prisma schema 與 seed
├── public/             # 靜態資源與離線頁面
├── src/
│   ├── actions/        # Server Actions
│   ├── app/            # App Router 頁面與 API routes
│   ├── components/     # UI 與表單元件
│   └── lib/            # Repository、上傳與共用工具
├── storage/uploads/    # 本機上傳檔案（不納入版本控制）
├── Dockerfile
└── docker-compose.yml
```

## CKEditor 授權

本專案使用 CKEditor 5 開源套件並設定 `licenseKey: "GPL"`，未載入 premium features。部署與散布時須遵守 CKEditor 的 GPL 授權條件；若專案無法採用 GPL，請改用 CKEditor 商業授權或替換編輯器。

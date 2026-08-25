# LabCamp

> 計算工程與資訊科技研究室的寒暑訓、課程管理與知識傳承平台。

![Version](https://img.shields.io/badge/version-v1.2.5-2563eb)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)

LabCamp 將歷屆寒暑訓、階層式課程、教材與附件集中管理，提供公開瀏覽、全文搜尋、成員帳號，以及依角色控管的內容後台。正式環境支援 Docker Compose、Nginx 反向代理與 Let's Encrypt HTTPS。

## v1.2.5 功能

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
- 管理員可調整成員角色或刪除成員
- 管理員可查詢登入成功、失敗與登出日誌，並依事件、日期、Email 或 IP 篩選
- 管理員可查看資訊、警告與錯誤三級系統日誌，追蹤內容及權限操作
- 管理員與編輯者可查看 GitHub 更新日誌，搜尋提交並展開逐檔案變更

### 內容管理

- 新增、編輯、預覽、發布及刪除訓練與課程
- 課程支援父子階層、自動產生唯一 slug 與標籤
- 同層課程以拖曳清單排序，切換父課程時會自動顯示對應層級
- CKEditor 5 富文字編輯器
- 圖片內嵌、多檔附件上傳，以及選用其他課程已上傳的附件
- 新增與編輯課程共用一致的附件面板
- 課程與訓練編輯器採用一致的 paper 面板、直角控制項及發布 switch
- 刪除附件、課程或訓練時會檢查檔案引用，僅在沒有其他課程使用時刪除實體檔案
- Zod Server Actions 驗證與 HTML sanitizer

### v1.2.5 重點更新

- 附件在伺服器端維持 UUID 儲存名稱，下載時透過標準 `Content-Disposition` 恢復原始檔名並支援中文
- 更新日誌改用持久化 bare Git 快取，完整讀取提交、標籤及逐檔案增刪，不受 GitHub REST API 匿名額度限制
- 更新日誌每 24 小時自動同步，並提供 `ADMIN`／`EDITOR` 手動更新按鈕
- 移除建置期 `github-commits.json` 與產生器，產生資料不再納入版本控制
- 統一更新日誌操作按鈕的字級與盒模型，桌面總高 `38px`，`750px` 以下總高 `44px`
- 修正更新日誌操作在 `750px` 與 `550px` 斷點的靠左排列及手機雙欄等寬布局

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
| `LOGIN_LOG_PRIVATE_IP_FALLBACK` | 登入來源為內部網段時記錄的校園固定公網 IP |
| `GITHUB_REPOSITORY` | 更新日誌來源，格式為 `owner/repository` |
| `GITHUB_CHANGELOG_LIMIT` | 更新日誌載入的最新提交數量，預設 `50`、上限 `500` |
| `GITHUB_CHANGELOG_REF` | 選用的 Git branch、tag 或 commit；留空時使用遠端預設分支 |
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
| `/account`、`/account/settings` | 帳號與個人設定 | MEMBER |
| `/admin` | 內容管理 | ADMIN／EDITOR |
| `/admin/members` | 成員與角色管理 | ADMIN |
| `/admin/login-logs` | 登入日誌與異常登入提示 | ADMIN |
| `/admin/audit-logs` | 系統操作與錯誤日誌 | ADMIN |
| `/admin/update-logs` | GitHub 提交與逐檔案更新日誌 | ADMIN／EDITOR |

## 檔案儲存

圖片與課程附件透過 `/api/uploads` 寫入 `storage/uploads`，資料庫保存課程與檔案 URL 的關聯。同一個實體檔案可由多門課程共用；移除附件或刪除課程時，系統會先檢查其他課程是否仍在使用，只有最後一筆引用移除後才刪除實體檔案。

支援 JPEG、PNG、GIF、WebP、AVIF、PDF、ZIP 與常見文字／程式碼格式，單檔上限為 20 MB；上傳與選用既有附件限 `ADMIN` 或 `EDITOR`。

正式部署時必須將上傳目錄掛載至持久化磁碟。若部署至無狀態平台，請改接 S3、Cloudflare R2 或相容的物件儲存服務。

## Docker 正式部署

設定 `.env` 後，使用以下指令建置並啟動完整服務：

```bash
docker compose build app migrate
docker compose run --rm migrate
docker compose up -d
```

有新增 Prisma migration 時，請在重新建立應用程式容器前執行 `docker compose run --rm migrate`；此工具服務會透過 Docker network 連線 PostgreSQL，不需要將資料庫連接埠公開到主機。

Compose 會啟動 `app`、`postgres` 與 `nginx`，並保存資料庫、上傳檔案及憑證。Nginx 範例設定使用 `labcamp.duckdns.org`；若部署至其他網域，請同步修改：

- `docker-compose.yml` 的 `AUTH_URL` 與 `NEXTAUTH_URL`
- `deploy/conf.d/labcamp.conf`
- `deploy/conf.d/labcamp-ssl.conf`

憑證續期指令：

```bash
./deploy/renew-certificate.sh
```

`deploy/labcamp.crontab` 提供每日自動續期檢查範例。

更新日誌由伺服器將公開 GitHub 儲存庫同步至持久化的 bare Git 快取，再從本機 Git 讀取提交、標籤與逐檔案統計；產生資料不會納入版本控制，也不受匿名 REST API 額度限制。資料快取 24 小時後會自動執行 `git fetch`；`ADMIN` 與 `EDITOR` 也可在更新日誌頁按下「更新日誌」，立即清除快取並同步最新提交。Docker Compose 使用 `changelog_git` volume 保存 Git 快取，重建容器後不需重新 clone。

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

專案名稱：LabCamp

專案目標：
建立一個研究室內部使用的寒訓／暑訓內容管理網站，用來保存歷屆訓練資料、教材、教學文章、作業、檔案與相關連結。網站需要具備良好的內容瀏覽、分類、搜尋與管理功能，並保留未來擴充成研究室知識庫的可能性。

技術架構：
前端與後端統一使用 Next.js 開發，採用 App Router。
資料庫使用 PostgreSQL。
ORM 建議使用 Prisma。
樣式使用 Tailwind CSS。
UI 元件可使用 shadcn/ui。
登入驗證可使用 Auth.js。
Markdown 內容可使用 react-markdown 或 MDX。
程式語言使用 TypeScript。

整體架構：
Next.js
├─ 前端頁面
├─ Server Components
├─ Server Actions / Route Handlers
├─ Auth.js
├─ Prisma ORM
└─ PostgreSQL

第一階段目標：
先完成一個可使用的 MVP，包含首頁、寒暑訓列表、課程內容頁、搜尋、管理後台與基本登入功能。

網站主要頁面：

1. 首頁
顯示網站名稱 LabCamp。
顯示簡短介紹，例如「研究室寒暑訓與知識傳承平台」。
顯示最近更新的寒訓／暑訓。
顯示歷屆訓練入口。
提供搜尋功能。

建議路徑：
/

2. 訓練列表
按照年份顯示歷屆寒訓與暑訓。

例如：
2026
- 2026 暑訓
- 2026 寒訓

2025
- 2025 暑訓
- 2025 寒訓

建議路徑：
/training

3. 單一訓練頁面
顯示某一屆寒訓或暑訓的完整資訊。

例如：
2026 暑訓

內容包括：
標題
年份
類型
訓練期間
簡介
課程列表
講師
教材
相關檔案
作業
相關連結

建議路徑：
/training/[id]

或使用可讀網址：
/training/2026-summer

4. 課程頁面
每一個寒暑訓可以包含多個課程。

例如：
2026 暑訓
├─ Git 基礎
├─ Linux 基礎
├─ Docker
├─ PostgreSQL
├─ WebGIS
└─ LLM API

每個課程內容包含：
課程名稱
講師
課程介紹
Markdown 教材
程式碼範例
附件
相關連結
建立日期
最後更新日期

建議路徑：
/training/[trainingSlug]/courses/[courseSlug]

5. 搜尋頁面
可以搜尋：
寒訓
暑訓
課程名稱
文章內容
講師
標籤

例如搜尋：
Docker

結果：
2026 暑訓 / Docker 基礎
2025 寒訓 / Docker Compose
研究室環境建置 / Docker Server

建議路徑：
/search?q=docker

6. 管理後台
只有管理員可以進入。

建議路徑：
/admin

功能包括：
建立寒訓／暑訓
修改寒訓／暑訓
刪除寒訓／暑訓
新增課程
修改課程
刪除課程
管理使用者
管理標籤
管理附件

後台首頁可以顯示：
訓練總數
課程總數
使用者數量
最近更新內容

7. 登入頁面
建議路徑：
/login

初期可以只支援 Email + Password。
後續可以增加 Google 登入。

使用者角色：
至少包含以下角色：

ADMIN
具有完整管理權限。

EDITOR
可以建立與修改內容，但不能管理使用者。

MEMBER
可以登入並查看研究室內部內容。

未登入使用者是否可以查看內容，可以透過設定控制。

資料庫設計：

User
id
name
email
passwordHash
role
createdAt
updatedAt

Training
id
title
slug
year
season
description
startDate
endDate
published
createdAt
updatedAt

season 可使用：
WINTER
SUMMER

Course
id
trainingId
title
slug
description
content
instructor
order
published
createdAt
updatedAt

Training 與 Course 為一對多關係。

一個 Training 可以有多個 Course。

Tag
id
name
slug

CourseTag
courseId
tagId

Course 與 Tag 為多對多關係。

Attachment
id
courseId
name
url
type
createdAt

Attachment 用於保存：
PDF
PPT
ZIP
程式碼
圖片
其他教材

Link
id
courseId
title
url
createdAt

可以保存：
GitHub
YouTube
官方文件
Google Drive
其他網站

未來可以增加：

Assignment
id
courseId
title
description
dueDate

Submission
id
assignmentId
userId
content
fileUrl
submittedAt

第一版先不實作 Assignment 與 Submission，但資料架構需保留未來擴充空間。

內容格式：
課程主要內容建議使用 Markdown。

需要支援：
標題
粗體
斜體
列表
表格
引用
程式碼區塊
圖片
超連結

程式碼區塊需要 Syntax Highlight。

例如：

```bash
docker compose up -d
```

或：

```javascript
console.log("Hello LabCamp");
```

首頁設計：
整體風格簡潔、現代、偏工程與研究室風格。

Header：
LabCamp Logo
首頁
歷屆訓練
搜尋
登入

登入後如果是 ADMIN 或 EDITOR：
額外顯示「管理後台」。

首頁 Hero：
LabCamp

研究室寒暑訓與知識傳承平台

保存每一屆的經驗，
讓知識可以持續傳承。

下方顯示：
最近一次暑訓
最近一次寒訓
最近更新課程

訓練卡片設計：

2026 暑訓

2026 Summer Training

課程數：8
期間：2026/07/01 - 2026/08/31

查看課程 →

課程頁面建議採用文件網站風格。

左側 Sidebar：
2026 暑訓
├─ Git
├─ Linux
├─ Docker
├─ PostgreSQL
├─ Node.js
├─ WebGIS
└─ LLM

右側：
課程 Markdown 內容。

可以加入自動產生的 Table of Contents。

RWD：
網站必須支援：
桌面
平板
手機

桌面版顯示完整 Sidebar。
手機版 Sidebar 改為 Drawer。

搜尋功能：
第一版直接使用 PostgreSQL 查詢。

至少搜尋：
Training.title
Training.description
Course.title
Course.description
Course.content
Course.instructor
Tag.name

後續可以考慮 PostgreSQL Full Text Search。

網址設計：
使用 slug，不使用純數字 ID 作為主要公開網址。

例如：

/training/2026-summer

/training/2026-summer/courses/docker

/training/2026-summer/courses/postgresql

/admin/training/2026-summer

API 與 Server Actions：
優先使用 Next.js Server Actions。

如果需要 REST API，再建立：

/api/trainings
/api/courses
/api/search

所有輸入資料需要驗證。

建議使用 Zod。

例如：
建立 Training 前，需要驗證：
title
slug
year
season

slug 必須唯一。

權限管理：
Server 端必須檢查使用者權限。

不能只在前端隱藏按鈕。

例如：
ADMIN
可以建立、修改、刪除所有內容。

EDITOR
可以建立與修改內容。
預設不允許管理使用者。

MEMBER
只能閱讀。

安全需求：
密碼不得以明文存入資料庫。
使用 bcrypt 或 Argon2 儲存 Password Hash。

所有後台 API 或 Server Actions 必須進行 Session 驗證。

所有使用者輸入需要驗證。

Markdown 顯示需要避免 XSS。

環境變數：

DATABASE_URL

AUTH_SECRET

NEXTAUTH_URL 或 Auth.js 所需設定。

建立 .env.example。

例如：

DATABASE_URL="postgresql://user:password@localhost:5432/labcamp"

AUTH_SECRET=""

開發環境：
使用 Docker Compose 啟動 PostgreSQL。

docker-compose.yml 至少包含：

postgres:
PostgreSQL 服務。

port：
5432

volume：
保存 PostgreSQL 資料。

Next.js 初期可以直接在本機執行：

npm run dev

未來再考慮完整容器化。

建議專案結構：

src/
├─ app/
│  ├─ page.tsx
│  ├─ login/
│  ├─ training/
│  │  ├─ page.tsx
│  │  └─ [slug]/
│  │     ├─ page.tsx
│  │     └─ courses/
│  │        └─ [courseSlug]/
│  │           └─ page.tsx
│  ├─ search/
│  ├─ admin/
│  │  ├─ page.tsx
│  │  ├─ trainings/
│  │  ├─ courses/
│  │  └─ users/
│  └─ api/
│
├─ components/
│  ├─ layout/
│  ├─ training/
│  ├─ course/
│  ├─ admin/
│  └─ ui/
│
├─ lib/
│  ├─ auth.ts
│  ├─ prisma.ts
│  ├─ permissions.ts
│  ├─ markdown.ts
│  └─ utils.ts
│
├─ actions/
│  ├─ training.ts
│  ├─ course.ts
│  └─ user.ts
│
└─ types/

prisma/
├─ schema.prisma
└─ seed.ts

public/
├─ images/
└─ uploads/

開發順序：

Phase 1：專案初始化

建立 Next.js TypeScript 專案。
加入 Tailwind CSS。
加入 shadcn/ui。
安裝 Prisma。
建立 PostgreSQL。
建立 Docker Compose。
建立 .env。
確認 Next.js 可以正常連接 PostgreSQL。

Phase 2：資料庫

建立 Prisma Schema。

完成：
User
Training
Course
Tag
CourseTag
Attachment
Link

執行 Migration。

建立 seed script。

Seed 資料至少包含：

ADMIN 使用者。

2026 暑訓。

3 個測試課程：
Git 基礎
Docker 基礎
PostgreSQL 基礎

Phase 3：前台

完成：
首頁
歷屆訓練頁
單一訓練頁
課程頁
Markdown Render
Sidebar
RWD

Phase 4：Authentication

導入 Auth.js。

完成：
登入
登出
Session
角色判斷
Route Protection

Phase 5：管理後台

完成 Training CRUD。

包含：
新增
修改
刪除
發布／取消發布

完成 Course CRUD。

內容編輯器第一版可以使用 textarea 編輯 Markdown。

畫面採左右分割：
左邊 Markdown Editor。
右邊 Preview。

Phase 6：搜尋

建立全站搜尋。

輸入關鍵字後搜尋：
Training
Course
Tag
Instructor

搜尋結果依類型分類。

Phase 7：完善 UI

加入：
Loading Skeleton
Empty State
Error Page
404 Page
Toast
Confirm Dialog
Breadcrumb
Pagination

Phase 8：部署

Production 建議：

Next.js Server
PostgreSQL
Nginx
Docker

架構：

Internet
↓
Nginx
↓
Next.js
↓
PostgreSQL

使用 Docker Compose 管理服務。

需要提供：
Dockerfile
docker-compose.prod.yml
.env.example

未來功能：

第一版完成後可以逐步增加：

1. Google OAuth

2. 檔案上傳

3. Google Drive 整合

4. GitHub Repository 連結

5. YouTube 教學影片嵌入

6. 作業系統

7. 作業繳交

8. 課程完成進度

9. 留言功能

10. 全站活動紀錄

11. PostgreSQL Full Text Search

12. AI 搜尋

未來 AI 功能可以讓使用者輸入：

「Docker 的教材在哪？」

「2025 暑訓有教 PostgreSQL 嗎？」

「幫我整理 Linux 課程內容」

系統可以搜尋 LabCamp 資料後再由 LLM 回答。

因此目前資料模型與內容架構需要保持清楚，方便未來加入 RAG 或向量搜尋。

設計原則：

第一：
內容比功能重要。

不要一開始做太複雜的社群、作業或通知系統。

第二：
所有寒暑訓內容都必須使用一致的資料結構。

Training
↓
Course
↓
Content / Attachment / Link

第三：
公開網址使用 slug。

第四：
後台操作保持簡單。

第五：
優先完成可用的 MVP，再增加功能。

Codex 第一階段任務：

請建立 LabCamp 專案的基本骨架。

要求：

1. 使用最新穩定版 Next.js。
2. 使用 TypeScript。
3. 使用 App Router。
4. 使用 Tailwind CSS。
5. 使用 PostgreSQL。
6. 使用 Prisma。
7. 建立 Docker Compose PostgreSQL。
8. 建立 Prisma Schema。
9. 建立首頁。
10. 建立 Training List。
11. 建立 Training Detail。
12. 建立 Course Detail。
13. 建立測試 Seed Data。
14. UI 使用響應式設計。
15. 所有程式碼保持模組化。
16. 不要過度工程化。
17. 不要在第一階段加入不必要的功能。

完成後專案必須可以透過以下流程啟動：

docker compose up -d

npm install

npx prisma migrate dev

npx prisma db seed

npm run dev

並可以在瀏覽器看到：

首頁
→ 2026 暑訓
→ Docker 基礎課程
→ Markdown 教材內容

第一階段先不實作：
Google OAuth
檔案上傳
AI
留言
通知
作業繳交
複雜 RBAC

這些功能留待後續開發。
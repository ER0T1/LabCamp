export type Course = {
  slug: string;
  title: string;
  index: string;
  instructor: string;
  description: string;
  duration: string;
  tags: string[];
  updatedAt: string;
  content: string;
  attachments: { name: string; url: string; type: string }[];
  parentSlug?: string;
  depth?: number;
};

export type Training = {
  slug: string;
  title: string;
  titleEn: string;
  year: number;
  season: "夏季" | "冬季";
  range: string;
  description: string;
  status: "進行中" | "已結束";
  courses: Course[];
};

const gitContent = `## 這堂課會帶走什麼

Git 不只是備份工具，而是一套讓團隊安全協作的語言。這堂課從檔案狀態開始，建立一個不靠死背指令的心智模型。

> 開始操作以前，先問自己：這個檔案現在在哪一個區域？

## 三個工作區

一個檔案會在 **工作目錄**、**暫存區** 與 **版本庫** 之間移動。

| 區域 | 用途 | 常用指令 |
| --- | --- | --- |
| Working tree | 正在編輯的內容 | \`git diff\` |
| Staging area | 下一次提交的草稿 | \`git add\` |
| Repository | 已保存的版本 | \`git commit\` |

## 建立第一個版本

\`\`\`bash
git init
git add README.md
git commit -m "docs: add project overview"
\`\`\`

提交訊息應該說明「為什麼改」，讓六個月後的自己能快速理解脈絡。

## 分支與協作

每一項獨立工作使用一條短生命週期的分支。準備合併前，先同步主分支並自行檢查差異。

\`\`\`bash
git switch -c feat/map-export
git fetch origin
git rebase origin/main
git diff origin/main...HEAD
\`\`\`

## 課後練習

1. 建立一個新 repository，完成三次有意義的 commit。
2. 刻意製造一次 merge conflict，記錄解決步驟。
3. 使用 \`git log --oneline --graph\` 畫出版本歷史。`;

const makeCourse = (
  slug: string,
  index: string,
  title: string,
  instructor: string,
  description: string,
  tags: string[],
  duration = "2 小時",
): Course => ({
  slug,
  index,
  title,
  instructor,
  description,
  tags,
  duration,
  updatedAt: "2026.07.24",
  content: gitContent.replaceAll("Git", title),
  attachments: [],
});

export const trainings: Training[] = [
  {
    slug: "2026-summer",
    title: "2026 暑訓",
    titleEn: "SUMMER FIELD NOTES / 2026",
    year: 2026,
    season: "夏季",
    range: "07.01 — 08.31",
    status: "進行中",
    description: "從開發環境到 AI 應用，為新進研究成員建立共同的技術基線。",
    courses: [
      makeCourse(
        "git",
        "01",
        "Git 協作基礎",
        "林柏宇",
        "建立清楚的版本控制心智模型，練習分支、合併與協作流程。",
        ["Git", "Workflow"],
      ),
      makeCourse(
        "linux",
        "02",
        "Linux 與 Shell",
        "陳郁文",
        "理解檔案系統、權限與文字處理工具，能獨立操作研究伺服器。",
        ["Linux", "CLI"],
        "3 小時",
      ),
      makeCourse(
        "docker",
        "03",
        "Docker 容器化",
        "王建衡",
        "從 image 到 compose，把實驗環境變成可重現、可分享的設定。",
        ["Docker", "DevOps"],
        "3.5 小時",
      ),
      makeCourse(
        "postgresql",
        "04",
        "PostgreSQL 實務",
        "張家綺",
        "資料建模、索引與查詢計畫，建立可靠的研究資料層。",
        ["Database", "SQL"],
        "3 小時",
      ),
      makeCourse(
        "webgis",
        "05",
        "WebGIS 入門",
        "許博翔",
        "串起空間資料、地圖服務與前端呈現的完整工作流。",
        ["GIS", "Web"],
        "4 小時",
      ),
      makeCourse(
        "llm-api",
        "06",
        "LLM API 與應用",
        "蔡孟哲",
        "從 prompt、結構化輸出到評測，做出可驗證的語言模型功能。",
        ["AI", "API"],
        "3 小時",
      ),
    ],
  },
  {
    slug: "2026-winter",
    title: "2026 寒訓",
    titleEn: "WINTER FIELD NOTES / 2026",
    year: 2026,
    season: "冬季",
    range: "01.15 — 02.21",
    status: "已結束",
    description: "聚焦資料工程與研究方法，把零散的分析步驟整理成可重現流程。",
    courses: [
      makeCourse(
        "python-data",
        "01",
        "Python 資料處理",
        "張家綺",
        "使用 pandas 整理、驗證與轉換研究資料。",
        ["Python", "Data"],
      ),
      makeCourse(
        "research-reproducibility",
        "02",
        "可重現研究",
        "林柏宇",
        "從環境、資料到論文圖表，保存完整研究脈絡。",
        ["Research", "Workflow"],
      ),
      makeCourse(
        "docker-compose",
        "03",
        "Docker Compose",
        "王建衡",
        "管理多服務開發環境與研究工具鏈。",
        ["Docker", "DevOps"],
      ),
    ],
  },
  {
    slug: "2025-summer",
    title: "2025 暑訓",
    titleEn: "SUMMER FIELD NOTES / 2025",
    year: 2025,
    season: "夏季",
    range: "07.03 — 08.28",
    status: "已結束",
    description: "研究室基礎工具與空間資訊技術的密集入門。",
    courses: [
      makeCourse(
        "nodejs",
        "01",
        "Node.js 基礎",
        "陳郁文",
        "JavaScript 執行環境與後端服務入門。",
        ["JavaScript", "Web"],
      ),
      makeCourse(
        "qgis",
        "02",
        "QGIS 空間分析",
        "許博翔",
        "以實際研究資料完成空間分析與製圖。",
        ["GIS", "QGIS"],
      ),
    ],
  },
  {
    slug: "2025-winter",
    title: "2025 寒訓",
    titleEn: "WINTER FIELD NOTES / 2025",
    year: 2025,
    season: "冬季",
    range: "01.13 — 02.14",
    status: "已結束",
    description: "開發工具、伺服器操作與團隊協作的共同起點。",
    courses: [
      makeCourse(
        "server",
        "01",
        "研究室環境建置",
        "林柏宇",
        "設定個人開發環境並理解研究室基礎設施。",
        ["Linux", "Docker"],
      ),
    ],
  },
];

export const getTraining = (slug: string) =>
  trainings.find((training) => training.slug === slug);

export function searchContent(query: string) {
  const keyword = query.trim().toLocaleLowerCase();
  if (!keyword) return [];
  return trainings.flatMap((training) =>
    training.courses
      .filter((course) =>
        [course.title, course.description, course.instructor, ...course.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(keyword),
      )
      .map((course) => ({ training, course })),
  );
}

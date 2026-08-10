import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LabCamp — 實驗室訓練誌",
    short_name: "LabCamp",
    description: "計算工程與資訊科技研究室寒暑訓與知識傳承平台",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f3f1e9",
    theme_color: "#141713",
    lang: "zh-Hant",
    categories: ["education", "productivity"],
    icons: [
      { src: "/pwa/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

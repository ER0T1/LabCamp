import Link from "next/link";
import { Mark } from "./icons";

export function Footer({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return <footer className="footer"><div><Mark className="footer-mark"/><strong>讓研究留下脈絡，<br/>讓經驗繼續發生。</strong></div><address><b>計算工程與資訊科技研究室</b><span>研究室門牌　E2-701</span><span>研究室電話　2733-3141 轉 7576</span></address><div className="footer-links"><Link href="/training" prefetch={false}>歷屆訓練</Link><Link href="/search" prefetch={false}>內容搜尋</Link><Link href={isAuthenticated ? "/account" : "/login"} prefetch={false}>成員入口</Link></div><small>LABCAMP © 2026<br/>BUILT FOR CURIOUS MINDS.</small></footer>;
}

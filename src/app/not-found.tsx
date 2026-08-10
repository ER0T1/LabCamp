import Link from "next/link";
export default function NotFound() { return <div className="not-found"><span className="mono">ERROR / 404</span><h1>這頁筆記還不存在。</h1><p>可能已經移動，或尚未被寫下來。</p><Link href="/">回到首頁 →</Link></div>; }

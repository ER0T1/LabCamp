import { Mark } from "@/components/icons";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <div className="login-page">
    <div className="login-layout">
      <section className="login-intro">
        <Mark/>
        <p className="eyebrow">MEMBER ACCESS</p>
        <h1>回到研究現場。</h1>
        <p>登入以查看內部教材、編輯訓練內容與管理檔案。</p>
        <div className="lab-address"><b>計算工程與資訊科技研究室</b><span>E2-701</span><span>2733-3141 轉 7576</span></div>
        <blockquote>「好的研究，不只留下答案，<br/>也留下抵達答案的路徑。」</blockquote>
      </section>
      <LoginForm/>
    </div>
  </div>;
}

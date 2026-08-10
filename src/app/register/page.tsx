import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Mark } from "@/components/icons";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return <div className="login-page"><section><Mark/><p className="eyebrow">MEMBER REGISTRATION</p><h1>加入知識現場。</h1><p>建立成員帳號，讓每一次學習與研究經驗都能持續累積。</p><div className="lab-address"><b>計算工程與資訊科技研究室</b><span>E2-701</span><span>2733-3141 轉 7576</span></div><blockquote>「知識因為被記錄而留下，<br/>也因為被分享而繼續生長。」</blockquote></section><RegisterForm/></div>;
}

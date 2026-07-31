"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function login() {
    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (result.error) throw result.error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "登入失敗");
    }
  }

  return <main className="loginPage"><section className="loginCard">
    <div>🌏</div><h1>Travel ME</h1><p>Google 登入可同步旅行資料。尚未設定時仍可返回首頁使用本機功能。</p>
    <button onClick={login}>使用 Google 登入</button>{error && <p className="loginError">{error}</p>}<a href="/">返回首頁</a>
  </section></main>;
}

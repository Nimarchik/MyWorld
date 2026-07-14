import { useState } from "react";
import { supabase } from "../../lib/supabase";
import style from "../../assets/styles/index.module.css";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className={style.login}>
      <div className={style.loginCard}>
        <h1>❤️ Our World</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={signIn}>
          Войти
        </button>
      </div>
    </div>
  );
}
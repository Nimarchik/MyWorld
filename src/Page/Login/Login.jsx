import { useState } from "react";
import { supabase } from "../../lib/supabase";
import style from '../../assets/styles/index.module.css'

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

  return (<>
    <div className={style.loginBox}>
      <h1 className={style.loginBoxTitle}>❤️ Наш уголок</h1>

      <div className={style.userBox}>
        <input placeholder=" "
          type="email"
          onChange={(e) => setEmail(e.target.value)} />
        <label>Email</label>
      </div>
      <div className={style.userBox}>
        <input type="password"
          placeholder=" "
          onChange={(e) => setPassword(e.target.value)} />
        <label>Password</label>
      </div><center>
        <button onClick={signIn}>
          Login
          <span>
          </span>
        </button></center>
    </div>
  </>);
}
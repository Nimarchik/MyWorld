import { useState } from "react";
import { supabase } from "../lib/supabase";
import style from '../assets/styles/index.module.css'

export default function Editor({ user, onSaved }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("thought");

  async function save() {
    if (!text.trim()) return;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        content: text,
        category
      });

    if (!error) {
      setText("");
      onSaved();
    } else {
      alert(error.message);
    }
  }

  return (
    <div className={style.forms}>
      <select
        className={style.select}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="thought">💭 Мысль</option>
        <option value="feeling">❤️ Чувство</option>
        <option value="question">❓ Вопрос</option>
        <option value="dream">🌙 Мечта</option>
      </select>
      <div className={style.textareaBorder}>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <textarea
          className={style.textarea1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напиши что-нибудь..."
        />
      </div>
      <button className={style.saveBtn} onClick={save}>
        <span className={style.spn2}>Сохранить</span>
      </button>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import style from "../assets/styles/index.module.css";

export default function Stats() {

  const [stats, setStats] = useState({
    thought: 0,
    feeling: 0,
    question: 0,
    dream: 0
  });

  useEffect(() => {
    load();
  }, [])

  async function load() {

    const { data } = await supabase
      .from("posts")
      .select("category");

    const result = {
      thought: 0,
      feeling: 0,
      question: 0,
      dream: 0
    }

    data?.forEach(post => {
      result[post.category]++;
    })

    setStats(result);

  }

  return (

    <section className={style.stats}>

      <h2>📊 Статистика</h2>

      <div className={style.statsGrid}>

        <div>💭 {stats.thought}</div>

        <div>❤️ {stats.feeling}</div>

        <div>❓ {stats.question}</div>

        <div>🌙 {stats.dream}</div>

      </div>

    </section>

  )

}
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import style from "../assets/styles/index.module.css";

const icons = {
  thought: "💭",
  feeling: "❤️",
  question: "❓",
  dream: "🌙",
};

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);

  async function loadFeed() {
    // Получаем прочитанные записи
    const { data: reads, error: readsError } = await supabase
      .from("post_reads")
      .select("post_id")
      .eq("user_id", user.id);

    if (readsError) {
      console.error(readsError);
      return;
    }

    const readIds = reads.map(item => item.post_id);

    // Загружаем все записи
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles!posts_author_id_fkey(name)
      `)
      .neq("author_id", user.id) // только записи второго человека
      .order("created_at", { ascending: false });

    // Исключаем уже прочитанные
    if (readIds.length > 0) {
      query = query.not("id", "in", `(${readIds.join(",")})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    setPosts(data || []);
  }

  if (posts.length === 0) {
    return (
      <section className={style.feed}>
        <h2>📰 Новые публикации</h2>

        <p>✨ Пока новых записей нет</p>
      </section>
    );
  }

  return (
    <section className={style.feed}>
      <h2>📰 Новые публикации</h2>

      {posts.map(post => (
        <motion.div
          key={post.id}
          className={style.feedCard}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={style.feedHeader}>
            <span>
              {icons[post.category]} {post.profiles?.name}
            </span>

            <span>
              {new Date(post.created_at).toLocaleString("ru-RU")}
            </span>
          </div>

          <p>{post.content}</p>
        </motion.div>
      ))}
    </section>
  );
}
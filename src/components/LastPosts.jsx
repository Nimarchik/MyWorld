import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import style from "../assets/styles/index.module.css";

export default function LastPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(name)
      `)
      .order("created_at", { ascending: false })
      .limit(2);

    setPosts(data || []);
  }

  return (
    <section className={style.homeBlock}>

      <h2>💌 Последние записи</h2>

      <div className={style.lastPosts}>

        {posts.map(post => (

          <div
            key={post.id}
            className={style.lastPost}
          >

            <h3>{post.profiles?.name}</h3>

            <p>{post.content}</p>

          </div>

        ))}

      </div>

    </section>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import style from "../assets/styles/index.module.css";

export default function ActivityFeed({ user }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  async function loadActivities() {
    // ====== Загружаем записи дневника ======
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!posts_author_id_fkey(name)
      `)
      .neq("author_id", user.id);

    // ====== Загружаем воспоминания ======
    const { data: memories } = await supabase
      .from("memories")
      .select(`
        *,
        profiles!memories_author_id_fkey(name)
      `)
      .neq("author_id", user.id);

    // ====== Что уже просмотрено ======
    const { data: reads } = await supabase
      .from("activity_reads")
      .select("*")
      .eq("user_id", user.id);

    const viewed = new Set(
      (reads || []).map(
        (r) => `${r.activity_type}-${r.activity_id}`
      )
    );

    // ====== Дневник ======
    const diaryActivities = (posts || [])
      .filter((post) => !viewed.has(`post-${post.id}`))
      .map((post) => ({
        id: post.id,
        type: "post",
        icon: "💭",
        title: "Новая запись",
        author: post.profiles?.name,
        text:
          post.content.length > 80
            ? post.content.slice(0, 80) + "..."
            : post.content,
        image: null,
        created_at: post.created_at,
        link: "/Diary",
      }));

    // ====== Воспоминания ======
    const memoryActivities = (memories || [])
      .filter((memory) => !viewed.has(`memory-${memory.id}`))
      .map((memory) => ({
        id: memory.id,
        type: "memory",
        icon: "📸",
        title: "Новое воспоминание",
        author: memory.profiles?.name,
        text: memory.title,
        image: memory.image,
        created_at: memory.created_at,
        link: "/Memories",
      }));

    const all = [
      ...diaryActivities,
      ...memoryActivities,
    ];

    all.sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    setActivities(all);
  }

  async function markAsRead(activity) {
    await supabase
      .from("activity_reads")
      .upsert({
        activity_type: activity.type,
        activity_id: activity.id,
        user_id: user.id,
      });

    setActivities((prev) =>
      prev.filter(
        (a) =>
          !(
            a.type === activity.type &&
            a.id === activity.id
          )
      )
    );
  }

  return (
    <section className={style.activityFeed}>
      <h2 className={style.activityTitle}>
        🔔 Центр активности
      </h2>

      {activities.length === 0 && (
        <div className={style.emptyActivity}>
          ❤️ Пока ничего нового
        </div>
      )}

      {activities.map((activity) => (
        <motion.div
          key={`${activity.type}-${activity.id}`}
          className={style.activityCard}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          {activity.type === "memory" && activity.image && (
            <img
              className={style.activityImage}
              src={activity.image}
              alt={activity.title}
            />
          )}

          <div className={style.activityContent}>
            <span className={style.activityBadge}>
              {activity.icon} {activity.title}
            </span>

            <h3>{activity.author}</h3>

            <p>{activity.text}</p>

            <small>
              {new Date(
                activity.created_at
              ).toLocaleString("ru-RU")}
            </small>

            <Link
              to={activity.link}
              className={style.activityButton}
              onClick={() => markAsRead(activity)}
            >
              Открыть →
            </Link>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
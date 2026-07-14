import { useState } from "react";
import { supabase } from "../lib/supabase";
import style from "../assets/styles/index.module.css";
import { motion } from "framer-motion";

const icons = {
  thought: "💭",
  feeling: "❤️",
  question: "❓",
  dream: "🌙",
  memory: "📸",
};

export default function Card({ post, currentUser, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(post.content);
  const isOwner = currentUser?.id === post.author_id;


  async function deletePost() {
    const ok = window.confirm("Удалить запись?");

    if (!ok) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdate();
  }

  async function savePost() {
    const { error } = await supabase
      .from("posts")
      .update({
        content: text,
      })
      .eq("id", post.id);

    if (error) {
      alert(error.message);
      return;
    }

    setIsEditing(false);
    onUpdate();
  }

  return (
    <motion.div
      className={style.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={style.cardHeader}>
        <div>
          <span className={style.cardIcon}>
            {icons[post.category] || "📝"}
          </span>

          <span className={style.cardAuthor}>
            {post.profiles?.name}
          </span>
        </div>

        <span className={style.cardDate}>
          {new Date(post.created_at).toLocaleDateString("ru-RU")}
        </span>
      </div>

      {isEditing ? (
        <textarea
          className={style.editArea}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <p className={style.cardText}>
          {post.content}
        </p>
      )}

      

      {isOwner && (
        <div className={style.cardActions}>
          {isEditing ? (
            <>
              <button onClick={savePost}>💾</button>
              <button onClick={() => setIsEditing(false)}>❌</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>
                ✏️
              </button>

              <button onClick={deletePost}>
                🗑️
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
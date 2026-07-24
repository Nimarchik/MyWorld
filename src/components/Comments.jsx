import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StickerPicker from "./StickerPicker";
import style from "../assets/styles/index.module.css";

export default function Comments({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);

  // =====================================
  // ЗАГРУЗКА КОММЕНТАРИЕВ
  // =====================================

  async function loadComments() {
    if (!postId) return;

    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        author_id,
        content,
        sticker_url,
        created_at,
        profiles!comments_author_id_fkey (
          name
        )
      `)
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Ошибка загрузки комментариев:",
        error
      );

      return;
    }

    console.log("Загруженные комментарии:", data);

    setComments(data || []);
  }

  // =====================================
  // REALTIME
  // =====================================

  useEffect(() => {
    if (!postId) return;

    loadComments();

    const channel = supabase
      .channel(`comments-${postId}-${Date.now()}`)

      // =========================
      // НОВЫЙ КОММЕНТАРИЙ
      // =========================

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          console.log(
            "REALTIME INSERT:",
            payload.new
          );

          // Получаем профиль автора
          const { data: profile, error } =
            await supabase
              .from("profiles")
              .select("name")
              .eq(
                "id",
                payload.new.author_id
              )
              .single();

          if (error) {
            console.error(
              "Ошибка получения профиля:",
              error
            );
          }

          const newComment = {
            ...payload.new,
            profiles: profile,
          };

          setComments((prev) => {
            // Защита от дубликатов
            if (
              prev.some(
                (comment) =>
                  comment.id ===
                  newComment.id
              )
            ) {
              return prev;
            }

            return [
              ...prev,
              newComment,
            ];
          });
        }
      )

      // =========================
      // УДАЛЕНИЕ
      // =========================

      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log(
            "REALTIME DELETE:",
            payload.old
          );

          const deletedId =
            payload.old?.id;

          if (!deletedId) return;

          setComments((prev) =>
            prev.filter(
              (comment) =>
                comment.id !==
                deletedId
            )
          );
        }
      )

      .subscribe((status) => {
        console.log(
          "COMMENTS REALTIME:",
          status
        );
      });

    return () => {
      console.log(
        "Отключаем Comments Realtime"
      );

      supabase.removeChannel(channel);
    };
  }, [postId]);

  // =====================================
  // ДОБАВИТЬ КОММЕНТАРИЙ
  // =====================================

  async function addComment(e) {
    e.preventDefault();

    if (!currentUser) {
      console.error("Пользователь не авторизован");
      return;
    }

    const cleanText = text.trim();

    // Нельзя отправить полностью пустой комментарий
    if (!cleanText && !selectedSticker) {
      console.log("Нет текста и стикера");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: currentUser.id,
          content: cleanText || null,
          sticker_url: selectedSticker || null,
        })
        .select(`
        id,
        post_id,
        author_id,
        content,
        sticker_url,
        created_at
      `)
        .single();

      if (error) {
        console.error(
          "Ошибка добавления комментария:",
          error
        );
        return;
      }

      console.log("Комментарий отправлен:", data);

      // Очищаем форму только после успешной отправки
      setText("");
      setSelectedSticker(null);

    } catch (error) {
      console.error(
        "Ошибка отправки:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // УДАЛИТЬ КОММЕНТАРИЙ
  // =====================================

  async function deleteComment(commentId) {
    if (!currentUser) return;

    const ok = window.confirm(
      "Удалить комментарий?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq(
        "author_id",
        currentUser.id
      );

    if (error) {
      console.error(
        "Ошибка удаления комментария:",
        error
      );

      return;
    }

    // Сразу удаляем у себя
    setComments((prev) =>
      prev.filter(
        (comment) =>
          comment.id !== commentId
      )
    );
  }

  return (
    <div className={style.comments}>

      <h3 className={style.commentsTitle}>
        💬 Комментарии
      </h3>

      {/* ================================= */}
      {/* СПИСОК КОММЕНТАРИЕВ */}
      {/* ================================= */}

      <div className={style.commentsList}>

        {comments.length === 0 && (
          <p className={style.noComments}>
            Пока нет комментариев ❤️
          </p>
        )}

        {comments.map((comment) => {
          const isMyComment =
            comment.author_id ===
            currentUser?.id;

          return (
            <div
              key={comment.id}
              className={style.comment}
            >

              {/* ========================= */}
              {/* HEADER */}
              {/* ========================= */}

              <div
                className={
                  style.commentHeader
                }
              >

                <strong>
                  {comment.profiles?.name ||
                    "Пользователь"}
                </strong>

                {isMyComment && (
                  <button
                    className={
                      style.deleteComment
                    }
                    onClick={() =>
                      deleteComment(
                        comment.id
                      )
                    }
                  >
                    ×
                  </button>
                )}

              </div>

              {/* ========================= */}
              {/* ТЕКСТ */}
              {/* ========================= */}
              <div className={style.commentsContent}>
                {comment.content && (
                  <p
                    className={
                      style.commentText
                    }
                  >
                    {comment.content}
                  </p>
                )}

                {/* ========================= */}
                {/* СТИКЕР */}
                {/* ========================= */}

                {comment.sticker_url && (
                  <video
                    src={comment.sticker_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`${style.commentSticker} ${comment.content
                      ? style.stickerWithText
                      : style.stickerOnly
                      }`}
                  />
                )}
              </div>

              {/* ========================= */}
              {/* ДАТА */}
              {/* ========================= */}

              <span
                className={
                  style.commentDate
                }
              >
                {new Date(
                  comment.created_at
                ).toLocaleString(
                  "ru-RU",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>

            </div>
          );
        })}

      </div>

      {/* ================================= */}
      {/* ПРЕДПРОСМОТР СТИКЕРА */}
      {/* ================================= */}

      {selectedSticker && (
        <div
          className={
            style.selectedSticker
          }
        >

          <video
            src={selectedSticker}
            autoPlay
            loop
            muted
            playsInline
          />

          <button
            type="button"
            onClick={() => {
              setSelectedSticker(null);
            }}
          >
            ×
          </button>

        </div>
      )}

      {/* ================================= */}
      {/* ФОРМА */}
      {/* ================================= */}

      <form
        className={style.commentForm}
        onSubmit={addComment}
      >

        <StickerPicker
          onSelect={(stickerUrl) => {
            console.log("Выбран стикер:", stickerUrl);
            setSelectedSticker(stickerUrl);
          }}
        />

        <input
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Написать комментарий..."
          maxLength={500}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || (!text.trim() && !selectedSticker)}
        >
          {loading ? "..." : "➤"}
        </button>
      </form>

    </div>
  );
}
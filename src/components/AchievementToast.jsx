import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function AchievementToast({
  visible,
  title,
  description,
  onClose,
}) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, 6500);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={style.toast}>
      <div className={style.icon}>🏆</div>

      <div className={style.content}>
        <span className={style.small}>
          Новая пасхалка
        </span>

        <h3>{title}</h3>

        <p>{description}</p>
      </div>
    </div>
  );
}
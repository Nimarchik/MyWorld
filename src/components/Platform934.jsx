import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function Platform934({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={style.platformOverlay}
      onClick={onComplete}
    >
      <div className={style.platformScene}>
        <div className={style.platformNumber}>
          9¾
        </div>

        <div className={style.platformText}>
          <p>
            Платформа 9¾
          </p>

          <span>
            Иногда нужно просто знать,
            где искать.
          </span>
        </div>
      </div>
    </div>
  );
}
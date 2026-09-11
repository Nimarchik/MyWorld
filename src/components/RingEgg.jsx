import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function RingEgg({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 7000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={style.ringOverlay}
      onClick={onComplete}
    >
      <div className={style.ringScene}>
        <div className={style.ringGlow} />

        <div className={style.ring}>
          <div className={style.ringInner} />
        </div>

        <div className={style.ringText}>
          <p>Оно выбрало тебя.</p>

          <span>
            One Ring to rule them all...
          </span>
        </div>
      </div>
    </div>
  );
}
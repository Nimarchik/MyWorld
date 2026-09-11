import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function Watcher({ onClick }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClick?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClick]);

  return (
    <div
      className={style.watcher}
      onClick={onClick}
    >
      <div className={style.watcherFigure}>
        <div className={style.watcherHead} />

        <div className={style.watcherBody} />

        <div className={style.watcherEyes}>
          <span />
          <span />
        </div>
      </div>

      <div className={style.watcherText}>
        ...
      </div>
    </div>
  );
}
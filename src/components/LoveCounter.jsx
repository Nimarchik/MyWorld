import { useEffect, useState } from "react";
import style from "../assets/styles/index.module.css";

export default function LoveCounter() {
  const startDate = new Date("2026-05-07T00:00:00");

  const getDays = () => {
    const today = new Date();

    const diff = today - startDate;

    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const [days, setDays] = useState(getDays());

  useEffect(() => {
    const interval = setInterval(() => {
      setDays(getDays());
    }, 60000); // проверяем раз в минуту

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={style.counter}>
      <div className={style.counterHeart}>❤️</div>

      <div>
        <h2>{days} дней</h2>
        <p>вместе с 7 мая 2026</p>
      </div>
    </div>
  );
}
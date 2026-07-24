import { useMemo } from "react";
import style from "../../../assets/styles/index.module.css";

export default function Stars() {

  const stars = useMemo(() => {

    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
    }));

  }, []);

  return (
    <div className={style.stars}>

      {stars.map(star => (

        <span
          key={star.id}
          className={style.star}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
        />

      ))}

    </div>
  );
}
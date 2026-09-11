import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function HobbitEgg({ onComplete }) {
 
  return (
    <div
      className={style.hobbitOverlay}
      onClick={onComplete}
    >
      <div className={style.hobbitScene}>
        <div className={style.hobbitMoon} />

        <div className={style.hobbitDoor}>
          <div className={style.hobbitDoorHandle} />
        </div>

        <div className={style.hobbitText}>
          <p>Туда и обратно</p>

          <span>
            Некоторые путешествия стоит совершить дважды.
          </span>
        </div>
      </div>
    </div>
  );
}
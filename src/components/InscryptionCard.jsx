import { useEffect, useState } from "react";
import style from "../assets/styles/index.module.css";
import gorn from '../assets/img/gorn.webp'

const dialogue = [
  "...",
  "Ты наконец проснулся.",
  "Я уже давно наблюдаю за тобой.",
  "Сегодня ты заслужил новую карту.",
];

export default function InscryptionCard({ onComplete }) {
  const [line, setLine] = useState(0);
  const [text, setText] = useState("");

  const [showCard, setShowCard] =
    useState(false);

  const [flip, setFlip] =
    useState(false);

  useEffect(() => {
    if (line >= dialogue.length) {
      setTimeout(() => {
        setShowCard(true);
      }, 700);

      return;
    }

    let i = 0;

    const interval = setInterval(() => {
      setText(
        dialogue[line].slice(0, i)
      );

      i++;

      if (i > dialogue[line].length) {
        clearInterval(interval);

        setTimeout(() => {
          setLine((p) => p + 1);
        }, 1200);
      }
    }, 35);

    return () => clearInterval(interval);

  }, [line]);


  return (
    <div className={style.inscryptionOverlay}>

      <div className={style.leshyEyes}>
        <span />
        <span />
      </div>

      {!showCard && (
        <div className={style.leshyText}>
          {text}
        </div>
      )}

      {showCard && (
        <div
          className={`${style.inscryptionCard}
          ${flip ? style.flip : ""}`}
        >

          <div className={style.front}>

            <img
              src={gorn}
              alt="Stoat"
              className={style.cardImage}
            />

            <button
              onClick={() =>
                setFlip(true)
              }
            >
              Взять карту
            </button>

          </div>

          <div className={style.back}>
            <div>
              <h2>
                Карта получена
              </h2>

              <p>
                Теперь она принадлежит тебе.
              </p>


            </div>
            <button
              onClick={() => {
                console.log("Продолжить");
                onComplete?.();
              }}
            >
              Продолжить
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
import { useEffect, useState } from "react";
import style from "../assets/styles/index.module.css";
import { unlockEgg, hasUnlockedEgg } from "../lib/easterEggs";
import { useAchievement } from "../context/AchievementContext";

const messages = [
  "> Система обнаружила бездействие...",
  "> Проверка памяти...",
  "> Найдены скрытые воспоминания...",
  "> Проснись...",
];

export default function MatrixGlitch() {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [line, setLine] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const { unlock, achievements } = useAchievement();

  useEffect(() => {
    let timer;
    let active = true;

    async function setupMatrix() {
      const unlocked = await hasUnlockedEgg("matrix");

      // Если уже получил Matrix — больше ничего не делаем
      if (unlocked) return;

      function resetTimer() {
        if (!active) return;

        clearTimeout(timer);

        setGlitch(true);

        timer = setTimeout(() => {
          if (!active) return;

          setVisible(true);
          setGlitch(false);
        }, 60000);
      }

      resetTimer();

      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);

      // Сохраняем функцию для cleanup
      cleanupListeners = () => {
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("click", resetTimer);
      };
    }

    let cleanupListeners = () => { };

    setupMatrix();

    return () => {
      active = false;

      clearTimeout(timer);

      cleanupListeners();
    };
  }, []);

  useEffect(() => {
    if (!glitch) return;

    document.body.style.filter = "contrast(180%) brightness(80%)";

    return () => {
      document.body.style.filter = "";
    };
  }, [glitch]);

  useEffect(() => {
    if (!visible) return;

    if (line >= messages.length) return;

    let index = 0;

    const interval = setInterval(() => {
      setText(messages[line].slice(0, index));

      index++;

      if (index > messages[line].length) {
        clearInterval(interval);

        setTimeout(() => {
          setText("");

          setLine((prev) => prev + 1);
        }, 700);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [visible, line]);

  if (!visible) return null;

  return (
    <>
      <div className={style.matrixOverlay}>
        <div className={style.matrixWindow}>
          <pre>{text}</pre>

          {line >= messages.length && (
            <button
              onClick={async () => {
                const egg = await unlockEgg("matrix");

                if (egg) {
                  unlock(egg);

                }

                setVisible(false);
                setLine(0);
                setText("");
                setGlitch(false);
              }}
            >
              Вернуться
            </button>
          )}
        </div>
      </div>
    </>);
}
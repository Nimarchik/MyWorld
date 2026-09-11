import { motion } from "framer-motion";
import style from "../assets/styles/index.module.css";
import ImageModal from "./ImageModal";
import { useRef, useState } from "react";

export default function MemoryCard({
  memory,
  onSecretHold,
}) {
  const [open, setOpen] = useState(false);

  const holdTimer = useRef(null);
  const isHolding = useRef(false);

  function startHold() {
    isHolding.current = false;

    holdTimer.current = setTimeout(() => {
      isHolding.current = true;

      onSecretHold?.();
    }, 1500);
  }

  function cancelHold() {
    clearTimeout(holdTimer.current);
  }

  function handleImageClick() {
    // Если это было удержание — обычный modal не открываем
    if (isHolding.current) {
      isHolding.current = false;
      return;
    }

    setOpen(true);
  }

  return (
    <>
      <motion.div
        className={style.memoryCard}
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        whileHover={{
          y: -8,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <img
          className={style.memoryImage}
          src={memory.image}
          alt={memory.title}
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onClick={handleImageClick}
          draggable={false}
        />

        <div className={style.memoryContent}>
          <h3>{memory.title}</h3>

          <div className={style.memoryInfo}>
            <span>
              📍 {memory.place}
            </span>

            <span>
              📅{" "}
              {memory.memory_date &&
                new Date(
                  memory.memory_date
                ).toLocaleDateString("ru-RU")}
            </span>
          </div>

          <p>
            {memory.description}
          </p>

          <small>
            ❤️ {memory.profiles?.name}
          </small>
        </div>
      </motion.div>

      <ImageModal
        image={open ? memory.image : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
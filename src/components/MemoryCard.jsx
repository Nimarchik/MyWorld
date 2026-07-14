import { motion } from "framer-motion";
import style from "../assets/styles/index.module.css";
import ImageModal from "./ImageModal";
import { useState } from "react";


export default function MemoryCard({ memory }) {
  const [open, setOpen] = useState(false);
  return (<>
    <motion.div
      className={style.memoryCard}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <img
        className={style.memoryImage}
        src={memory.image}
        alt={memory.title}
        onClick={() => setOpen(true)}
      />

      <div className={style.memoryContent}>
        <h3>{memory.title}</h3>

        <div className={style.memoryInfo}>
          <span>📍 {memory.place}</span>

          <span>
            📅{" "}
            {memory.memory_date &&
              new Date(memory.memory_date).toLocaleDateString("ru-RU")}
          </span>
        </div>

        <p>{memory.description}</p>

        <small>❤️ {memory.profiles?.name}</small>
      </div>

    </motion.div>
    <ImageModal
      image={open ? memory.image : null}
      onClose={() => setOpen(false)}
    />
  </>);
}
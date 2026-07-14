import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import style from "../assets/styles/index.module.css";

export default function ImageModal({ image, onClose }) {

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className={style.modal}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            className={style.modalImage}
            src={image}
            alt=""
            onClick={(e) => e.stopPropagation()}
            initial={{
              scale: .8,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: .8,
              opacity: 0
            }}
            transition={{
              duration: .25
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
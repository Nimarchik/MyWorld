import { motion } from "framer-motion";
import style from "../assets/styles/index.module.css";

export default function Hero() {
  return (
    <section className={style.hero}>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .8 }}
      >

        <h1>
          Nimarchik
          <span> ❤ </span>
          Monorochka
        </h1>

        <p>
          Наша история только начинается...
        </p>

      </motion.div>

    </section>
  );
}
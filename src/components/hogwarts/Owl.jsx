import style from "../../assets/styles/index.module.css";

export default function Owl({ onClick }) {
  return (
    <div
      className={style.owl}
      onClick={onClick}
    >
      🦉
    </div>
  );
}
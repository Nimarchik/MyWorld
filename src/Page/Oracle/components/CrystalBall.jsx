import style from "../../../assets/styles/index.module.css";

export default function CrystalBall({ loading, onClick }) {

  return (

    <div
      className={`${style.ball} ${loading ? style.loading : ""}`}
      onClick={onClick}
    >

      <div className={style.glow}></div>

      <div className={style.inner}></div>

      <div className={style.reflect}></div>

    </div>

  );
}
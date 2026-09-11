import { useState } from "react";
import { unlockEgg } from "../../lib/easterEggs";
import style from "../../assets/styles/index.module.css";
import { useAchievement } from "../../context/AchievementContext";
import hog from '../../assets/img/trafaret-papik-pro-fut8-p-trafareti-pismo-iz-khogvartsa-2.jpg'
import letters from '../../assets/img/trafaret-papik-pro-fyg0-p-trafareti-pismo-iz-khogvartsa-17.jpg'

export default function HogwartsLetter() {
  const [opened, setOpened] = useState(false);
  const [closed, setClosed] = useState(false);
  const { unlock } = useAchievement()



  if (closed) return null;

  async function openLetter() {
    setOpened(true);

    const egg = await unlockEgg("harry_letter");

    if (egg) {
      unlock(egg)
    }
  }

  return (
    <>
      <div className={style.overlay}>
        <div
          className={`${style.letter} ${opened ? style.opened : ""
            }`}
        >
          {!opened ? (
            <>
              <img src={letters} alt="" onClick={openLetter} className={style.letterss} />
              {/* <div className={style.seal}>🦉</div>

              <button
                className={style.button}
                onClick={openLetter}
              >
                Открыть письмо */}
              {/* </button> */}
            </>
          ) : (
            <>
              <div className={style.hogBox} onClick={() => setClosed(true)}>
                <img src={hog} alt="" className={style.hogImg} />

                <div className={style.hogBoxContent}>

                  <div>
                    {/* <h2 className={style.hogTitle}>Школа Чародейства и Волшебства</h2> */}

                    {/* <h3 className={style.hogTitle}>Хогвартс</h3> */}

                    <p className={style.hogSub}>
                      Уважаемый исследователь.
                    </p>

                    <p className={style.hogSub}>
                      Вы были замечены.
                    </p>

                    <p className={style.hogSub}>
                      Способность находить скрытое —
                      крайне редкий дар.
                    </p>

                    <p className={style.hogSub}>
                      Добро пожаловать.
                    </p>
                  </div>
                  {/* <button
                    className={style.button}
                    onClick={() => setClosed(true)}
                  >
                    Закрыть
                  </button> */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>);
}
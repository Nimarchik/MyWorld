import { useState } from "react";
import style from "../../assets/styles/index.module.css";
import { supabase } from "../../lib/supabase";

export default function Oracle() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [mode, setMode] = useState("single");

  const generatePrediction = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Получаем текущего пользователя
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Пользователь не найден");
        setLoading(false);
        return;
      }

      // Получаем профиль
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("zodiac, partner_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
        setLoading(false);
        return;
      }

      let body;

      if (mode === "single") {
        body = {
          mode: "single",
          zodiac: profile.zodiac,
        };
      } else {
        // Получаем профиль партнера
        const { data: partner, error: partnerError } = await supabase
          .from("profiles")
          .select("zodiac")
          .eq("id", profile.partner_id)
          .single();

        if (partnerError) {
          console.error(partnerError);
          setLoading(false);
          return;
        }

        body = {
          mode: "couple",
          myZodiac: profile.zodiac,
          partnerZodiac: partner.zodiac,
        };
      }

      // Запрашиваем предсказание
      const { data, error } = await supabase.functions.invoke("oracle", {
        body,
      });

      if (error) {
        const text = await error.context?.text?.();
        console.error(text || error);
        setLoading(false);
        return;
      }

      setPrediction(data.prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={style.oracle}>
      <div className={style.background}></div>

      <div className={style.oracleGroup}>
        <div className={style.oracleBlock}>
          <h1 className={style.title}> <span>🔮</span>  Предсказание</h1>

          <p className={style.subtitle}>
            Коснись шара и узнай,
            <br />
            что приготовила тебе судьба.
          </p>

          <div className={style.tabs}>
            <button
              className={mode === "single" ? style.activeTab : ""}
              onClick={() => {
                setMode("single");
                setPrediction("");
              }}
            >
              🔮 Моё предсказание
            </button>

            <button
              className={mode === "couple" ? style.activeTab : ""}
              onClick={() => {
                setMode("couple");
                setPrediction("");
              }}
            >
              ❤️ Наше предсказание
            </button>
          </div>

          <div
            className={`${style.ball} ${loading ? style.active : ""}`}
            onClick={generatePrediction}
          >
            🔮
          </div>
        </div>

        <div className={style.oracleBLocks}>
          

          {loading && (
            <div className={style.loading}>
              ✨ Вселенная читает звёзды...
            </div>
          )}

          {prediction && (
            <div className={style.cardOracle}>
              <h2>
                {mode === "single"
                  ? "🔮 Предсказание"
                  : "❤️ Предсказание для вашей пары"}
              </h2>

              <p className={style.predict}>{prediction}</p>


            </div>
          )}
        </div>
      </div>
    </section>
  );
}
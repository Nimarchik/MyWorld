import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { animated, useTransition } from "@react-spring/web";


import { supabase } from "../../lib/supabase";

import Header from "../../components/Header";
import PushNotifications from "../../components/PushNotifications";

import style from "../../assets/styles/index.module.css";
import MatrixGlitch from "../../components/MatrixGlitch";
import Owl from "../../components/hogwarts/Owl";
import HogwartsLetter from "../../components/hogwarts/HogwartsLetter";
import AchievementManager from "../../components/AchievementManager";
import InscryptionCard from "../../components/InscryptionCard";
import { useAchievement } from "../../context/AchievementContext";
import { unlockEgg, hasUnlockedEgg } from "../../lib/easterEggs";
import Watcher from "../../components/Watcher";



export default function Home() {
  const location = useLocation();
  const [showOwl, setShowOwl] = useState(false);
  const { unlock } = useAchievement()
  const [showInscryption, setShowInscryption] = useState(false)
  const [showLetter, setShowLetter] = useState(false);
  const [showWatcher, setShowWatcher] = useState(false);

  const [user, setUser] =
    useState(null);

  useEffect(() => {
    let inscryptionTimer;
    let owlTimer;
    let owlHideTimer;

    async function setupEasterEggs() {
      // =========================
      // USER
      // =========================

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) return;


      // =========================
      // INSCRYPTION
      // =========================

      const inscryptionUnlocked =
        await hasUnlockedEgg("inscryption");

      if (!inscryptionUnlocked) {
        const lastShow = Number(
          localStorage.getItem("lastInscryption") || 0
        );

        const oneHour = 1000 * 60 * 60;

        if (Date.now() - lastShow > oneHour) {
          const chance = Math.random();

          // 3% шанс
          if (chance <= 0.03) {
            inscryptionTimer = setTimeout(() => {
              setShowInscryption(true);

              localStorage.setItem(
                "lastInscryption",
                Date.now().toString()
              );
            }, 4000);
          }
        }
      }


      // =========================
      // HOGWARTS
      // =========================

      const hogwartsUnlocked =
        await hasUnlockedEgg("hogwarts");

      if (!hogwartsUnlocked) {
        const chance = Math.random();

        // 5% шанс
        if (chance <= 0.05) {
          owlTimer = setTimeout(() => {
            setShowOwl(true);

            // Через 6 секунд сова улетает
            owlHideTimer = setTimeout(() => {
              setShowOwl(false);
            }, 6000);
          }, 3000);
        }
      }
    }

    setupEasterEggs();


    // =========================
    // CLEANUP
    // =========================

    return () => {
      clearTimeout(inscryptionTimer);
      clearTimeout(owlTimer);
      clearTimeout(owlHideTimer);
    };
  }, []);

  const transitions =
    useTransition(location, {
      from: {
        opacity: 0,
        transform:
          "translateY(100%)",
        position: "relative",
        flexGrow: 1,
      },

      enter: {
        opacity: 1,
        transform:
          "translateY(0)",
        flexGrow: 1,
      },
    });




  return (
    <>
      <div
        className={style.space}
      />

      <div
        className={style.wrapper}
      >
        <Header />

        <PushNotifications
          user={user}
        />

        <main
          className={style.main}
        >
          <MatrixGlitch />
          <AchievementManager />
          {showOwl && (
            <Owl
              onClick={() => {
                setShowOwl(false);
                setShowLetter(true);
              }}
            />
          )}

          {showLetter && (
            <HogwartsLetter />
          )}


          {
            showInscryption && (
              <InscryptionCard
                onComplete={async () => {
                  const egg = await unlockEgg("inscryption");

                  if (egg) {
                    unlock(egg);
                  }

                  setShowInscryption(false);
                }}
              />
            )
          }

          {showWatcher && (
            <Watcher
              onClick={async () => {
                const egg = await unlockEgg("watcher");

                if (egg) {
                  unlock(egg);
                }

                setShowWatcher(false);
              }}
            />
          )}

          {transitions(
            (styles, location) => (
              <animated.div
                className={
                  style.animated
                }
                style={styles}
              >
                <div
                  className={
                    style.container
                  }
                >
                  <Outlet
                    location={
                      location
                    }
                  />
                </div>
              </animated.div>
            )
          )}
        </main>
      </div>
    </>
  );
}
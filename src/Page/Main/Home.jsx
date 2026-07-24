import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { animated, useTransition } from "@react-spring/web";

import { supabase } from "../../lib/supabase";

import Header from "../../components/Header";
import PushNotifications from "../../components/PushNotifications";

import style from "../../assets/styles/index.module.css";

export default function Home() {
  const location = useLocation();

  const [user, setUser] =
    useState(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();
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
          {transitions(
            (style, location) => (
              <animated.div
                className={
                  style.animated
                }
                style={style}
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
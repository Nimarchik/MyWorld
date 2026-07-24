import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import style from "../../assets/styles/index.module.css";

import Hero from "../../components/Hero";
import LoveCounter from "../../components/LoveCounter";
import Stats from "../../components/Stats";
import ActivityFeed from "../../components/ActivityFeed";

const Statistic = () => {
  const [user, setUser] = useState(null);



  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();
  }, []);



  return (
    <div className={style.container}>
      <div className={style.stat}>
        <Hero />

        <LoveCounter />

        <div className={style.statContenr}>
          <Stats />

          {user && (
            <ActivityFeed user={user} />
          )}

        </div>
      </div>
    </div>
  );
};

export default Statistic;
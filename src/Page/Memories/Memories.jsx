import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AddMemory from "../../components/AddMemory";
import MemoryCard from "../../components/MemoryCard";
import style from "../../assets/styles/index.module.css";
import Platform934 from "../../components/Platform934";
import {
  hasUnlockedEgg,
  unlockEgg,
} from "../../lib/easterEggs";

import { useAchievement } from "../../context/AchievementContext";
import HobbitEgg from "../../components/HobbitEgg";


export default function Memories() {
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState([]);
  const [show, setShow] = useState(false)
  const [shows, setShows] = useState(false);
  const { unlock } = useAchievement();
  const [showPlatform, setShowPlatform] =
    useState(false);
  const [showHobbit, setShowHobbit] = useState(false);

  useEffect(() => {
    loadUser();
    loadMemories();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function loadMemories() {
    const { data, error } = await supabase
      .from("memories")
      .select(`*`)
      .order("memory_date", { ascending: false });

    // if (error) {
    //   console.error(error);
    //   return;
    // }

    console.log("DATA:", data);
    console.log("ERROR:", error);

    setMemories(data || []);

    const { data: reads } = await supabase
      .from("memory_reads")
      .select("memory_id")
      .eq("user_id", user.id);

    const readIds = new Set(reads?.map(r => r.memory_id));

    const unreadMemories = (data || []).filter(
      memory =>
        memory.author_id !== user.id &&
        !readIds.has(memory.id)
    );

    if (unreadMemories.length > 0) {
      await supabase
        .from("memory_reads")
        .insert(
          unreadMemories.map(memory => ({
            memory_id: memory.id,
            user_id: user.id,
          }))
        );
    }
  }

  console.log(memories);

  return (<>


    {showPlatform && (
      <Platform934
        onComplete={async () => {
          setShowPlatform(false);

          const egg = await unlockEgg("platform934");

          if (egg) {
            unlock(egg);
          }
        }}
      />
    )}


    {showHobbit && (
      <HobbitEgg
        onComplete={async () => {
          setShowHobbit(false);

          const egg = await unlockEgg("hobbit");

          if (egg) {
            unlock(egg);
          }
        }}
      />
    )}
    <div className={style.container}>
      <div className={style.memories}>
        <h1 className={style.momoeriesTitle}>📸 Воспоминания</h1>
        <button
          className={style.hiddenPlatform}
          onClick={async () => {
            const alreadyUnlocked =
              await hasUnlockedEgg("platform934");

            if (alreadyUnlocked) {
              return;
            }

            setShowPlatform(true);
          }}
          aria-label="9¾"
        >
          9¾
        </button>
        <button className={style.memoriesBtn} onClick={() => setShow(!show)}>
          <span className={style.spn2}> Добавить</span>
        </button>

        <div className={show ? style.memoriesAddFormActive : style.memoriesAddForm}>

          {user && (
            <AddMemory
              user={user}
              onSaved={loadMemories}
            />
          )}
        </div>

        <div className={style.memoriesGrid}>
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onSecretHold={async () => {
                const alreadyUnlocked =
                  await hasUnlockedEgg("hobbit");

                if (alreadyUnlocked) {
                  return;
                }

                setShowHobbit(true);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </>);
}
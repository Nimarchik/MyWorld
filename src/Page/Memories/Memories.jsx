import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AddMemory from "../../components/AddMemory";
import MemoryCard from "../../components/MemoryCard";
import style from "../../assets/styles/index.module.css";


export default function Memories() {
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState([]);
  const [show, setShow] = useState(false)

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

  return (
    <div className={style.container}>
      <div className={style.memories}>
        <h1 className={style.momoeriesTitle}>📸 Воспоминания</h1>
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
          {memories.map(memory => (
            <MemoryCard
              key={memory.id}
              memory={memory}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
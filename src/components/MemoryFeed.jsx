import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MemoryFeed({ user }) {

  const [memories, setMemories] = useState([]);

  useEffect(() => {

    if (user) {
      load();
    }

  }, [user]);

  async function load() {

    const { data: reads } = await supabase
      .from("memory_reads")
      .select("memory_id")
      .eq("user_id", user.id);

    const readIds = reads.map(r => r.memory_id);

    let query = supabase
      .from("memories")
      .select(`
        *,
        profiles(name)
      `)
      .neq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (readIds.length) {

      query = query.not("id", "in", `(${readIds.join(",")})`);

    }

    const { data } = await query;

    setMemories(data || []);

  }

  return (
    <>
      {memories.map(memory => (
        <div key={memory.id}>
          📸 {memory.profiles.name} добавил(а)
          <br />
          <b>{memory.title}</b>
        </div>
      ))}
    </>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Editor from "../../components/Editor";
import style from '../../assets/styles/index.module.css'
import Card from "../../components/Card";
import { AnimatePresence } from "framer-motion";


export default function Diary() {
  const [user, setUser] = useState(null);
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setMyName(profile.name);

      if (profile.name === "Nimarchik") {
        setPartnerName("Monorochka");
      } else {
        setPartnerName("Nimarchik");
      }
    }


    load();
  }, []);


  const [posts, setPosts] = useState([]);

  async function loadPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(`
      *,
      profiles!posts_author_id_fkey(name)
    `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPosts(data || []);

    // Получаем уже прочитанные записи
    const { data: reads, error: readsError } = await supabase
      .from("post_reads")
      .select("post_id")
      .eq("user_id", user.id);

    if (readsError) {
      console.error(readsError);
      return;
    }

    const readIds = new Set(reads.map(item => item.post_id));

    // Только записи второго пользователя, которые еще не прочитаны
    const unreadPosts = (data || []).filter(
      post =>
        post.author_id !== user.id &&
        !readIds.has(post.id)
    );

    if (unreadPosts.length > 0) {
      const { error: insertError } = await supabase
        .from("post_reads")
        .insert(
          unreadPosts.map(post => ({
            post_id: post.id,
            user_id: user.id,
          }))
        );

      if (insertError) {
        console.error(insertError);
      }
    }
  }

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const myProfile = posts.filter(
    post => post.author_id === user?.id
  );

  const partnerProfile = posts.filter(
    post => post.author_id !== user?.id
  );




  return (<>
    <div className={style.container}>
      <div className={style.diaryTop}>
        <h1 className={style.diaryTitle}>
          Пиши сюда что хочешь сказать)
        </h1>
      </div>
      <div className={style.diary}>

        <div className={style.column}>
          <h2> {myName}

          </h2>

          <Editor
            user={user}
            onSaved={loadPosts}
          />
          <AnimatePresence>
            {myProfile.map(post => (
              <Card
                key={post.id}
                post={post}
                currentUser={user}
                onUpdate={loadPosts}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className={style.column}>

          <h2> {partnerName}</h2>
          <AnimatePresence>

            {partnerProfile.map(post => (
              <Card
                key={post.id}
                post={post}
                currentUser={user}
                onUpdate={loadPosts}
              />
            ))}
          </AnimatePresence>

        </div>

      </div>
    </div>
  </>);
}
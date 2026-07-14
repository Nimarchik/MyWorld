import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import Login from "../Login/Login.jsx";
import Diary from "../Diary/Diary.jsx";
import Home from "../Main/Home.jsx";
import Statistic from "../Statistic/Statistic.jsx";



function App() {

  const [session, setSession] = useState(null);



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);



  if (!session) {
    return <>
      <Login />
    </>
  }

  return <Home />;
}


export default App

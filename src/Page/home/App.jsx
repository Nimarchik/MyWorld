import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import Login from "../Login/Login.jsx";
import Home from "../Main/Home.jsx";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <Home />;
}

export default App;
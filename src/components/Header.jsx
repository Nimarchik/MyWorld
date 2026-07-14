import { Link, NavLink, useNavigate } from 'react-router';
import style from '../assets/styles/index.module.css'
import { supabase } from '../lib/supabase.js'
import { useEffect, useState } from "react";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, online")
        .eq("id", user.id)

        .single()



      if (data) {
        setUserName(data);
      }

    }

    loadProfile();

  }, []);

  async function logout() {
    await supabase.auth.signOut().update({
      online: false,
    });
    navigate("/");
  }

  return (
    <>
      <header className={style.header}>
        <div className={style.container}>
          <nav className={style.nav}>
            <Link className={style.logo}>❤️ Nimarchik & Monorochka</Link>

            <button
              className={style.burger}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <ul
              className={`${style.navList} ${menuOpen ? style.navListOpen : ""
                }`}
            >

              <li className={style.navListItem} >
                <NavLink to='/Main' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Дом
                </NavLink>
              </li>
              <li className={style.navListItem} >
                <NavLink to='Diary' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Дневник
                </NavLink>
              </li>
              <li className={style.navListItem} >
                <NavLink to='/Memories' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Воспоминания
                </NavLink>
              </li>
              <li className={style.navListItem} >
                <NavLink to='Letters' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Письма
                </NavLink>
              </li>
              <li className={style.navListItem} >
                <NavLink to='Calendar' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Календарь
                </NavLink>
              </li>
              <li className={style.navListItem} >
                <NavLink to='Goals' className={style.navListItemLink} onClick={() => setMenuOpen(false)}>
                  Наши цели
                </NavLink>
              </li>
              <li className={style.itemMobile}>
                <div className={style.userMobile}>
                  <span className={style.nickName}>
                    <span
                      className={`${style.status} ${userName.online ? style.online : style.offline
                        }`}
                    ></span>
                    {userName.name}</span>
                  <button className={style.logout} onClick={logout}>
                    <span className={style.spn2}> Выйти</span>
                  </button>
                </div>
              </li>
            </ul>

            <div className={style.user}>
              <span className={style.nickName}>
                <span
                  className={`${style.status} ${userName.online ? style.online : style.offline
                    }`}
                ></span>
                {userName.name}</span>
              <button className={style.logout} onClick={logout}>
                <span className={style.spn2}> Выйти</span>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Header;
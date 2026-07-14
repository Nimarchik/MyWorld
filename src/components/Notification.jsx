import style from "../assets/styles/index.module.css";

export default function Notification({ notification }) {

  if (!notification) return null;

  return (

    <div className={style.notification}>

      <h4>🔔 Новая запись</h4>

      <p>{notification.content}</p>

    </div>

  )

}
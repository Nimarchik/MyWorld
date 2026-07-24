import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import style from "../assets/styles/index.module.css";

const VAPID_PUBLIC_KEY =
  "BPr3lp3KSSeq_HjrhJM0RiXNszX7fuEd-gHVA08j9tqf-xmewAyZavmGQnCodDICm4xslp3-Yy1wRhEsua7tyPo";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

export default function PushNotifications({ user }) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // =====================================
  // ПРОВЕРКА ПОДПИСКИ ПРИ ЗАГРУЗКЕ
  // =====================================

  useEffect(() => {
    async function checkNotifications() {
      try {
        // Проверяем поддержку уведомлений
        if (!("Notification" in window)) {
          return;
        }

        // Проверяем разрешение браузера
        if (Notification.permission !== "granted") {
          setEnabled(false);
          return;
        }

        // Проверяем Service Worker
        if (!("serviceWorker" in navigator)) {
          return;
        }

        // Ждём Service Worker
        const registration =
          await navigator.serviceWorker.ready;

        // Получаем существующую Push-подписку
        const subscription =
          await registration.pushManager.getSubscription();

        if (subscription) {
          console.log(
            "Push-подписка найдена"
          );

          setEnabled(true);
        } else {
          console.log(
            "Push-подписка не найдена"
          );

          setEnabled(false);
        }
      } catch (error) {
        console.error(
          "Ошибка проверки Push:",
          error
        );

        setEnabled(false);
      }
    }

    if (user) {
      checkNotifications();
    }
  }, [user]);

  // =====================================
  // ВКЛЮЧЕНИЕ УВЕДОМЛЕНИЙ
  // =====================================

  async function enableNotifications() {
    if (!user) {
      alert("Пользователь не авторизован");
      return;
    }

    // Проверяем поддержку Service Worker
    if (!("serviceWorker" in navigator)) {
      alert(
        "Ваш браузер не поддерживает Service Worker"
      );
      return;
    }

    // Проверяем поддержку Push
    if (!("PushManager" in window)) {
      alert(
        "Ваш браузер не поддерживает Push-уведомления"
      );
      return;
    }

    setLoading(true);

    try {
      // =====================================
      // 1. Разрешение уведомлений
      // =====================================

      const permission =
        await Notification.requestPermission();

      console.log(
        "Notification permission:",
        permission
      );

      if (permission !== "granted") {
        setEnabled(false);

        alert(
          "Разрешение на уведомления не получено"
        );

        return;
      }

      // =====================================
      // 2. Получаем Service Worker
      // =====================================

      const registration =
        await navigator.serviceWorker.ready;

      // =====================================
      // 3. Получаем существующую подписку
      // =====================================

      let subscription =
        await registration.pushManager.getSubscription();

      // =====================================
      // 4. Создаём подписку если её нет
      // =====================================

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToUint8Array(
                VAPID_PUBLIC_KEY
              ),
          });
      }

      console.log(
        "Push subscription:",
        subscription
      );

      // =====================================
      // 5. Получаем данные подписки
      // =====================================

      const subscriptionJson =
        subscription.toJSON();

      const endpoint =
        subscriptionJson.endpoint;

      const p256dh =
        subscriptionJson.keys?.p256dh;

      const auth =
        subscriptionJson.keys?.auth;

      if (
        !endpoint ||
        !p256dh ||
        !auth
      ) {
        throw new Error(
          "Не удалось получить данные Push-подписки"
        );
      }

      // =====================================
      // 6. Сохраняем подписку в Supabase
      // =====================================

      const { error } =
        await supabase
          .from("push_subscriptions")
          .upsert(
            {
              user_id: user.id,
              endpoint,
              p256dh,
              auth,
            },
            {
              onConflict:
                "user_id,endpoint",
            }
          );

      if (error) {
        console.error(
          "Ошибка сохранения подписки:",
          error
        );

        throw error;
      }

      // =====================================
      // 7. Обновляем состояние
      // =====================================

      setEnabled(true);

      alert(
        "🔔 Уведомления успешно включены!"
      );

    } catch (error) {
      console.error(
        "Ошибка Push:",
        error
      );

      alert(
        error.message ||
        "Не удалось включить уведомления"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={enableNotifications}
      disabled={loading || enabled}
      className={style.pushBtn}
    >
      <span className={style.spn2}>
        {loading
          ? "⏳ Проверяем..."
          : enabled
            ? "🔔 Уведомления включены"
            : "🔔 Включить уведомления"}
      </span>
    </button>
  );
}
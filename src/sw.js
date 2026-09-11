import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// ==========================================
// PUSH
// ==========================================

self.addEventListener("push", (event) => {
  console.log("🔔 PUSH RECEIVED");

  let data = {
    title: "❤️ Nimarchik & Monorochka",
    body: "У тебя новое уведомление ❤️",
    url: "/MyWorld/",
  };

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json(),
      };
    }
  } catch (error) {
    console.error(
      "Ошибка чтения Push:",
      error
    );
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,

        icon:
          "/MyWorld/android-chrome-192x192.png",

        badge:
          "/MyWorld/android-chrome-192x192.png",

        data: {
          url:
            data.url ||
            "/MyWorld/",
        },

        vibrate: [
          200,
          100,
          200,
        ],
      }
    )
  );
});

// ==========================================
// КЛИК ПО PUSH
// ==========================================

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/MyWorld/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {

          for (
            const client of clientList
          ) {
            if (
              "focus" in client
            ) {
              client.navigate(url);

              return client.focus();
            }
          }

          if (
            clients.openWindow
          ) {
            return clients.openWindow(
              url
            );
          }

        })
    );
  }
);
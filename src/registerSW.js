import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("Доступна новая версия приложения");
  },

  onOfflineReady() {
    console.log("Приложение готово к работе офлайн");
  },
});
import {
  createContext,
  useContext,
  useState,
} from "react";

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const [current, setCurrent] = useState(null);

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("achievements");

    return saved ? JSON.parse(saved) : [];
  });


  function unlock(achievement) {
    if (!achievement) return;


    // если уже есть — не добавляем
    if (
      achievements.some(
        (item) => item.id === achievement.id
      )
    ) {
      return;
    }


    // сохраняем полученную ачивку
    setAchievements((prev) => {
      const updated = [
        ...prev,
        achievement,
      ];

      localStorage.setItem(
        "achievements",
        JSON.stringify(updated)
      );

      return updated;
    });


    // показываем уведомление
    setQueue((prev) => [
      ...prev,
      achievement,
    ]);
  }


  return (
    <AchievementContext.Provider
      value={{
        queue,
        setQueue,
        current,
        setCurrent,
        achievements,
        unlock,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}


export function useAchievement() {
  return useContext(AchievementContext);
}
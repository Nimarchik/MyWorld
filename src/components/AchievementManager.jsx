import { useEffect } from "react";

import AchievementToast from "./AchievementToast";
import { useAchievement } from "../context/AchievementContext";

export default function AchievementManager() {
  const {
    queue,
    setQueue,
    current,
    setCurrent,
  } = useAchievement();

  useEffect(() => {
    if (current) return;

    if (queue.length === 0) return;

    setCurrent(queue[0]);

    setQueue((prev) => prev.slice(1));

  }, [queue, current]);

  function closeAchievement() {
    setCurrent(null);
  }

  return (
    <AchievementToast
      visible={!!current}
      title={current?.title}
      description={current?.description}
      onClose={closeAchievement}
    />
  );
}
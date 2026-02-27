import { useState, useEffect, useCallback, useRef } from "react";
import { Router } from "@decky/ui";
import { getAchievements, toggleAchievement } from "../api";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAppId, setCurrentAppId] = useState<string | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAchievements = useCallback(async (appid: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAchievements(Number(appid));
      if (result && Array.isArray(result)) {
        setAchievements(result);
      } else {
        setAchievements([]);
        setError("Failed to load achievements");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const poll = () => {
      const app = Router.MainRunningApp;
      const newAppId = app?.appid;
      setCurrentAppId((prev) => {
        if (prev !== newAppId) {
          if (newAppId) {
            loadAchievements(newAppId);
          } else {
            setAchievements([]);
            setError(null);
          }
          return newAppId;
        }
        return prev;
      });
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadAchievements]);

  const handleToggle = useCallback(
    async (ach: Achievement) => {
      if (!currentAppId || toggling) return;
      const newState = !ach.unlocked;
      setToggling(ach.api_name);
      try {
        const success = await toggleAchievement(Number(currentAppId), ach.api_name, newState);
        if (success) {
          setAchievements((prev) =>
            prev.map((a) =>
              a.api_name === ach.api_name ? { ...a, unlocked: newState } : a
            )
          );
        }
      } catch {
      } finally {
        setToggling(null);
      }
    },
    [currentAppId, toggling]
  );

  const filtered: Record<TabId, Achievement[]> = {
    all: achievements,
    unlocked: achievements.filter((a) => a.unlocked),
    locked: achievements.filter((a) => !a.unlocked),
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements: filtered,
    loading,
    toggling,
    error,
    unlockedCount,
    totalCount,
    handleToggle,
  };
}

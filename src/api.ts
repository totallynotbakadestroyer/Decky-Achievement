import { callable } from "@decky/api";

export const getAchievements = callable<[appid: number], Achievement[]>("get_achievements");
export const toggleAchievement = callable<[appid: number, api_name: string, unlock: boolean], boolean>("toggle_achievement");
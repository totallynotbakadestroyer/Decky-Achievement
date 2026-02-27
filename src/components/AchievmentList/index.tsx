import { FC } from "react";
import { Focusable, Spinner } from "@decky/ui";
import { AchievementItem } from "./AchievementItem";

interface Props {
  achievements: Achievement[];
  isLoading: boolean;
  togglingId: string | null;
  onToggle: (ach: Achievement) => void;
}

export const AchievementList: FC<Props> = ({ achievements, isLoading, togglingId, onToggle }) => {
  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <Spinner style={{ height:"20px", width:"20px" }} />
    </div>;
  
  return (
    <Focusable>
      {achievements.map((ach) => (
        <AchievementItem 
          key={ach.api_name} 
          achievement={ach} 
          isToggling={togglingId === ach.api_name}
          onToggle={onToggle}
        />
      ))}
    </Focusable>
  );
};
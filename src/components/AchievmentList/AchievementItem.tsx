import { FC } from "react";
import { Field, Spinner } from "@decky/ui";
import { FaLock, FaUnlock } from "react-icons/fa";

interface AchievementItemProps {
  achievement: Achievement;
  isToggling: boolean;
  onToggle: (ach: Achievement) => void;
}

export const AchievementItem: FC<AchievementItemProps> = ({ achievement, isToggling, onToggle }) => {
  return (
    <Field
      label={<span style={{ fontSize: "14px", fontWeight: 500 }}>{achievement.name}</span>}
      description={<span style={{ fontSize: "12px" }}>{achievement.desc}</span>}
      icon={
        isToggling
          ? <Spinner style={{ fontSize: "20px", color: "#67707b" }} />
          : achievement.unlocked 
            ? <FaUnlock style={{ fontSize: "20px", color: "#59bf40" }} /> 
            : <FaLock style={{ fontSize: "20px", color: "#67707b" }} />
      }
      bottomSeparator="standard"
      highlightOnFocus={true}
      focusable={!isToggling}
      onActivate={() => onToggle(achievement)}
    >
    </Field>
  );
};
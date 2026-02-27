import {
  PanelSection,
  PanelSectionRow,
  DropdownItem,
  Router,
} from "@decky/ui";
import { useState, FC, useEffect } from "react";
import { useAchievements } from "../hooks/useAchievements";
import { AchievementList } from "./AchievmentList";

export const Content: FC = () => {
  const { achievements, loading, toggling, error, unlockedCount, totalCount, handleToggle } =
    useAchievements();
  const [activeTab, setActiveTab] = useState<TabId>("all");

  useEffect(() => {
    console.log("achievements", achievements);
  }, [achievements]);

  useEffect(() => {
    console.log("loading", loading);
  }, [loading]);

  //active tab change
  useEffect(() => {
    console.log("activeTab", activeTab);
  }, [activeTab]);

  const runningApp = Router.MainRunningApp;

  if (!runningApp) {
    return (
      <PanelSection title="Achievement Manager">
        <PanelSectionRow>
          <div style={{ textAlign: "center", padding: "16px 0"}}>
            No game is currently running.
            <br />
            Launch a game to manage its achievements.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const filterOptions = [
    { data: "all", label: `All (${totalCount})` },
    { data: "unlocked", label: `Unlocked (${unlockedCount})` },
    { data: "locked", label: `Locked (${totalCount - unlockedCount})` },
  ];

  const currentList = achievements[activeTab];

  return (
    <>
      <PanelSection title={runningApp.display_name}>
        <PanelSectionRow>
          <div style={{ fontSize: "12px" }}>
            {unlockedCount} / {totalCount} achievements unlocked
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Filter"
            rgOptions={filterOptions}
            selectedOption={activeTab}
            onChange={(opt) => {console.log("opt", opt); setActiveTab(opt.data as TabId)}}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {error ? (
          <div style={{ textAlign: "center", padding: "12px 0"}}>
            {error}
          </div>
        ) : currentList.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            No achievements found.
          </div>
        ) : (
          <AchievementList
            achievements={currentList}
            isLoading={loading}
            togglingId={toggling}
            onToggle={handleToggle}
          />
        )}
      </PanelSection>
    </>
  );
};

import { definePlugin } from "@decky/api";
import { FaTrophy } from "react-icons/fa";
import { Content } from "./components/MainContent";

export default definePlugin(() => {

  return {
    alwaysRender: true,
    name: "Achievement Manager",
    titleView: (
      <div style={{fontSize: "20px", fontWeight: 700, textAlign: "left"}}>Decky-Achievement</div>
    ),
    content: <Content />,
    icon: <FaTrophy />,
  };
});

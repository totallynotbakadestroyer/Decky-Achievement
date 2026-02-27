declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

type TabId = "all" | "unlocked" | "locked";

interface Achievement {
  api_name: string;
  name: string;
  desc: string;
  unlocked: boolean;
}
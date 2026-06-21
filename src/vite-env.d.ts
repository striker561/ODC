/// <reference types="vite/client" />

interface Window {
  webkitAudioContext?: typeof AudioContext;
}

declare module "*.css" {
  const content: string;
  export default content;
}

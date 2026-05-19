import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { pretendard: ["PretendardJP", "sans-serif"] },
      colors: {
        page: "#f0ede8",
        panel: "#faf9f7",
        card: "#ffffff",
        accent: "#3d2f1e"
      }
    }
  },
  plugins: []
};
export default config;

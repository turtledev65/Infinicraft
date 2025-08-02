import dotenv from "dotenv";
import { defineConfig } from "vite";

dotenv.config();
export default defineConfig({
  define: {
    "process.env": process.env,
  },
});

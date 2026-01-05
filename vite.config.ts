import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import solid from "vite-plugin-solid";

export default defineConfig({
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
  plugins: [solid(), tailwindcss(), viteSingleFile()],
});

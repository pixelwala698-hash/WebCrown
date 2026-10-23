import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

function adminStaticRoute() {
  return {
    name: "webcrown-admin-static-route",
    async closeBundle() {
      const adminDir = resolve("dist/admin");
      await mkdir(adminDir, { recursive: true });
      await copyFile(resolve("dist/index.html"), resolve(adminDir, "index.html"));
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [viteSingleFile(), adminStaticRoute()],
  build: {
    assetsInlineLimit: Infinity,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

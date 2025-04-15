// @ts-ignore The plugin imports and runs fine despite the error
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import {viteStaticCopy} from "vite-plugin-static-copy";

const plugins = (mode: string) => [
  viteStaticCopy({ targets: [{ src: "../assets/splash.html", dest: "." }] }),
  electron({
    onstart: (options) =>
      mode === "production"
        ? options.startup()
        : options.startup([".", "--no-sandbox", "--remote-debugging-port=9222", "--inspect=9229"]),
    vite: {
      build: {
        outDir: "../../../out/electron",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
          input: "./src/electron/index.ts",
          output: { entryFileNames: "[name].js" },
        },
      },
      define: { __dirname: "import.meta.dirname" },
    },
  }),
  renderer(),
  react(),
];

// noinspection JSUnusedGlobalSymbols
export default defineConfig(({ mode }) => ({
  root: "./src/website/app",
  build: {
    outDir: "../../../out/website",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: { output: { entryFileNames: "[name]-website.js" } },
  },
  plugins: mode === "test" ? [] : plugins(mode),
  server: { host: "localhost", port: 3000 },
}));

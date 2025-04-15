import { BrowserWindow, app } from "electron";

const __dirname = import.meta.dirname;

let window: BrowserWindow;

app.on("ready", async (): Promise<void> => {
  // once electron has started up, create a window.
  window = new BrowserWindow({
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged,
      spellcheck: false,
      enableDeprecatedPaste: true,
    },
    title: "Electron hanging repro",
    autoHideMenuBar: true,
    show: false,
    titleBarStyle: process.platform === "win32" ? "hidden" : "default",
    titleBarOverlay: process.platform === "win32" ? { color: "#fff0", symbolColor: "#fff", height: 56 } : false,
  });

  // don't launch the splash screen in debug to avoid clobbering GUI tests.
  if (!process.argv.includes("no-splash")) {
    const splash = new BrowserWindow({
      width: 200,
      height: 250,
      resizable: false,
      center: true,
      frame: false,
      roundedCorners: false,
      transparent: true,
      show: false,
    });

    splash.once("ready-to-show", () => {
      splash.show();
    });

    await splash.loadURL(
      app.isPackaged ? `file://${__dirname}/../website/splash.html` : "http://localhost:3000/splash.html",
    );

    window.once("ready-to-show", () => {
      splash.destroy();
    });
  }

  window.once("ready-to-show", () => {
    window.show();
  });

  if (app.isPackaged) {
    window.setMenu(null);
  }

  await window.loadURL(app.isPackaged ? `file://${__dirname}/../website/index.html` : "http://localhost:3000");
});

app.on("window-all-closed", async (): Promise<void> => {
  app.quit();
});

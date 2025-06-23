import { BrowserWindow, app } from "electron";
import fs from "fs";
import path from "path";

const logPath = path.join(app.getPath("userData"), "electron-debug.log");
function log(msg: string) {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
}

const __dirname = import.meta.dirname;

let window: BrowserWindow;

app.on("ready", async (): Promise<void> => {
  log("App ready event fired");

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
  log("Main window created");

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
    log("Splash window created");

    splash.once("ready-to-show", () => {
      log("Splash ready-to-show");
      splash.show();
    });

    splash.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
      log(`Splash did-fail-load: ${errorCode} - ${errorDescription}`);
    });

    await splash.loadURL(
      app.isPackaged ? `file://${__dirname}/../website/splash.html` : "http://localhost:3000/splash.html",
    );

    window.once("ready-to-show", () => {
      log("Main window ready-to-show, destroying splash");
      splash.destroy();
    });
  }

  window.webContents.on("did-finish-load", () => {
    log("Main window did-finish-load");
    // if (!window.isVisible()) {
    //   window.show();
    //   log("Main window shown after did-finish-load");
    // }
  });

  window.once("ready-to-show", () => {
    log("Main window ready-to-show, showing main window");
    window.show();
  });

  // Timeout fallback
  setTimeout(() => {
    if (!window.isVisible()) {
      log("Timeout reached, showing main window");
      window.show();
    }
  }, 30000); // 10 seconds

  window.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    log(`Main window did-fail-load: ${errorCode} - ${errorDescription}`);
  });

  if (app.isPackaged) {
    window.setMenu(null);
  }

  await window.loadURL(app.isPackaged ? `file://${__dirname}/../website/index.html` : "http://localhost:3000");
});

app.on("window-all-closed", async (): Promise<void> => {
  app.quit();
});

const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const { SyncClient } = require("./apps/desktop/sync");

let backendProcess;
let syncClient;
let syncInterval;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL("http://localhost:3000");
};

app.whenReady().then(async () => {
  // Levantar API NestJS (PostgreSQL)
  backendProcess = spawn("node", ["dist/main.js"], {
    cwd: path.join(__dirname, "apps", "api"),
    shell: true,
    env: {
      ...process.env,
    },
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`NestJS: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`NestJS Error: ${data}`);
  });

  // Iniciar sync client local
  const dbPath = path.join(app.getPath("userData"), "baloto-local.sqlite");
  const serverUrl = process.env.BALOTO_SERVER_URL || "http://localhost:3001";
  syncClient = new SyncClient(dbPath, serverUrl);
  await syncClient.init();
  syncClient.sync().catch((err) => console.error("Sync error:", err));
  syncInterval = setInterval(() => {
    syncClient.sync().catch((err) => console.error("Sync error:", err));
  }, 10 * 60 * 1000);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (syncInterval) clearInterval(syncInterval);
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});

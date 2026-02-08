const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backendProcess;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Cargar tu frontend (puede ser un index.html o un servidor en localhost)
  win.loadURL("http://localhost:3000"); // asumiendo que el backend sirve también el frontend
};

app.whenReady().then(() => {
  // 🚀 Levantar backend NestJS
  const dbPath = path.join(app.getPath("userData"), "baloto.sqlite");
  backendProcess = spawn("node", ["dist/main.js"], {
    cwd: path.join(__dirname, "backend"),
    shell: true,
    env: {
      ...process.env,
      DB_DRIVER: "sqlite",
      DB_PATH: dbPath,
      SYNC_SERVER_URL: "http://localhost:3001",
    },
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`NestJS: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`NestJS Error: ${data}`);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});

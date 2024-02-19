import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Menu,
  MenuItem,
  Tray,
  nativeImage,
  nativeTheme,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
import Store from "electron-store";
import * as path from "path";
import { StoreKeys, StoreSchema } from "./Store/storeConfig";
// import contextMenus from "./contextMenus";
import * as lancedb from "vectordb";
import * as fs from "fs";
import { LanceDBTableWrapper } from "./database/LanceTableWrapper";
import { FSWatcher } from "fs";
import {
  GetFilesInfoTree,
  startWatchingDirectory,
  updateFileListForRenderer,
} from "./Files/Filesystem";
import { registerLLMSessionHandlers } from "./llm/llmSessionHandlers";
// import { FileInfoNode } from "./Files/Types";
import { registerDBSessionHandlers } from "./database/dbSessionHandlers";
import { registerStoreHandlers } from "./Store/storeHandlers";
import { registerFileHandlers } from "./Files/registerFilesHandler";
import { RepopulateTableWithMissingItems } from "./database/TableHelperFunctions";

const store = new Store<StoreSchema>();
// store.clear(); // clear store for testing

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let tray;

const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let dbConnection: lancedb.Connection;
const dbTable = new LanceDBTableWrapper();
const fileWatcher: FSWatcher | null = null;

async function createWindow() {
  win = new BrowserWindow({
    title: "phantom",
    webPreferences: {
      preload,
    },
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
      height: 30,
    },
    width: 1400,
    height: 800,
  });

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    const userDirectory = store.get(StoreKeys.UserDirectory) as string;
    const files = GetFilesInfoTree(userDirectory);
    win?.webContents.send("files-list", files);
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(win);
  registerLLMSessionHandlers(store);
  registerDBSessionHandlers(dbTable, store);
  registerStoreHandlers(store, fileWatcher);
  registerFileHandlers(store, dbTable, win);
}

app.whenReady().then(async () => {
  const theme = nativeTheme.shouldUseDarkColors ? "light" : "dark";
  const iconPath = path.join(__dirname, `../../public/phantom-${theme}.png`);

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])

  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
  createWindow();
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (!result.canceled) {
    return result.filePaths;
  } else {
    return null;
  }
});

ipcMain.handle("open-file-dialog", async (event, extensions) => {
  const filters =
    extensions && extensions.length > 0 ? [{ name: "Files", extensions }] : [];

  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections", "showHiddenFiles"], // Add 'showHiddenFiles' here
    filters: filters,
  });

  if (!result.canceled) {
    return result.filePaths;
  } else {
    return [];
  }
});

ipcMain.on("index-files-in-directory", async (event) => {
  try {
    const userDirectory = store.get(StoreKeys.UserDirectory) as string;
    if (!userDirectory) {
      throw new Error("No user directory set");
    }
    const embedFuncRepoName = store.get(
      StoreKeys.DefaultEmbedFuncRepo
    ) as string;
    if (!embedFuncRepoName) {
      throw new Error("No default embed func repo set");
    }
    const dbPath = path.join(app.getPath("userData"), "vectordb");
    dbConnection = await lancedb.connect(dbPath);
    await dbTable.initialize(dbConnection, userDirectory, embedFuncRepoName);
    await RepopulateTableWithMissingItems(
      dbTable,
      userDirectory,
      (progress) => {
        event.sender.send("indexing-progress", progress);
      }
    );
    if (win) {
      startWatchingDirectory(win, userDirectory);
      updateFileListForRenderer(win, userDirectory);
    }
    event.sender.send("indexing-progress", 1);
  } catch (error) {
    const errorStr = `Indexing error: ${error}. Please try restarting or open a Github issue.`;
    event.sender.send("indexing-error", errorStr);
    console.error("Error during file indexing:", error);
  }
});

ipcMain.on("show-context-menu-file-item", (event, file) => {
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Delete",
      click: () => {
        console.log(file.path);
        fs.stat(file.path, (err, stats) => {
          if (err) {
            console.error("An error occurred:", err);
            return;
          }

          if (stats.isDirectory()) {
            // For directories (Node.js v14.14.0 and later)
            fs.rm(file.path, { recursive: true }, (err) => {
              if (err) {
                console.error("An error occurred:", err);
                return;
              }
              console.log(
                `Directory at ${file.path} was deleted successfully.`
              );
            });
          } else {
            fs.unlink(file.path, (err) => {
              if (err) {
                console.error("An error occurred:", err);
                return;
              }
              console.log(`File at ${file.path} was deleted successfully.`);
            });
          }
        });
      },
    })
  );

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
});

ipcMain.on("open-external", (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get-platform", async () => {
  return process.platform;
});

ipcMain.handle("path-basename", (event, pathString: string) => {
  return path.basename(pathString);
});

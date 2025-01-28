import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import fs from "fs";
import { createValorantApiClient, provideAuthViaLocalApi, provideLockFile, provideLogFile, useProviders } from '@tqman/valorant-api-client'
import { Client } from "@xhayper/discord-rpc";

const clientId = "1331225233205497928";
const client = new Client({
  clientId: clientId
})

client.login();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'VSM',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  console.log(update(win))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

function isDirEmpty(dirname: fs.PathLike) {
  return fs.promises.readdir(dirname).then(files => {
      return files.length === 0;
  });
}

const riotClientPath = path.join('C:', 'Riot Games', 'Riot Client', 'RiotClientServices.exe');
const riotClientLocalPath = path.join(app.getPath('appData'), '..', 'Local', 'Riot Games', 'Riot Client', 'Data');
const accountPrivateSettingsPath = path.join(riotClientLocalPath, 'RiotGamesPrivateSettings.yaml');

const appData = app.getPath('appData');
const localPath = path.join(appData, '..', 'Local', 'VSM', 'Accounts');

client.on("ready", async() => {

  const totalAccounts = fs.readdirSync(localPath).length;

  client.user?.setActivity(
    {
      details: "VSM [1.0.0]",
      state: `Managing ${totalAccounts} accounts`,
      largeImageKey: "https://cdn3.emoji.gg/emojis/9768_Radiant_Valorant.png",
      largeImageText: "Smurfing made easier.",
      startTimestamp: new Date(),
      buttons: [
        {
          label: "Download Here",
          url: "https://github.com/synthofficial/vsm/releases"
        }
      ]
    }
  )
})

function watchForSettingsFile(): Promise<string> {
  return new Promise<string>((resolve) => {
      console.log("Starting to watch for settings file...");
      
      const watcher = fs.watch(riotClientLocalPath, async (eventType, filename) => {
          if (filename === 'RiotGamesPrivateSettings.yaml') {
              console.log("Settings file detected or modified");
              
              try {
                  const filePath = path.join(riotClientLocalPath, filename);
                  const content = await fs.promises.readFile(filePath, 'utf8');
                  
                  // Only proceed if the file has content
                  if (content) {
                      const lines = content.split('\n');
                      console.log("Current line count:", lines.length);

                      // Check both line count AND login status
                      if (lines.length >= 64 && !content.includes('persist: null')) {
                          console.log("File has reached required length and account is logged in");
                          watcher.close();
                          resolve(filePath);
                      } else {
                          console.log("File not ready yet:", 
                              lines.length < 64 ? "Not enough lines" : "Account not logged in");
                      }
                  }
              } catch (error) {
                  console.error('Error reading file:', error);
                  // Don't resolve here, keep watching
              }
          }
      });

      watcher.on('error', (error) => {
          console.error('Watch error:', error);
      });
  });
}

ipcMain.handle('get-accounts', async () => {

  const appData = app.getPath('appData');
  const localPath = path.join(appData, '..', 'Local', 'VSM', 'Accounts');

  if(!fs.existsSync(localPath)){
    fs.mkdirSync(localPath, { recursive: true });
  }

  if(await isDirEmpty(localPath)){
    return false;
  }

  const accounts = fs.readdirSync(localPath);

  const accountsData = accounts.map((account) => {
    const accountDataPath = path.join(localPath, account, 'accountData.json');
    const accountData = fs.readFileSync(accountDataPath, 'utf8');
    return JSON.parse(accountData);
  });

  if(accountsData.length > 0){
    return accountsData;
  }


});

ipcMain.handle('getLocalAppData', async (event, arg) => {
  const appDataPath = app.getPath('appData'); // Get path to 'appData' directory
  const localPath = path.join(appDataPath, '..', 'Local'); // Navigate up a directory and then into 'Local'
  return localPath;
});

async function getAccountDetails() {
  try {
    console.log('Creating client...');
    const client = await createValorantApiClient({
      local: useProviders(provideLockFile()),
      remote: useProviders([provideLogFile(), provideAuthViaLocalApi()])
    });
    
    console.log('Getting user info...');
    const userInfo = await client.local.getAccountAlias();

    console.log('Getting region...');
    const region = (await client.local.getClientRegion()).data.region;
    const { data : comp } = await client.remote.getCompetitiveUpdates({
      data: {
        puuid: client.remote.puuid
      }
    })
    const { data : loadout } = await client.remote.getPlayerLoadout({
      data: {
        puuid: client.remote.puuid
      }
    })
    const { data : penalties } = await client.remote.getPenalties({
      data: {
        puuid: client.remote.puuid
      }
    })
    const { data : mmr } = await client.remote.getPlayerMmr({
      data: {
        puuid: client.remote.puuid
      }
    })
    console.log('Competitive:', comp);
    console.log('Region:', region);
    console.log('Loadout:', loadout);
    console.log('Penalties:', penalties);

    const result = {
      gameName: userInfo.data.game_name,
      tagLine: userInfo.data.tag_line,
      region: region,
      puuid: client.remote.puuid, // Use sub from userInfo instead of separate call
      ranked: comp,
      loadout: loadout,
      penalties: penalties,
      mmr: mmr
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    // Only log error message
    if (error instanceof Error) {
      console.error('Error getting account details:', error.message);
    } else {
      console.error('Error getting account details:', String(error));
    }
    return null;
  }
}

async function handleValorantLaunch(riotClientPath: string): Promise<void> {
  const command = `"${riotClientPath}" --launch-product=valorant --launch-patchline=live`;
  console.log("Launching VALORANT:", command);

  return new Promise<void>((resolve) => {
    const { exec } = require('child_process');
    const process = exec(command, {
      windowsHide: false
    });

    // Increased wait time to ensure game starts properly
    setTimeout(resolve, 5000);
  });
}

ipcMain.handle("remove-account", async (_event, accountNumber) => {
  console.log("Removing account:", accountNumber);
  const accountPath = path.join(localPath, accountNumber.toString());
  if(fs.existsSync(accountPath)){
    fs.rmdirSync(accountPath, { recursive: true });
    console.log("Account removed successfully");
    return true;
  }else return false;
});

ipcMain.handle("login-account", async (_event, accountNumber) => {
  console.log("Login account:", accountNumber);
  const accountPath = path.join(localPath, accountNumber.toString());
  const accountDataPath = path.join(accountPath, 'accountData.json');

  if (fs.existsSync(accountPrivateSettingsPath)) {
    await fs.promises.unlink(accountPrivateSettingsPath);
    console.log("Deleted existing settings file");
}

  await handleRiotClientProcess(riotClientPath);
  if(fs.existsSync(accountPath)){
    try {
      // Copy settings and launch
      fs.copyFileSync(
        path.join(accountPath, 'RiotGamesPrivateSettings.yaml'),
        path.join(riotClientLocalPath, 'RiotGamesPrivateSettings.yaml')
      );

      console.log('Settings file copied, launching game...');
      await handleValorantLaunch(riotClientPath);

      console.log('Waiting for game initialization...');
      await new Promise(resolve => setTimeout(resolve, 15000));

      console.log('Updating account details...');
      const accountInfo = await getAccountDetails();
      
      if (accountInfo) {
        console.log('Got account info:', JSON.stringify(accountInfo));
        const accountData = JSON.parse(fs.readFileSync(accountDataPath, 'utf-8'));
        const updatedData = {
          ...accountData,
          riotName: accountInfo.gameName,
          riotTag: accountInfo.tagLine,
          region: accountInfo.region,
          puuid: accountInfo.puuid,
          ranked: accountInfo.ranked,
          penalties: accountInfo.penalties,
          loadout: accountInfo.loadout,
          mmr: accountInfo.mmr,
          lastUsed: new Date().toISOString()
        };
        
        await fs.promises.writeFile(
          accountDataPath, 
          JSON.stringify(updatedData, null, 2)
        );
        console.log("Updated account data successfully");
      } else {
        console.log('No account info returned');
      }
    } catch (error) {
      console.error("Failed to handle login:", error);
    }

    return true;
  }
  return false;
});
async function handleRiotClientProcess(riotClientPath: string): Promise<void> {
  const riotClient = 'RiotClientServices.exe';
  
  // Kill existing process
  await new Promise<void>((resolve) => {
    const { exec } = require('child_process');
    exec(`taskkill /IM ${riotClient} /F`, (_error: any, stdout: any, stderr: any) => {
      console.log("Taskkill output:", stdout);
      if (stderr) console.error("Taskkill stderr:", stderr);
      resolve();
    });
  });

  // Launch new client process
  const command = `"${riotClientPath}"`;
  console.log("Executing command:", command);

  const { exec } = require('child_process');
  return new Promise<void>((resolve) => {
    const riotClientProcess = exec(command, {
      windowsHide: false
    });

    // Don't resolve immediately, let the process run
    riotClientProcess.on('error', (error: any) => {
      console.error('Process error:', error);
    });

    // Only log the close event but don't resolve
    riotClientProcess.on('close', (code: any) => {
      console.log(`Process closed with code ${code}`);
    });

    // Resolve after a short delay to allow the process to start
    setTimeout(resolve, 1000);
  });
}

ipcMain.handle('update-account', async (_event, accountNumber, newData) => {

  const accountPath = path.join(localPath, accountNumber.toString());
  const accountDataPath = path.join(accountPath, 'accountData.json');

  try{
    const existingData = JSON.parse(fs.readFileSync(accountDataPath, 'utf-8'));
    const updatedData = {...existingData, ...newData};

    fs.writeFileSync(accountDataPath, JSON.stringify(updatedData));
    return true;

  }catch(err){
    console.error("Error updating account:", err);
    return false;
  }
});

ipcMain.handle('add-new-account', async () => {
  console.log("Adding new account");

  if(fs.existsSync(riotClientPath)){
      console.log("Riot Client path exists:", riotClientPath);

      try {
          if (fs.existsSync(accountPrivateSettingsPath)) {
              await fs.promises.unlink(accountPrivateSettingsPath);
              console.log("Deleted existing settings file");
          }

          const watchPromise = watchForSettingsFile();
          await handleRiotClientProcess(riotClientPath);
          console.log("Riot Client started, waiting for settings file...");

          const settingsFilePath = await watchPromise;
          console.log("Valid settings file detected at:", settingsFilePath);

          await new Promise(resolve => setTimeout(resolve, 5000));

          const accountsPath = app.getPath('appData');
          const localPath = path.join(accountsPath, '..', 'Local', 'VSM', 'Accounts');
          
          if (!fs.existsSync(localPath)) {
              await fs.promises.mkdir(localPath, { recursive: true });
          }

          // Find the next available account number
          const files = await fs.promises.readdir(localPath);
          let accountNumber = 1;
          const existingNumbers = files.map(Number).filter(n => !isNaN(n));
          
          if (existingNumbers.length > 0) {
              accountNumber = Math.max(...existingNumbers) + 1;
          }

          console.log("Creating account number:", accountNumber);

          const newAccountPath = path.join(localPath, accountNumber.toString());
          
          // Check if directory already exists
          if (fs.existsSync(newAccountPath)) {
              throw new Error(`Account directory ${accountNumber} already exists`);
          }

          await fs.promises.mkdir(newAccountPath, { recursive: true });

          const newSettingsPath = path.join(newAccountPath, 'RiotGamesPrivateSettings.yaml');
          await fs.promises.copyFile(settingsFilePath, newSettingsPath);
          console.log("Settings file copied to new location");

          const accountInfo = await getAccountDetails();
          console.log("Account info:", accountInfo);

          const newAccountData = {
              accountNumber: accountNumber,
              accountName: accountInfo ? `${accountInfo.gameName}#${accountInfo.tagLine}` : `Account ${accountNumber}`,
              riotName: accountInfo?.gameName,
              riotTag: accountInfo?.tagLine,
              region: accountInfo?.region,
              lastUsed: new Date().toISOString(),
              ranked: accountInfo?.ranked,
              loadout: accountInfo?.loadout,
              penalties: accountInfo?.penalties,
              mmr: accountInfo?.mmr,
          };

          const newAccountDataPath = path.join(newAccountPath, 'accountData.json');
          await fs.promises.writeFile(newAccountDataPath, JSON.stringify(newAccountData, null, 2));
          console.log("Account data saved");

          return accountNumber;

      } catch (error) {
          console.error("Error in add-new-account:", error);
          throw error;
      }
  } else {
      console.error("Riot Client path does not exist:", riotClientPath);
      throw new Error("Riot Client not found");
  }
});

ipcMain.handle("close", () => {
  if(win){
    win.close();
  }else return false;
})

ipcMain.handle("maximize", () => {
  if(win){
    if(win.isMaximized()){
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
})

ipcMain.handle("minimize", () => {
  if(win){
    if(!win.isMinimizable()) return;
    win.minimize();
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

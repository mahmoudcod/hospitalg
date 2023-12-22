const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const {
  initializeDatabase: initializeUserDatabase,
  addUser,
  getUser,
} = require('./model/userData');
const {
  initializeDatabase: initializeCuresDatabase,
  createCuresTable,
 addCure,
 getAllCures,
 deleteCure,
} = require('./model/addCure');
const {
  initializeDatabase: initializeTrackingDatabase,
  createTrackingTable,
  addTrackingData,
  getTrackingData,
  updateTrackingData,
  deleteTrackingData
} = require('./model/data');
const { showContextMenu } = require('./menu'); // Import the menu module

let mainWindow;

function createWindow(page) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const pageUrl = url.format({
    pathname: path.join(__dirname, 'pages', `${page}.html`),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(pageUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('database-ready');

  });
    mainWindow.webContents.on('context-menu', (event, params) => {
    event.preventDefault(); // Prevent the default context menu
    showContextMenu(mainWindow, page, { x: params.x, y: params.y });
  });
   mainWindow.webContents.on('contextmenu', (event,params) => {
    event.preventDefault(); 
    showContextMenu(mainWindow, page, { x: params.x, y: params.y });

  });
}

app.on('ready', async () => {
  await initializeUserDatabase();
  await initializeCuresDatabase();
  await initializeTrackingDatabase();

  await createCuresTable();
  await createTrackingTable();

  createWindow('login');
  initializeApp();
});

ipcMain.on('initialize-database', () => {
  initializeUserDatabase();
  initializeCuresDatabase();
  initializeTrackingDatabase();
});
ipcMain.on('signUp', (event, userData) => {
  getUser(userData.username, (user) => {
    if (user) {
      event.reply(
        'signUpResponse',
        false,
        'User already exists. Please choose a different username.'
      );
    } else {
      addUser(userData.username, userData.password);
      event.reply('signUpResponse', true, 'User signed up successfully!');
    }
  });
});


ipcMain.on('login', (event, { username, password }) => {
  // Use the getUser function to retrieve user information
  getUser(username, (user) => {
    if (user && user.password === password) {
      // Send the user information back to the renderer process
      event.sender.send('loginResponse', user);
    } else {
      event.sender.send('loginResponse', null);
    }
  });
});

ipcMain.on('addCure', async (event, cureData) => {
  try {
    await addCure(cureData.name, cureData.type, cureData.userId, cureData.date);
    event.sender.send('addCureResponse', { success: true, message: 'Cure added successfully' });
  } catch (error) {
    event.sender.send('addCureResponse', { success: false, message: error.message });
  }
});
ipcMain.on('getAllCures', async (event) => {
  try {
    const cureData = await getAllCures(); 
    event.reply('getAllCuresResponse', JSON.stringify(cureData)); // Convert to JSON before sending
  } catch (error) {
    console.error('Error fetching cure data in the main process:', error);
    event.reply('getAllCuresResponse', '[]'); // Send an empty array as a fallback
  }
});

ipcMain.on('deleteCure', async (event, cureId) => {
  try {
    await deleteCure(cureId);
    event.sender.send('deleteCureResponse', { success: true, message: 'Cure deleted successfully' });
  } catch (error) {
    event.sender.send('deleteCureResponse', { success: false, message: error.message });
  }
});


ipcMain.on('addTrackingData', async (event, trackingData, userId, cureType, cureName) => {
  try {
    await addTrackingData(trackingData, userId, cureType, cureName);
    event.reply('addTrackingDataResponse', { success: true, message: 'Tracking data added successfully' });
  } catch (error) {
    event.reply('addTrackingDataResponse', { success: false, message: error.message });
  }
});

ipcMain.on('getTrackingData', async (event) => {
  try {
    const trackingData = await getTrackingData();
    event.sender.send('getTrackingDataResponse', trackingData);
  } catch (error) {
    console.error('Error getting tracking data in main process:', error.message);
    event.sender.send('getTrackingDataResponse', null);
  }
});
ipcMain.on('deleteTrackingData', async (event, id) => {
  try {
    await deleteTrackingData(id);
    event.reply('deleteTrackingDataResponse', { success: true, message: 'Tracking data deleted successfully' });
  } catch (error) {
    console.error(`Error deleting tracking data with ID ${id}:`, error.message);
    event.reply('deleteTrackingDataResponse', { success: false, message: error.message });
  }
});
ipcMain.on('updateTrackingData', async (event, id, newData) => {
  try {
    await updateTrackingData(id, newData);
    event.sender.send('updateTrackingDataResponse', { success: true, message: 'Tracking data updated successfully' });
  } catch (error) {
    event.sender.send('updateTrackingDataResponse', { success: false, message: `Error updating tracking data: ${error}` });
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow('login');
    initializeApp();
  }
});

const { db: userDb } = require('./model/userData');
const { db: curesDb } = require('./model/addCure');
const { db: trackingDb } = require('./model/data');

app.on('before-quit', () => {
  if (userDb) {
    userDb.close((err) => {
      if (err) {
        console.error('Error closing user database:', err.message);
      }
    });
  }

  if (curesDb) {
    curesDb.close((err) => {
      if (err) {
        console.error('Error closing cures database:', err.message);
      }
    });
  }

  if (trackingDb) {
    trackingDb.close((err) => {
      if (err) {
        console.error('Error closing tracking database:', err.message);
      }
    });
  }
});

function initializeApp() {
  // Add any additional initialization logic here
}

initializeApp();

const { Menu, BrowserWindow ,app} = require('electron');
const path = require('path'); // Import the path module
const url = require('url'); // Import the path module

// Function to create a new window
function createNewWindow(page) {
  let newWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

 const isPackaged = app.isPackaged;
  const appPath = isPackaged ? app.getAppPath('exe') : __dirname;
  const pagePath = path.join(appPath, 'pages', `${page}.html`);
    const pageURL = isPackaged ? `file://${appPath}/../../../../../../pages/${page}.html` : `file://${pagePath}`;


  newWindow.loadURL(pageURL);

  newWindow.on('closed', function () {
    newWindow = null;
  });
}

function showContextMenu(window, page, position) {
  const { x, y } = position;

  const template = [
    {
      label: 'Open New Window',
      click: () => {
        createNewWindow(page);
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);
  contextMenu.popup({ window, x, y });
}



module.exports = { showContextMenu };

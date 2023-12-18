const { Menu, BrowserWindow } = require('electron');
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

  const pageUrl = url.format({
    pathname: path.join(__dirname, 'pages', `${page}.html`),
    protocol: 'file:',
    slashes: true,
  });

  newWindow.loadURL(pageUrl);

  newWindow.on('closed', function () {
    newWindow = null;
  });
}

// Function to create and show the context menu
// Function to create and show the context menu
// Function to create and show the context menu
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

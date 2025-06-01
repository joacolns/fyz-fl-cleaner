const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Selector de carpeta
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

// Obtener archivos viejos
ipcMain.handle('get-old-recordings', async (event, { folderPath, year, months }) => {
  const oldFiles = [];

  if (!fs.existsSync(folderPath)) return [];

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    const date = new Date(stats.mtime);
    if (date.getFullYear() === year && date.getMonth() <= months - 1) {
      oldFiles.push({ name: file, modified: date.toLocaleString() });
    }
  }

  return oldFiles;
});

// Eliminar archivos
ipcMain.handle('delete-old-recordings', async (event, { folderPath, filesToDelete }) => {
  let deleted = [];

  for (const fileName of filesToDelete) {
    const filePath = path.join(folderPath, fileName);
    try {
      fs.unlinkSync(filePath);
      deleted.push(fileName);
    } catch (err) {
      console.error('Error al eliminar:', filePath, err);
    }
  }

  return deleted;
});

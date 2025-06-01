const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('delete-recordings', (event, { year, months }) => {
  const folderPath = path.join(process.env.USERPROFILE, 'Documents', 'Image-Line', 'FL Studio', 'Recordings');

  fs.readdir(folderPath, (err, files) => {
    if (err) return console.error('Error leyendo la carpeta:', err);

    const now = new Date();

    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      const fileDate = new Date(stats.mtime);
      if (fileDate.getFullYear() === year && fileDate.getMonth() <= months - 1) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error eliminando archivo:', err);
          else console.log('Eliminado:', filePath);
        });
      }
    });
  });
});

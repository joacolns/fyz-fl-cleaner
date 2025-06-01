const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getOldRecordings: (params) => ipcRenderer.invoke('get-old-recordings', params),
  deleteOldRecordings: (data) => ipcRenderer.invoke('delete-old-recordings', data)
});

let selectedFolder = null;

async function selectFolder() {
  const folder = await window.electronAPI.selectFolder();
  if (folder) {
    selectedFolder = folder;
    document.getElementById('folderPath').textContent = folder;
  }
}

async function preview() {
  const year = parseInt(document.getElementById('year').value);
  const months = parseInt(document.getElementById('months').value);
  const fileList = document.getElementById('fileList');
  const deleteBtn = document.getElementById('deleteBtn');

  if (!selectedFolder) {
    alert("Por favor seleccioná una carpeta primero.");
    return;
  }

  const files = await window.electronAPI.getOldRecordings({ folderPath: selectedFolder, year, months });

  fileList.innerHTML = '';

  if (files.length === 0) {
    fileList.innerHTML = '<li>No se encontraron archivos</li>';
    deleteBtn.disabled = true;
    return;
  }

  files.forEach(f => {
    const li = document.createElement('li');
    li.textContent = `${f.name} - (${f.modified})`;
    fileList.appendChild(li);
  });

  deleteBtn.disabled = false;
  deleteBtn.filesToDelete = files.map(f => f.name);
}

async function deleteFiles() {
  if (!selectedFolder || !deleteBtn.filesToDelete) return;

  const confirmed = confirm("¿Estás seguro que querés eliminar los archivos?");
  if (!confirmed) return;

  const deleted = await window.electronAPI.deleteOldRecordings({
    folderPath: selectedFolder,
    filesToDelete: deleteBtn.filesToDelete
  });

  alert(`Se eliminaron ${deleted.length} archivos.`);
  preview(); // Recargar la lista
}

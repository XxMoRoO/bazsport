const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Data functions
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadReceiptTemplate: () => ipcRenderer.invoke('load-receipt-template'),

    // User functions
    login: (credentials) => ipcRenderer.send('login', credentials),
    addUser: (credentials) => ipcRenderer.invoke('add-user', credentials),
    deleteUser: (data) => ipcRenderer.invoke('delete-user', data),
    modifyUser: (data) => ipcRenderer.invoke('modify-user', data),

    // Window and data functions for User Management
    openUsersWindow: () => ipcRenderer.send('open-users-window'),
    getUserData: () => ipcRenderer.invoke('get-user-data'),

    // Listeners
    onLoginFailed: (callback) => ipcRenderer.on('login-failed', callback),
    onSetUser: (callback) => ipcRenderer.on('set-user', (event, user) => callback(user)),
});
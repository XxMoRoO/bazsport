const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(app.getPath('documents'), 'baz-sport-database.json');
let mainWindow;
let loggedInUser = null;

// --- Window Creation ---
function createLoginWindow() {
    const loginWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        resizable: false,
    });
    loginWindow.loadFile('login.html');
    return loginWindow;
}

function createMainWindow(user) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-user', { username: user.username });
    });
}

// Function to create the User Management window
function createUsersWindow() {
    const usersWindow = new BrowserWindow({
        width: 500,
        height: 600,
        title: 'User Management',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    usersWindow.loadFile('users.html');
}

// --- Data Management ---
function getDatabase() {
    if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf-8');
        try { return JSON.parse(fileData); } catch (e) { console.error("DB corrupt"); }
    }
    const initialData = {
        products: [], sales: [],
        users: [{ username: "Mazen", password: "baz123123" }]
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
}

// --- IPC Handlers ---
ipcMain.on('login', (event, credentials) => {
    const { username, password } = credentials;
    const db = getDatabase();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        loggedInUser = user;
        createMainWindow(user);
        BrowserWindow.fromWebContents(event.sender).close();
    } else {
        event.sender.send('login-failed');
    }
});

ipcMain.handle('add-user', (event, credentials) => {
    if (credentials.adminPassword !== 'Moro159753') {
        return { success: false, message: 'Incorrect Admin Password.' };
    }
    const db = getDatabase();
    if (db.users.some(u => u.username === credentials.username)) {
        return { success: false, message: 'Username already exists.' };
    }
    db.users.push({ username: credentials.username, password: credentials.password });
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Failed to save new user.' };
    }
});

ipcMain.handle('modify-user', (event, data) => {
    const { usernameToModify, newPassword, adminPassword } = data;
    if (adminPassword !== 'Moro159753') {
        return { success: false, message: 'Incorrect admin password.' };
    }
    const db = getDatabase();
    const userIndex = db.users.findIndex(u => u.username === usernameToModify);
    if (userIndex === -1) return { success: false, message: 'User not found.' };
    db.users[userIndex].password = newPassword;
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Failed to save database after modifying user.' };
    }
});

ipcMain.handle('delete-user', (event, data) => {
    const { usernameToDelete, adminPassword } = data;
    if (adminPassword !== 'Moro159753') {
        return { success: false, message: 'Incorrect admin password.' };
    }
    const db = getDatabase();
    if (db.users.length <= 1) return { success: false, message: 'Cannot delete the last user.' };
    const initialUserCount = db.users.length;
    db.users = db.users.filter(u => u.username !== usernameToDelete);
    if (db.users.length === initialUserCount) return { success: false, message: 'User not found.' };
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Failed to save database after deleting user.' };
    }
});

ipcMain.handle('load-data', () => {
    try {
        const db = getDatabase();
        return { products: db.products || [], sales: db.sales || [], users: db.users || [] };
    } catch (error) { return { error: error.message }; }
});

ipcMain.handle('save-data', (event, data) => {
    try {
        const db = getDatabase();
        db.products = data.products;
        db.sales = data.sales;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
});

ipcMain.handle('load-receipt-template', async () => {
    try {
        const appPath = app.getAppPath();
        const templatePath = path.join(appPath, 'receipt.html');
        const logoPath = path.join(appPath, 'build', 'eagle.png');
        if (!fs.existsSync(templatePath)) throw new Error(`Receipt template not found`);
        if (!fs.existsSync(logoPath)) throw new Error(`Logo image not found`);
        const template = fs.readFileSync(templatePath, 'utf-8');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        return { template, logoBase64 };
    } catch (error) { return { error: error.message }; }
});

// MODIFICATION: Add handler to open the new window
ipcMain.on('open-users-window', () => {
    createUsersWindow();
});

// MODIFICATION: Add handler to provide user data to the new window
ipcMain.handle('get-user-data', () => {
    const db = getDatabase();
    return { allUsers: db.users || [], currentUser: loggedInUser };
});


// --- App Lifecycle Events ---
app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
});
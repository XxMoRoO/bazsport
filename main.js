const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// [--- تعديل ---] تم تغيير اسم ملف قاعدة البيانات
const dbPath = path.join(app.getPath('documents'), 'baz-sport-database.json');
const tempDbPath = path.join(app.getPath('documents'), 'baz-sport-database.json.tmp');

let mainWindow;
let usersWindow = null;
let loggedInUser = null;

const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'build', 'icon.ico')
    : path.join(__dirname, 'build', 'icon.ico');


// [--- إصلاح ---] تم تحديث الدالة لتضمن معرفات فريدة دائمًا
function getDailyId(prefix, collection, forDateStr) {
    const now = new Date();
    const dateToUse = forDateStr ? new Date(forDateStr) : now;
    const date = dateToUse.toISOString().slice(0, 10);

    const itemsOnDate = collection.filter(item => {
        const itemDate = item.createdAt || item.date;
        return itemDate && itemDate.startsWith(date);
    });

    // استخدام الطابع الزمني بالمللي ثانية لضمان التفرد
    const timestamp = now.getTime().toString().slice(-5);
    const nextId = itemsOnDate.length + 1;

    return `${prefix}${date.replace(/-/g, '')}-${nextId}-${timestamp}`;
}


function createLoginWindow() {
    const loginWindow = new BrowserWindow({
        width: 400,
        height: 750,
        webPreferences: { preload: path.join(__dirname, 'preload.js') },
        resizable: false,
        icon: iconPath
    });
    loginWindow.loadFile(path.join(__dirname, 'login.html'));
    loginWindow.on('show', () => loginWindow.focus());
    return loginWindow;
}

function createMainWindow(user) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        },
        icon: iconPath
    });

    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { role: 'togglefullscreen' },
                { role: 'reload' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile(path.join(__dirname, 'index.html'));


    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-user', { username: user.username });
        mainWindow.focus();
    });

    mainWindow.on('show', () => mainWindow.focus());
    mainWindow.on('leave-full-screen', () => mainWindow.maximize());

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key.toLowerCase() === 'i' && input.control && input.shift) {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
        if (input.key === 'F5') {
            mainWindow.webContents.reload();
            event.preventDefault();
        }
        if (input.key === 'F11') {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
            event.preventDefault();
        }
    });
}

function createUsersWindow() {
    if (usersWindow && !usersWindow.isDestroyed()) {
        usersWindow.focus();
        return;
    }

    usersWindow = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        parent: mainWindow,
        modal: true,
        icon: iconPath,
        title: 'User Management'
    });

    usersWindow.loadFile(path.join(__dirname, 'users.html'));
    usersWindow.setMenu(null);

    usersWindow.on('closed', () => {
        usersWindow = null;
    });
}


function getDatabase() {
    if (fs.existsSync(tempDbPath)) {
        try {
            fs.renameSync(tempDbPath, dbPath);
        } catch (e) {
            console.error("Could not restore temp database file.", e);
        }
    }

    if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf-8');
        try {
            const db = JSON.parse(fileData);
            let needsSave = false;

            const adminPassword = db.config?.adminPassword || 'admin123';
            let superUser = db.users.find(u => u.username === 'BAZ');
            if (!superUser) {
                superUser = { username: "BAZ", password: adminPassword, employeeId: "SUPERUSER", phone: "" };
                db.users.push(superUser);
                needsSave = true;
            } else if (superUser.password !== adminPassword) {
                superUser.password = adminPassword;
                needsSave = true;
            }


            (db.products || []).forEach(product => {
                if (product.colors) {
                    Object.values(product.colors).forEach(color => {
                        if (color.sizes) {
                            Object.values(color.sizes).forEach(size => {
                                if (!size.stockHistory && size.quantity > 0) {
                                    size.stockHistory = [{
                                        date: product.createdAt || new Date().toISOString(),
                                        quantity: size.quantity,
                                        purchasePrice: product.purchasePrice || 0
                                    }];
                                    needsSave = true;
                                }
                            });
                        }
                    });
                }
            });

            if (!db.expenses) {
                db.expenses = { rent: { amount: 0, paidStatus: {} }, daily: [] }; // [--- تعديل ---]
                needsSave = true;
            }
            if (!db.expenses.daily) { // [--- إضافة ---]
                db.expenses.daily = [];
                needsSave = true;
            }
            if (!db.shifts) { // [--- إضافة ---]
                db.shifts = [];
                needsSave = true;
            }
            if (!db.defects) {
                db.defects = [];
                needsSave = true;
            }
            if (!db.suppliers) {
                db.suppliers = [];
                needsSave = true;
            }
            if (!db.shipments) {
                db.shipments = [];
                needsSave = true;
            }

            if (needsSave) {
                console.log("Migrating or updating database...");
                safeWrite(db);
            }

            return db;
        } catch (e) {
            console.error("Local DB is corrupt, creating a new one.", e);
            fs.renameSync(dbPath, `${dbPath}.corrupt.${Date.now()}`);
        }
    }

    const initialAdminPassword = 'admin123';
    const initialData = {
        config: { adminPassword: initialAdminPassword, lastShiftReportTime: null },
        products: [],
        sales: [],
        users: [
            { username: "BAZ", password: initialAdminPassword, employeeId: "SUPERUSER", phone: "" },
            { username: "omar", password: "omar123", employeeId: "EMP001", phone: "01000000000" }
        ],
        categories: [],
        customers: [],
        bookings: [],
        salaries: {
            "omar": { fixed: 0, commission: 0, bonus: 0 }
        },
        salariesPaidStatus: {},
        expenses: {
            rent: { amount: 0, paidStatus: {} },
            daily: [] // [--- تعديل ---]
        },
        shifts: [], // [--- إضافة ---]
        defects: [],
        suppliers: [],
        shipments: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
}

function safeWrite(data) {
    try {
        const stringifiedData = JSON.stringify(data, null, 2);
        fs.writeFileSync(tempDbPath, stringifiedData, 'utf-8');
        fs.renameSync(tempDbPath, dbPath);
        return { success: true };
    } catch (error) {
        console.error("Failed to safely write database:", error);
        return { success: false, error: error.message };
    }
}

// --- IPC Handlers ---
ipcMain.on('login', (event, credentials) => {
    const { username, password } = credentials;
    const db = getDatabase();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
        loggedInUser = user;
        createMainWindow(user);
        BrowserWindow.fromWebContents(event.sender).close();
    } else {
        event.sender.send('login-failed', 'Incorrect username or password.');
    }
});

ipcMain.on('logout', () => {
    if (mainWindow) mainWindow.close();
    createLoginWindow();
});

ipcMain.handle('validate-admin-password', (event, password) => {
    const db = getDatabase();
    return { success: password === (db.config?.adminPassword || 'admin123') };
});

ipcMain.handle('load-data', () => {
    try {
        return getDatabase();
    } catch (error) { return { error: error.message }; }
});

// [--- تعديل ---] تم تحديث دالة الحفظ لتشمل اليوميات والمصاريف
ipcMain.handle('save-data', (event, data) => {
    const db = getDatabase();
    db.products = data.products ?? db.products;
    db.sales = data.sales ?? db.sales;
    db.categories = data.categories ?? db.categories;
    db.customers = data.customers ?? db.customers;
    db.bookings = data.bookings ?? db.bookings;
    db.salaries = data.salaries ?? db.salaries;
    db.salariesPaidStatus = data.salariesPaidStatus ?? db.salariesPaidStatus;
    db.expenses = data.expenses ?? db.expenses;
    db.defects = data.defects ?? db.defects;
    db.suppliers = data.suppliers ?? db.suppliers;
    db.shipments = data.shipments ?? db.shipments;
    db.shifts = data.shifts ?? db.shifts; // [--- إضافة ---]
    return safeWrite(db);
});

// [--- إضافة ---] معالج جديد لحفظ مصروف يومي
ipcMain.handle('save-daily-expense', (event, expenseData) => {
    const db = getDatabase();
    if (!db.expenses.daily) {
        db.expenses.daily = [];
    }
    db.expenses.daily.push(expenseData);
    return safeWrite(db);
});

// [--- إضافة ---] معالج جديد لتعديل مصروف يومي
ipcMain.handle('update-daily-expense', (event, expenseData) => {
    const db = getDatabase();
    const expenseIndex = db.expenses.daily.findIndex(e => e.id === expenseData.id);
    if (expenseIndex > -1) {
        db.expenses.daily[expenseIndex].amount = expenseData.amount;
        db.expenses.daily[expenseIndex].notes = expenseData.notes;
        return safeWrite(db);
    }
    return { success: false, message: 'Expense not found.' };
});

// [--- إضافة ---] معالج جديد لحذف مصروف يومي
ipcMain.handle('delete-daily-expense', (event, expenseId) => {
    const db = getDatabase();
    const initialLength = db.expenses.daily.length;
    db.expenses.daily = db.expenses.daily.filter(e => e.id !== expenseId);
    if (db.expenses.daily.length < initialLength) {
        return safeWrite(db);
    }
    return { success: false, message: 'Expense not found.' };
});


// [--- إضافة ---] معالج جديد لحفظ اليومية
ipcMain.handle('save-shift', (event, shiftData) => {
    const db = getDatabase();
    const existingShiftIndex = db.shifts.findIndex(s => s.id === shiftData.id);
    if (existingShiftIndex > -1) {
        // إذا كانت اليومية موجودة (في حالة التعديل)، استبدلها
        db.shifts[existingShiftIndex] = shiftData;
    } else {
        // وإلا، أضفها كواحدة جديدة
        db.shifts.push(shiftData);
    }
    // تحديث وقت آخر تقرير وردية
    db.config.lastShiftReportTime = shiftData.endedAt;
    return safeWrite(db);
});

// [--- إضافة ---] معالج جديد لحفظ تقرير اليومية كملف PDF
ipcMain.handle('save-shift-pdf', async (event, { pdfData, fileName }) => {
    try {
        const reportsDir = path.join(app.getPath('documents'), 'Shift Reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // [--- إضافة ---] تنظيف اسم الملف من الرموز غير الصالحة
        const safeFileName = fileName.replace(/[\\/:"*?<>|]/g, '_');
        const filePath = path.join(reportsDir, safeFileName);
        fs.writeFileSync(filePath, pdfData);
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Failed to save shift PDF:', error);
        return { success: false, error: error.message };
    }
});


// [--- إضافة ---] معالج جديد لحفظ فاتورة المورد الكاملة
ipcMain.handle('save-new-invoice', (event, invoiceData) => {
    const db = getDatabase();
    const { supplierId, date, shippingCost, items } = invoiceData;

    if (!supplierId || !date || !items || items.length === 0) {
        return { success: false, message: 'Invalid invoice data.' };
    }

    // --- الخطوة 1: إضافة أي منتجات جديدة إلى قاعدة البيانات أولاً ---
    items.forEach(item => {
        if (item.isNew && item.productData) {
            // التأكد من عدم وجود المنتج بالفعل قبل إضافته
            if (!db.products.some(p => p.id === item.productData.id)) {
                db.products.unshift(item.productData);
            }
        }
    });

    // --- الخطوة 2: إنشاء الفاتورة (الشحنة) وتحديث المخزون ---
    const newShipment = {
        id: getDailyId('SH', db.shipments, date),
        supplierId: supplierId,
        date: new Date(date).toISOString(),
        shippingCost: shippingCost,
        items: [],
        totalCost: 0
    };

    let totalCost = 0;

    for (const invoiceItem of items) {
        // الآن سنجد المنتج دائماً لأنه تم إضافته في الخطوة 1
        const product = db.products.find(p => p.id === invoiceItem.productId);
        if (!product) continue;

        for (const [color, sizes] of Object.entries(invoiceItem.quantities)) {
            for (const [size, quantity] of Object.entries(sizes)) {
                if (quantity > 0) {
                    // تحديث مخزون المنتج
                    if (product.colors[color] && product.colors[color].sizes[size]) {
                        const variant = product.colors[color].sizes[size];
                        variant.quantity += quantity;
                    }

                    // إضافة الصنف إلى الفاتورة
                    newShipment.items.push({
                        productId: product.id,
                        productName: product.name,
                        color: color,
                        size: size,
                        quantity: quantity,
                        purchasePrice: product.purchasePrice
                    });

                    totalCost += quantity * product.purchasePrice;
                }
            }
        }
    }

    newShipment.totalCost = totalCost;

    if (newShipment.items.length > 0) {
        db.shipments.unshift(newShipment);
    }

    return safeWrite(db);
});

ipcMain.handle('add-defective-item', (event, defectData) => {
    const db = getDatabase();
    if (!db.defects) {
        db.defects = [];
    }
    db.defects.unshift(defectData);

    const { productId, color, size, quantity } = defectData;
    const product = db.products.find(p => p.id === productId);

    if (product && product.colors?.[color]?.sizes?.[size]) {
        const sizeData = product.colors[color].sizes[size];

        sizeData.quantity = Math.max(0, sizeData.quantity - quantity);

        if (sizeData.stockHistory && sizeData.stockHistory.length > 0) {
            sizeData.stockHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            let amountToDeduct = quantity;
            for (const entry of sizeData.stockHistory) {
                if (amountToDeduct <= 0) break;
                const deductibleAmount = Math.min(amountToDeduct, entry.quantity);
                entry.quantity -= deductibleAmount;
                amountToDeduct -= deductibleAmount;
            }
            sizeData.stockHistory = sizeData.stockHistory.filter(entry => entry.quantity > 0);
        }
    }

    return safeWrite(db);
});

ipcMain.handle('return-defects-to-supplier', (event, { supplierId, returns }) => {
    const db = getDatabase();
    const supplier = db.suppliers.find(s => s.id === supplierId);
    if (!supplier) {
        return { success: false, message: 'Supplier not found.' };
    }

    let totalReturnedValue = 0;

    for (const returnedItem of returns) {
        const defect = db.defects.find(d => d.id === returnedItem.defectId);
        if (defect) {
            const quantityToReturn = Math.min(returnedItem.quantity, defect.quantity - (defect.returnedQty || 0));
            if (quantityToReturn > 0) {
                defect.returnedQty = (defect.returnedQty || 0) + quantityToReturn;
                totalReturnedValue += quantityToReturn * defect.purchasePrice;
            }
        }
    }

    if (totalReturnedValue > 0) {
        if (!supplier.payments) {
            supplier.payments = [];
        }
        supplier.payments.push({
            id: `RET-${Date.now()}`,
            supplierId: supplierId,
            date: new Date().toISOString(),
            amount: -totalReturnedValue,
            type: 'return',
            note: `Credit for ${returns.length} returned defective items.`
        });
    }

    return safeWrite(db);
});


ipcMain.handle('reduce-stock-and-cost', (event, { productId, color, size, reductionAmount }) => {
    const db = getDatabase();
    const product = db.products.find(p => p.id === productId);

    if (!product || !product.colors?.[color]?.sizes?.[size]) {
        return { success: false, message: 'Product variant not found.' };
    }

    const sizeData = product.colors[color].sizes[size];
    sizeData.quantity = Math.max(0, sizeData.quantity - reductionAmount);

    if (sizeData.stockHistory && sizeData.stockHistory.length > 0) {
        sizeData.stockHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        let amountToDeduct = reductionAmount;
        for (const entry of sizeData.stockHistory) {
            if (amountToDeduct <= 0) break;
            const deductibleAmount = Math.min(amountToDeduct, entry.quantity);
            entry.quantity -= deductibleAmount;
            amountToDeduct -= deductibleAmount;
        }
        sizeData.stockHistory = sizeData.stockHistory.filter(entry => entry.quantity > 0);
    }

    return safeWrite(db);
});


ipcMain.handle('update-sale-cashier', (event, { saleId, newCashier }) => {
    const db = getDatabase();
    const saleIndex = db.sales.findIndex(s => s.id === saleId);
    if (saleIndex > -1) {
        db.sales[saleIndex].cashier = newCashier;
        return safeWrite(db);
    }
    return { success: false, message: 'Sale not found.' };
});

ipcMain.handle('load-receipt-template', async () => {
    try {
        const appPath = app.getAppPath();
        const templatePath = path.join(appPath, 'receipt.html');
        const logoPath = app.isPackaged
            ? path.join(process.resourcesPath, 'build', 'black-icon.png')
            : path.join(__dirname, 'build', 'black-icon.png');

        if (!fs.existsSync(templatePath)) throw new Error(`Receipt template not found at ${templatePath}`);
        if (!fs.existsSync(logoPath)) throw new Error(`Logo image not found at ${logoPath}`);

        const template = fs.readFileSync(templatePath, 'utf-8');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        return { template, logoBase64 };
    } catch (error) { return { error: error.message }; }
});

ipcMain.handle('load-booking-template', async () => {
    try {
        const appPath = app.getAppPath();
        const templatePath = path.join(appPath, 'booking-receipt.html');
        const logoPath = app.isPackaged
            ? path.join(process.resourcesPath, 'build', 'black-icon.png')
            : path.join(__dirname, 'build', 'black-icon.png');

        if (!fs.existsSync(templatePath)) throw new Error(`Booking template not found at ${templatePath}`);
        if (!fs.existsSync(logoPath)) throw new Error(`Logo not found at ${logoPath}`);

        const template = fs.readFileSync(templatePath, 'utf-8');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        return { template, logoBase64 };
    } catch (error) {
        return { error: error.message };
    }
});

ipcMain.on('open-users-window', () => {
    createUsersWindow();
});

ipcMain.handle('get-user-data', () => {
    const db = getDatabase();
    return { allUsers: db.users || [], currentUser: loggedInUser };
});

// --- الكود الجديد الذي تم إضافته ---
ipcMain.handle('change-admin-password', (event, data) => {
    const { oldPassword, newPassword } = data;
    const db = getDatabase();

    if (oldPassword !== db.config.adminPassword) {
        return { success: false, message: 'Incorrect old admin password.' };
    }
    db.config.adminPassword = newPassword;

    const superUser = db.users.find(u => u.username === 'BAZ');
    if (superUser) {
        superUser.password = newPassword;
    }

    return safeWrite(db);
});

ipcMain.handle('change-user-password', (event, data) => {
    const { adminPassword, username, newPassword } = data;
    const db = getDatabase();

    if (adminPassword !== db.config.adminPassword) {
        return { success: false, message: 'Incorrect Admin Password.' };
    }

    const user = db.users.find(u => u.username === username);
    if (!user) {
        return { success: false, message: 'User not found.' };
    }
    user.password = newPassword;

    return safeWrite(db);
});


ipcMain.handle('add-employee', (event, employeeData) => {
    const { username, employeeId, phone } = employeeData;
    const db = getDatabase();

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists.' };
    }
    if (db.users.some(u => u.employeeId && u.employeeId.toLowerCase() === employeeId.toLowerCase())) {
        return { success: false, message: 'Employee ID already exists.' };
    }

    db.users.push({
        username: username,
        password: '',
        employeeId: employeeId,
        phone: phone
    });

    if (!db.salaries[username]) {
        db.salaries[username] = { fixed: 0, commission: 0, bonus: 0 };
    }
    return safeWrite(db);
});

// --- الكود الجديد الذي تم إضافته ---
ipcMain.handle('add-user', (event, data) => {
    const { username, password, adminPassword } = data;
    const db = getDatabase();

    if (adminPassword !== db.config.adminPassword) {
        return { success: false, message: 'Incorrect Admin Password.' };
    }

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists.' };
    }

    db.users.push({
        username: username,
        password: password,
        employeeId: '',
        phone: ''
    });

    if (!db.salaries[username]) {
        db.salaries[username] = { fixed: 0, commission: 0, bonus: 0 };
    }

    const result = safeWrite(db);
    if (result.success) {
        return { success: true };
    } else {
        return { success: false, message: 'Failed to save new user.' };
    }
});


ipcMain.handle('modify-employee', (event, data) => {
    const { originalUsername, newUsername, newEmployeeId, newPhone } = data;
    const db = getDatabase();

    const userIndex = db.users.findIndex(u => u.username === originalUsername);
    if (userIndex === -1) return { success: false, message: 'User not found.' };

    if (newUsername !== originalUsername && db.users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
        return { success: false, message: 'New username already exists.' };
    }
    if (newEmployeeId !== db.users[userIndex].employeeId && db.users.some(u => u.employeeId && u.employeeId.toLowerCase() === newEmployeeId.toLowerCase())) {
        return { success: false, message: 'New Employee ID already exists.' };
    }

    const user = db.users[userIndex];
    user.username = newUsername;
    user.employeeId = newEmployeeId;
    user.phone = newPhone;

    if (originalUsername !== newUsername) {
        db.salaries[newUsername] = db.salaries[originalUsername];
        delete db.salaries[originalUsername];
    }

    return safeWrite(db);
});

ipcMain.handle('delete-employee', (event, data) => {
    const { usernameToDelete } = data;
    const db = getDatabase();

    if (usernameToDelete === 'BAZ') {
        return { success: false, message: 'Cannot delete the primary user.' };
    }

    if (db.users.length <= 1) return { success: false, message: 'Cannot delete the last user.' };

    const initialUserCount = db.users.length;
    db.users = db.users.filter(u => u.username !== usernameToDelete);
    delete db.salaries[usernameToDelete];

    if (db.users.length === initialUserCount) return { success: false, message: 'User not found.' };

    return safeWrite(db);
});

ipcMain.handle('update-category', (event, { oldName, newName }) => {
    const db = getDatabase();

    const categoryIndex = db.categories.indexOf(oldName);
    if (categoryIndex > -1) {
        db.categories[categoryIndex] = newName;
    }

    db.products.forEach(product => {
        if (product.category === oldName) {
            product.category = newName;
        }
    });

    return safeWrite(db);
});

// [--- تعديل ---] معالج لتحديث صنف في فاتورة
ipcMain.handle('update-shipment-item', (event, { shipmentId, itemIndex, newQuantity }) => {
    const db = getDatabase();
    const shipment = db.shipments.find(s => s.id === shipmentId);
    if (!shipment || !shipment.items[itemIndex]) {
        return { success: false, message: "Item not found." };
    }

    const item = shipment.items[itemIndex];
    const product = db.products.find(p => p.id === item.productId);
    if (!product) {
        return { success: false, message: "Product not found." };
    }

    const quantityChange = newQuantity - item.quantity;

    // تحديث مخزون المنتج
    const variant = product.colors?.[item.color]?.sizes?.[item.size];
    if (variant) {
        variant.quantity = (variant.quantity || 0) + quantityChange;
    }

    // تحديث الصنف في الفاتورة
    item.quantity = newQuantity;

    // إعادة حساب الإجمالي للفاتورة
    shipment.totalCost = shipment.items.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0);

    return safeWrite(db);
});

// [--- تعديل ---] معالج لحذف صنف من فاتورة
ipcMain.handle('delete-shipment-item', (event, { shipmentId, itemIndex }) => {
    const db = getDatabase();
    const shipmentIndex = db.shipments.findIndex(s => s.id === shipmentId);
    if (shipmentIndex === -1 || !db.shipments[shipmentIndex].items[itemIndex]) {
        return { success: false, message: "Item not found." };
    }

    const shipment = db.shipments[shipmentIndex];
    const [deletedItem] = shipment.items.splice(itemIndex, 1);

    const product = db.products.find(p => p.id === deletedItem.productId);
    if (product) {
        const variant = product.colors?.[deletedItem.color]?.sizes?.[deletedItem.size];
        if (variant) {
            variant.quantity = Math.max(0, (variant.quantity || 0) - deletedItem.quantity);
        }
    }

    if (shipment.items.length === 0) {
        db.shipments.splice(shipmentIndex, 1);
    } else {
        shipment.totalCost = shipment.items.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0);
    }

    return safeWrite(db);
});

// [--- إصلاح ---] معالج جديد لحذف الفواتير المحددة بمنطق المخزون الصحيح
ipcMain.handle('delete-selected-shipments', (event, { shipmentIds }) => {
    const db = getDatabase();

    const shipmentsToDelete = db.shipments.filter(s => shipmentIds.includes(s.id));
    if (shipmentsToDelete.length === 0) {
        return { success: true, message: 'No shipments to delete.', deletedData: { shipments: [], defects: [] } };
    }

    const shipmentDates = [...new Set(shipmentsToDelete.map(s => s.date.split('T')[0]))];
    const supplierId = shipmentsToDelete[0].supplierId;

    // العثور على التوالف المرتبطة بالفواتير المحددة
    const defectsRelatedToDeletedShipments = db.defects.filter(d =>
        d.supplierId === supplierId && shipmentDates.includes(d.shipmentDate)
    );

    // --- منطق المخزون الصحيح ---
    // الخطوة 1: إرجاع كميات التوالف إلى المخزون (لأنها خصمت عند تسجيلها كتالف)
    defectsRelatedToDeletedShipments.forEach(defect => {
        const product = db.products.find(p => p.id === defect.productId);
        if (product?.colors?.[defect.color]?.sizes?.[defect.size]) {
            const variant = product.colors[defect.color].sizes[defect.size];
            variant.quantity += defect.quantity;
        }
    });

    // الخطوة 2: خصم الكميات الإجمالية للفواتير من المخزون (لأنها أضيفت عند استلام الشحنة)
    shipmentsToDelete.forEach(shipment => {
        shipment.items.forEach(item => {
            const product = db.products.find(p => p.id === item.productId);
            if (product?.colors?.[item.color]?.sizes?.[item.size]) {
                const variant = product.colors[item.color].sizes[item.size];
                variant.quantity = Math.max(0, variant.quantity - item.quantity);
            }
        });
    });
    // --- نهاية منطق المخزون الصحيح ---

    // الخطوة 3: حذف الفواتير والتوالف من قاعدة البيانات
    const defectIdsToDelete = new Set(defectsRelatedToDeletedShipments.map(d => d.id));
    db.shipments = db.shipments.filter(s => !shipmentIds.includes(s.id));
    db.defects = db.defects.filter(d => !defectIdsToDelete.has(d.id));

    const result = safeWrite(db);
    if (result.success) {
        // إرجاع البيانات المحذوفة للسماح بخاصية التراجع
        return { success: true, deletedData: { shipments: shipmentsToDelete, defects: defectsRelatedToDeletedShipments } };
    }
    return { success: false, error: 'Failed to save data after deletion.' };
});


// [--- إصلاح ---] معالج لفصل الأصناف إلى فاتورة جديدة
ipcMain.handle('split-shipment', (event, { sourceShipmentId, itemIndices }) => {
    const db = getDatabase();
    const sourceShipment = db.shipments.find(s => s.id === sourceShipmentId);
    if (!sourceShipment) {
        return { success: false, message: "Source shipment not found." };
    }

    const itemsToMove = [];
    // الحذف بترتيب عكسي لتجنب مشاكل تغيير الفهرس
    itemIndices.sort((a, b) => b - a).forEach(index => {
        const [item] = sourceShipment.items.splice(index, 1);
        itemsToMove.unshift(item); // الإضافة بالترتيب الصحيح
    });

    if (itemsToMove.length > 0) {
        const newShipment = {
            // Use the local helper function to generate a correct ID
            id: getDailyId('SH', db.shipments, sourceShipment.date),
            supplierId: sourceShipment.supplierId,
            date: sourceShipment.date,
            items: itemsToMove,
            totalCost: itemsToMove.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0),
            shippingCost: 0 // الشحن يبقى على الفاتورة الأصلية
        };
        db.shipments.unshift(newShipment);
    }

    // إعادة حساب تكلفة الفاتورة الأصلية
    sourceShipment.totalCost = sourceShipment.items.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0);

    // حذف الفاتورة الأصلية إذا أصبحت فارغة
    if (sourceShipment.items.length === 0) {
        db.shipments = db.shipments.filter(s => s.id !== sourceShipmentId);
    }

    return safeWrite(db);
});

// [--- إصلاح ---] معالج جديد ومُحسَّن لدمج الفواتير المحددة
ipcMain.handle('merge-selected-shipments', (event, { supplierId, shipmentIds }) => {
    const db = getDatabase();

    if (!shipmentIds || shipmentIds.length < 2) {
        return { success: false, message: 'Please select at least two invoices to merge.' };
    }

    const shipmentsToMerge = db.shipments.filter(s => s.supplierId === supplierId && shipmentIds.includes(s.id));

    if (shipmentsToMerge.length !== shipmentIds.length) {
        return { success: false, message: 'Some selected invoices were not found.' };
    }

    // Sort to find the oldest invoice to use as the base for the ID and date
    shipmentsToMerge.sort((a, b) => new Date(a.date) - new Date(b.date));

    const primaryShipment = shipmentsToMerge[0];
    const otherShipments = shipmentsToMerge.slice(1);

    const allItems = shipmentsToMerge.flatMap(s => s.items);
    const totalShipping = shipmentsToMerge.reduce((sum, s) => sum + (s.shippingCost || 0), 0);
    const totalCost = allItems.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0);

    const mergedShipment = {
        id: primaryShipment.id, // Keep the ID of the oldest one
        supplierId: primaryShipment.supplierId,
        date: primaryShipment.date, // Keep the date of the oldest one
        items: allItems,
        totalCost: totalCost,
        shippingCost: totalShipping
    };

    // Remove all the old shipments that were merged
    db.shipments = db.shipments.filter(s => !shipmentIds.includes(s.id));

    // Add the new merged shipment
    db.shipments.unshift(mergedShipment);

    return safeWrite(db);
});

// [--- إضافة ---] دوال النسخ الاحتياطي والاستعادة
ipcMain.handle('backup-database', async () => {
    try {
        const backupDir = path.join(app.getPath('documents'), 'Baz Sport Backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        const defaultPath = path.join(backupDir, `backup-${timestamp}.json`);

        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Database Backup',
            defaultPath: defaultPath,
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (filePath) {
            fs.copyFileSync(dbPath, filePath);
            return { success: true, path: filePath };
        }
        return { success: false, message: 'Backup cancelled.' };
    } catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('restore-database', async (event) => {
    try {
        const { filePaths } = await dialog.showOpenDialog({
            title: 'Restore Database from Backup',
            properties: ['openFile'],
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (filePaths && filePaths.length > 0) {
            const backupPath = filePaths[0];
            // عمل نسخة احتياطية سريعة من القاعدة الحالية قبل الاستعادة
            fs.copyFileSync(dbPath, `${dbPath}.${Date.now()}.bak`);
            // استعادة النسخة الجديدة
            fs.copyFileSync(backupPath, dbPath);

            // إعادة تحميل التطبيق لتطبيق التغييرات
            const win = BrowserWindow.fromWebContents(event.sender);
            win.reload();
            return { success: true };
        }
        return { success: false, message: 'Restore cancelled.' };
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error.message };
    }
});


// --- App Lifecycle ---
app.whenReady().then(createLoginWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
    else if (mainWindow) mainWindow.focus();
});

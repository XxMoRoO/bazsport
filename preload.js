const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // --- عمليات الملفات والبيانات الأساسية ---
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),

    // --- عمليات المصادقة وإدارة المستخدمين ---
    login: (credentials) => ipcRenderer.send('login', credentials),
    logout: () => ipcRenderer.send('logout'),
    addUser: (data) => ipcRenderer.invoke('add-user', data), // تمت إضافة هذا السطر
    addEmployee: (employeeData) => ipcRenderer.invoke('add-employee', employeeData),
    deleteEmployee: (data) => ipcRenderer.invoke('delete-employee', data),
    modifyEmployee: (data) => ipcRenderer.invoke('modify-employee', data),
    changeAdminPassword: (data) => ipcRenderer.invoke('change-admin-password', data),
    validateAdminPassword: (password) => ipcRenderer.invoke('validate-admin-password', password),
    changeUserPassword: (data) => ipcRenderer.invoke('change-user-password', data),


    // --- دوال مساعدة للنوافذ وواجهة المستخدم ---
    openUsersWindow: () => ipcRenderer.send('open-users-window'),
    getUserData: () => ipcRenderer.invoke('get-user-data'),

    // --- عمليات البيع ---
    updateSaleCashier: (data) => ipcRenderer.invoke('update-sale-cashier', data),

    // --- تحميل قوالب الطباعة ---
    loadReceiptTemplate: () => ipcRenderer.invoke('load-receipt-template'),
    loadBookingTemplate: () => ipcRenderer.invoke('load-booking-template'),

    // --- [--- تعديل ---] دوال اليوميات والمصاريف ---
    saveShift: (shiftData) => ipcRenderer.invoke('save-shift', shiftData),
    saveDailyExpense: (expenseData) => ipcRenderer.invoke('save-daily-expense', expenseData),
    updateDailyExpense: (expenseData) => ipcRenderer.invoke('update-daily-expense', expenseData), // [--- إضافة ---]
    deleteDailyExpense: (expenseId) => ipcRenderer.invoke('delete-daily-expense', expenseId), // [--- إضافة ---]
    saveShiftPDF: (data) => ipcRenderer.invoke('save-shift-pdf', data),


    // --- إدارة وقت تقرير الوردية ---
    getLastShiftTime: () => ipcRenderer.invoke('get-last-shift-time'),
    setLastShiftTime: (timestamp) => ipcRenderer.invoke('set-last-shift-time', timestamp),

    // --- تصدير التقارير ---
    exportReturnsToPDF: (data) => ipcRenderer.invoke('export-returns-to-pdf', data),

    // --- Stock and Defect Management ---
    addDefectiveItem: (data) => ipcRenderer.invoke('add-defective-item', data),
    reduceStockAndCost: (data) => ipcRenderer.invoke('reduce-stock-and-cost', data),
    returnDefectsToSupplier: (data) => ipcRenderer.invoke('return-defects-to-supplier', data),

    // --- Category Management ---
    updateCategory: (data) => ipcRenderer.invoke('update-category', data),

    // [--- تعديل ---] دوال جديدة لتعديل ودمج وحذف الفواتير
    updateShipmentItem: (data) => ipcRenderer.invoke('update-shipment-item', data),
    deleteShipmentItem: (data) => ipcRenderer.invoke('delete-shipment-item', data),
    splitShipment: (data) => ipcRenderer.invoke('split-shipment', data),
    mergeSelectedShipments: (data) => ipcRenderer.invoke('merge-selected-shipments', data),
    deleteSelectedShipments: (data) => ipcRenderer.invoke('delete-selected-shipments', data),
    // [--- إضافة ---] دالة جديدة لحفظ فاتورة المورد
    saveNewInvoice: (data) => ipcRenderer.invoke('save-new-invoice', data),

    // [--- إضافة ---] دوال النسخ الاحتياطي والاستعادة
    backupDatabase: () => ipcRenderer.invoke('backup-database'),
    restoreDatabase: () => ipcRenderer.invoke('restore-database'),


    // --- مستمعو الأحداث (Event Listeners) ---
    onLoginFailed: (callback) => ipcRenderer.on('login-failed', callback),
    onSetUser: (callback) => ipcRenderer.on('set-user', (event, user) => callback(user)),
});

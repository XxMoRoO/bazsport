/**
 * renderer.js
 * * نقطة الدخول الرئيسية لواجهة المستخدم.
 * يقوم باستيراد الوحدات اللازمة وبدء تشغيل التطبيق.
 */

import { state } from './js/state.js';
import { cartSession } from './js/api.js';
import { setupEventListeners, createNewReceipt } from './js/events.js';
import { render } from './js/ui.js';
import { showLoader, hideLoader, showNotification } from './js/utils.js';

// --- INITIALIZATION ---
async function init() {
    showLoader();
    try {
        window.api.onSetUser(user => { state.currentUser = user; });

        const data = await window.api.loadData();
        if (data.error) {
            console.error("Initialization Error:", data.error);
            showNotification("Fatal Error: Could not load database.", "error");
            return;
        }

        state.products = data.products || [];
        state.sales = data.sales || [];
        state.users = data.users || [];
        state.categories = ['All', ...(data.categories || [])];
        state.customers = data.customers || [];
        state.bookings = data.bookings || [];
        state.salaries = data.salaries || {};
        state.salariesPaidStatus = data.salariesPaidStatus || {};
        state.expenses = data.expenses || { rent: { amount: 0, paidStatus: {} }, daily: [] };
        state.shifts = data.shifts || []; // [--- إضافة ---]
        state.lastShiftReportTime = data.config?.lastShiftReportTime;
        state.defects = data.defects || [];
        // NEW: Load suppliers and shipments data
        state.suppliers = data.suppliers || [];
        state.shipments = data.shipments || [];

        const userFilter = document.getElementById('user-filter');
        userFilter.innerHTML = '<option value="all" data-lang-key="allUsers">All Users</option>';

        state.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userFilter.appendChild(option);
        });

        cartSession.load();
        // بعد تحميل الجلسة، تحقق مما إذا كانت هناك فواتير
        if (state.receipts.length === 0) {
            createNewReceipt(false); // قم بإنشاء فاتورة جديدة إذا لم تكن هناك أي فاتورة
        }
        setupEventListeners();
        render();
    } catch (error) {
        console.error("Initialization failed:", error);
        showNotification("Application failed to start correctly.", "error");
    } finally {
        hideLoader();
    }
}

init();

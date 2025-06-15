// --- APPLICATION STATE ---
const state = {
    currentPage: 'home-page',
    products: [],
    cart: [],
    sales: [],
    users: [],
    lang: 'en', // 'en' or 'ar'
    editingProductId: null,
    returningSaleId: null,
    selectedSales: new Set(),
    currentUser: null,
    isAdminMode: false,
    categories: ['All'],
    activeCategory: 'All',
};

// --- TRANSLATION DATA ---
const translations = {
    en: {
        navHome: 'Home', navInventory: 'Inventory', navSelling: 'Selling', navHistory: 'History', navAbout: 'About',
        searchPlaceholder: 'Search by name, code, or barcode...',
        inventorySearchPlaceholder: 'Search inventory...',
        addNewProduct: 'Add New Product',
        colProductName: 'Name', colProductCode: 'Code', colBarcode: 'Barcode', colCategory: 'Category', colImage: 'Image', colQuantity: 'Quantity', colPurchasePrice: 'Purchase Price', colSellingPrice: 'Selling Price', colSizes: 'Sizes', colActions: 'Actions',
        modalAddTitle: 'Add New Product', modalEditTitle: 'Edit Product',
        labelProductName: 'Product Name', labelCategory: 'Category', labelProductCode: 'Product Code (SKU)', labelBarcode: 'Main Barcode', labelQuantity: 'Quantity', labelPurchasePrice: 'Purchase Price', labelSellingPrice: 'Selling Price', labelSizes: 'Sizes (comma-separated)', labelImage: 'Product Image',
        labelSizeQuantity: 'Qty for size',
        btnSave: 'Save Product', btnCancel: 'Cancel',
        addToCartTitle: 'Add Products to Cart', selectProduct: 'Select a product', quantity: 'Quantity', size: 'Size', sellingPrice: 'Selling Price (EGP)', addToCart: 'Add to Cart',
        barcodeScanner: 'Scan Barcode', barcodePlaceholder: 'Click here and scan item...',
        cart: 'Cart', subtotal: 'Subtotal:', discountPercent: 'Discount (%):', discountAmount: 'Discount (EGP):', total: 'Total:', paidAmount: 'Paid Amount (EGP)', paidAmountPlaceholder: 'Enter amount paid', completeSale: 'Complete Sale',
        reports: 'Reports', timeFilter: 'Time Filter', allTime: 'All Time', byMonth: 'By Month', byDay: 'By Day', selectMonth: 'Select Month', selectDay: 'Select Day', cashier: 'Cashier', allUsers: 'All Users', exportPdf: 'Export to PDF',
        totalRevenue: 'Total Revenue', totalProfit: 'Total Profit', totalItemsSold: 'Total Items Sold', totalReturns: 'Total Returns', totalReturnsValue: 'Total Returns Value',
        salesHistory: 'Sales History', searchReceiptsPlaceholder: 'Search by Receipt ID or Cashier...',
        selectAll: 'Select All', deleteSelected: 'Delete Selected',
        userManagement: 'User Management', openUserManagement: 'Open User Management',
        btnReturn: 'Return', btnReturned: 'Returned', btnPrint: 'Print', btnBarcode: 'Barcodes',
        outOfStock: 'Out of Stock'
    },
    ar: {
        navHome: 'الرئيسية', navInventory: 'المخزون', navSelling: 'البيع', navHistory: 'السجلات', navAbout: 'حول',
        searchPlaceholder: 'البحث بالاسم أو الكود أو الباركود...',
        inventorySearchPlaceholder: 'البحث في المخزون...',
        addNewProduct: 'إضافة منتج جديد',
        colProductName: 'الاسم', colProductCode: 'الكود', colBarcode: 'الباركود', colCategory: 'الفئة', colImage: 'صورة', colQuantity: 'الكمية', colPurchasePrice: 'سعر الشراء', colSellingPrice: 'سعر البيع', colSizes: 'المقاسات', colActions: 'إجراءات',
        modalAddTitle: 'إضافة منتج جديد', modalEditTitle: 'تعديل المنتج',
        labelProductName: 'اسم المنتج', labelCategory: 'الفئة', labelProductCode: 'كود المنتج (SKU)', labelBarcode: 'الباركود الرئيسي', labelQuantity: 'الكمية', labelPurchasePrice: 'سعر الشراء', labelSellingPrice: 'سعر البيع', labelSizes: 'المقاسات (مفصولة بفاصلة)', labelImage: 'صورة المنتج',
        labelSizeQuantity: 'كمية مقاس',
        btnSave: 'حفظ المنتج', btnCancel: 'إلغاء',
        addToCartTitle: 'إضافة منتجات للسلة', selectProduct: 'اختر منتج', quantity: 'الكمية', size: 'المقاس', sellingPrice: 'سعر البيع (جنيه)', addToCart: 'أضف إلى السلة',
        barcodeScanner: 'مسح الباركود', barcodePlaceholder: 'اضغط هنا وامسح المنتج...',
        cart: 'السلة', subtotal: 'المجموع الفرعي:', discountPercent: 'خصم (٪):', discountAmount: 'خصم (جنيه):', total: 'الإجمالي:', paidAmount: 'المبلغ المدفوع (جنيه)', paidAmountPlaceholder: 'أدخل المبلغ المدفوع', completeSale: 'إتمام البيع',
        reports: 'التقارير', timeFilter: 'تصفية بالوقت', allTime: 'كل الأوقات', byMonth: 'بالشهر', byDay: 'باليوم', selectMonth: 'اختر الشهر', selectDay: 'اختر اليوم', cashier: 'الكاشير', allUsers: 'كل المستخدمين', exportPdf: 'تصدير PDF',
        totalRevenue: 'إجمالي الإيرادات', totalProfit: 'إجمالي الأرباح', totalItemsSold: 'إجمالي القطع المباعة', totalReturns: 'إجمالي المرتجعات', totalReturnsValue: 'قيمة المرتجعات',
        salesHistory: 'سجل المبيعات', searchReceiptsPlaceholder: 'البحث برقم الإيصال أو الكاشير...',
        selectAll: 'تحديد الكل', deleteSelected: 'حذف المحدد',
        userManagement: 'إدارة المستخدمين', openUserManagement: 'فتح إدارة المستخدمين',
        btnReturn: 'إرجاع', btnReturned: 'تم الإرجاع', btnPrint: 'طباعة', btnBarcode: 'الباركودات',
        outOfStock: 'نفذ المخزون'
    }
};

// --- UTILITY FUNCTIONS ---
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getDailyReceiptId() {
    const today = new Date().toISOString().slice(0, 10);
    const salesToday = state.sales.filter(s => s.createdAt.startsWith(today));
    const nextId = salesToday.length + 1;
    return `${today.replace(/-/g, '')}-${nextId}`;
}

function getProductTotalQuantity(product) {
    if (!product.sizes || typeof product.sizes !== 'object') return 0;
    return Object.values(product.sizes).reduce((sum, sizeData) => sum + (parseInt(sizeData.quantity, 10) || 0), 0);
}

// --- DATA PERSISTENCE ---
async function saveData() {
    const result = await window.api.saveData({ products: state.products, sales: state.sales });
    if (!result.success) {
        console.error("Failed to save data:", result.error);
    }
}

const cartSession = {
    save: () => sessionStorage.setItem('bazz-cart', JSON.stringify(state.cart)),
    load: () => {
        const savedCart = sessionStorage.getItem('bazz-cart');
        if (savedCart) {
            try { state.cart = JSON.parse(savedCart); } catch (e) { state.cart = []; }
        }
    }
};

// --- BARCODE PRINTING ---
function printBarcode(barcodeValue, productName, size, price) {
    if (!barcodeValue) {
        console.warn('Attempted to print barcode for a product without one.');
        return;
    }
    const printWindow = window.open('', 'PRINT', 'height=150,width=300');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                    body { 
                        text-align: center; 
                        margin: 0; 
                        padding: 5px; 
                        font-family: Arial, sans-serif;
                        width: 58mm;
                    }
                    p { 
                        margin: 0; 
                        font-size: 10px; 
                        font-weight: bold;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    svg {
                        width: 100%;
                    }
                    @page {
                        size: 58mm 25mm;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                <p>${productName} - ${size}</p>
                <p>${price} EGP</p>
                <svg id="barcode"></svg>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
                <script>
                    window.onload = function() {
                        try {
                            JsBarcode("#barcode", "${barcodeValue}", {
                                format: "CODE128",
                                width: 1.5,
                                height: 40,
                                displayValue: true,
                                fontSize: 12,
                                textMargin: 0,
                                margin: 5
                            });
                            window.print();
                        } catch (e) { 
                            console.error('JsBarcode Error:', e); 
                        }
                        setTimeout(() => window.close(), 500);
                    };
                <\/script>
            </body>
        </html>`);
    printWindow.document.close();
}


// --- UI UPDATE & RENDER FUNCTIONS ---
function updateAdminUI() {
    document.body.classList.toggle('admin-mode', state.isAdminMode);
    document.getElementById('admin-mode-btn').classList.toggle('active', state.isAdminMode);
    if (!state.isAdminMode && (state.currentPage === 'inventory-page' || state.currentPage === 'history-page')) {
        state.currentPage = 'home-page';
    }
}

function updateUIText() {
    const lang = state.lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (translations[lang]?.[key]) {
            if (el.placeholder !== undefined) {
                el.placeholder = translations[lang][key];
            } else {
                if (el.id === 'nav-selling') {
                    el.childNodes[0].nodeValue = translations[lang][key] + ' ';
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        }
    });
    document.getElementById('lang-switcher').textContent = lang === 'en' ? 'العربية' : 'English';
}

function render() {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(state.currentPage)?.classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === state.currentPage);
    });

    if (state.currentPage === 'home-page' || state.currentPage === 'inventory-page') {
        renderCategoryTabs();
    }

    if (state.currentPage === 'home-page') renderProductGallery();
    if (state.currentPage === 'inventory-page') renderInventoryTable();
    if (state.currentPage === 'selling-page') {
        renderSellingPage();
        document.getElementById('barcode-scanner-input').focus();
    }
    if (state.currentPage === 'history-page') renderSalesHistory();
    // No specific render function needed for about-page as it's static HTML

    updateAdminUI();
    renderCart();
    updateUIText();
}

function renderCategoryTabs() {
    const homeTabs = document.getElementById('home-category-tabs');
    const invTabs = document.getElementById('inventory-category-tabs');
    if (!homeTabs || !invTabs) return;
    homeTabs.innerHTML = '';
    invTabs.innerHTML = '';
    state.categories.forEach(category => {
        const tab = document.createElement('div');
        tab.className = `category-tab ${state.activeCategory === category ? 'active' : ''}`;
        tab.textContent = category;
        tab.dataset.category = category;
        homeTabs.appendChild(tab.cloneNode(true));
        invTabs.appendChild(tab);
    });
}

function renderProductGallery() {
    const gallery = document.getElementById('product-gallery');
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    gallery.innerHTML = '';
    let filtered = state.products;
    if (state.activeCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.activeCategory);
    }
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.code && p.code.toLowerCase().includes(searchTerm))
        );
    }
    if (filtered.length === 0) {
        gallery.innerHTML = `<p class="text-center col-span-full">No products found.</p>`;
        return;
    }
    filtered.forEach(p => {
        const totalQuantity = getProductTotalQuantity(p);
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col';
        const buttonText = totalQuantity === 0 ? translations[state.lang].outOfStock : translations[state.lang].addToCart;
        
        const availableSizes = p.sizes ? Object.keys(p.sizes).filter(size => p.sizes[size].quantity > 0) : [];
        const sizeOptions = availableSizes.map(s => `<option value="${s}">${s}</option>`).join('');

        card.innerHTML = `
            <img src="${p.image || ''}" alt="${p.name}" class="w-full h-64 object-cover rounded-md mb-4" onerror="this.onerror=null;this.src='https://placehold.co/400x400/2d3748/e2e8f0?text=No+Image';this.style.display='none'">
            <h3 class="font-bold text-lg">${p.name}</h3>
            <p class="text-gray-400">${p.sellingPrice} EGP</p>
            <p class="text-sm text-gray-500">Stock: ${totalQuantity}</p>
            <div class="mt-auto pt-4">
                <select class="size-selector w-full p-2 mb-2 rounded-lg bg-gray-700 text-white" data-product-id="${p.id}" ${availableSizes.length === 0 ? 'disabled' : ''}>
                     ${sizeOptions || '<option>No sizes</option>'}
                </select>
                 <input type="number" value="1" min="1" max="${totalQuantity}" class="quantity-input w-full p-2 mb-2 rounded-lg bg-gray-700 text-white">
                <button class="add-gallery-to-cart-btn btn-primary w-full py-2 px-4 rounded-lg" data-product-id="${p.id}" ${totalQuantity === 0 ? 'disabled' : ''}>${buttonText}</button>
            </div>
        `;
        gallery.appendChild(card);
    });
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table').querySelector('tbody');
    const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
    tbody.innerHTML = '';
    let filtered = state.products;
    if (state.activeCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.activeCategory);
    }
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.code && p.code.toLowerCase().includes(searchTerm)) 
        );
    }
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No products found.</td></tr>`;
        return;
    }
    filtered.forEach(p => {
        const totalQuantity = getProductTotalQuantity(p);
        const sizesString = p.sizes ? Object.keys(p.sizes).join(', ') : 'N/A';

        const row = document.createElement('tr');
        row.className = "border-b border-gray-700 hover:bg-gray-700/50";
        row.innerHTML = `
            <td class="p-2">${p.name}</td>
            <td class="p-2">${p.code || 'N/A'}</td>
            <td class="p-2">${p.category || 'N/A'}</td>
            <td class="p-2"><img src="${p.image || ''}" alt="${p.name}" class="h-12 w-12 object-cover rounded" onerror="this.onerror=null;this.src='https://placehold.co/100x100/2d3748/e2e8f0?text=No+Image';this.style.display='none'"></td>
            <td class="p-2">${totalQuantity}</td>
            <td class="p-2">${p.purchasePrice.toFixed(2)} EGP</td>
            <td class="p-2">${p.sellingPrice.toFixed(2)} EGP</td>
            <td class="p-2">${sizesString}</td>
            <td class="p-2">
                <div class="flex flex-col space-y-1 items-center">
                    <button class="edit-product-btn btn-secondary text-xs py-1 px-2 rounded w-full" data-id="${p.id}" data-lang-key="modalEditTitle">Edit</button>
                    <button class="delete-product-btn btn-danger text-xs py-1 px-2 rounded w-full" data-id="${p.id}" data-lang-key="deleteSelected">Delete</button>
                    <button class="show-barcodes-btn btn-primary text-xs py-1 px-2 rounded w-full" data-id="${p.id}" data-lang-key="btnBarcode">Barcodes</button>
                </div>
            </td>`;
        tbody.appendChild(row);
    });
}

function renderSellingPage() {
    const productSelection = document.getElementById('product-selection');
    productSelection.innerHTML = `<option value="">${translations[state.lang].selectProduct}</option>`;
    state.products.filter(p => getProductTotalQuantity(p) > 0).forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} (Stock: ${getProductTotalQuantity(p)})`;
        productSelection.appendChild(option);
    });
    renderCart();
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    state.cart.forEach((item, index) => {
        const product = state.products.find(p => p.id === item.productId);
        subtotal += item.price * item.quantity;
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'flex justify-between items-center bg-gray-700 p-2 rounded';
        cartItemDiv.innerHTML = `
            <div>
                <p class="font-bold">${product ? product.name : 'Unknown Item'} (${item.size})</p>
                <p class="text-sm text-gray-400">${item.quantity} x ${item.price.toFixed(2)} EGP</p>
            </div>
            <button class="remove-from-cart-btn btn-danger text-lg" data-index="${index}">&times;</button>`;
        cartItemsContainer.appendChild(cartItemDiv);
    });
    subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    const discountPercent = parseFloat(document.getElementById('discount-percentage').value) || 0;
    const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
    let total = subtotal;
    if (discountPercent > 0) total -= total * (discountPercent / 100);
    else if (discountAmount > 0) total -= discountAmount;
    totalEl.textContent = `${Math.max(0, total).toFixed(2)} EGP`;
    document.getElementById('cart-item-count').textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderSalesHistory() {
    generateReport();
}

// --- MODAL FUNCTIONS ---
function generateSizeQuantityFields(product = {}) {
    const container = document.getElementById('size-quantity-container');
    const sizesString = document.getElementById('product-sizes').value;
    const sizes = sizesString.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    container.innerHTML = '';
    if (sizes.length > 0) {
        sizes.forEach(size => {
            const sizeData = product.sizes && product.sizes[size] ? product.sizes[size] : { quantity: 0 };
            const div = document.createElement('div');
            div.className = 'mb-2';
            div.innerHTML = `
                <label for="quantity-${size}" class="block text-sm mb-1">${translations[state.lang].labelSizeQuantity} ${size}</label>
                <input type="number" id="quantity-${size}" data-size="${size}" value="${sizeData.quantity}" min="0" class="size-quantity-input w-full p-2 rounded-lg bg-gray-700" required>
            `;
            container.appendChild(div);
        });
    }
}


function showProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    const imagePreview = document.getElementById('image-preview');
    const categoryList = document.getElementById('category-list');
    const saveBtn = form.querySelector('button[type="submit"]');

    form.reset();
    imagePreview.classList.add('hidden');
    imagePreview.src = '';

    categoryList.innerHTML = '';
    state.categories.filter(c => c !== 'All').forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        categoryList.appendChild(option);
    });

    saveBtn.disabled = false;
    saveBtn.textContent = translations[state.lang].btnSave;

    if (product) {
        state.editingProductId = product.id;
        modalTitle.textContent = translations[state.lang].modalEditTitle;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-code').value = product.code || '';
        document.getElementById('main-barcode').value = product.mainBarcode || '';
        document.getElementById('purchase-price').value = product.purchasePrice;
        document.getElementById('selling-price').value = product.sellingPrice;
        document.getElementById('product-sizes').value = product.sizes ? Object.keys(product.sizes).join(', ') : '';
        generateSizeQuantityFields(product);
        if (product.image) {
            imagePreview.src = product.image;
            imagePreview.classList.remove('hidden');
        }
    } else {
        state.editingProductId = null;
        modalTitle.textContent = translations[state.lang].modalAddTitle;
        document.getElementById('product-sizes').value = '';
        generateSizeQuantityFields();
    }
    modal.classList.remove('hidden');
}


function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    state.editingProductId = null;
}

function showBarcodeModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('barcode-modal');
    const titleEl = document.getElementById('barcode-modal-title');
    const listEl = document.getElementById('barcode-list');

    titleEl.textContent = `Barcodes for ${product.name}`;
    listEl.innerHTML = '';

    if (product.sizes && Object.keys(product.sizes).length > 0) {
        Object.entries(product.sizes).forEach(([size, sizeData]) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-md';
            itemDiv.innerHTML = `
                <div>
                    <p class="font-bold">Size: ${size}</p>
                    <p class="text-sm text-gray-400">${sizeData.barcode || 'No barcode generated'}</p>
                </div>
                <button class="print-size-barcode-btn btn-secondary py-1 px-3 rounded text-xs" data-product-id="${product.id}" data-size="${size}">Print</button>
            `;
            listEl.appendChild(itemDiv);
        });
    } else {
        listEl.innerHTML = '<p>No sizes available for this product.</p>';
    }

    modal.classList.remove('hidden');
}


function closeBarcodeModal() {
    document.getElementById('barcode-modal').classList.add('hidden');
}


function showReturnModal(saleId) {
    state.returningSaleId = saleId;
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;

    const container = document.getElementById('return-items-container');
    container.innerHTML = '';
    sale.items.forEach((item) => {
        const availableToReturn = item.quantity - (item.returnedQty || 0);
        if (availableToReturn > 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'mb-4';
            itemDiv.innerHTML = `
                <p>${item.productName} (${item.size})</p>
                <label class="text-sm">Return Quantity (Max: ${availableToReturn}):</label>
                <input type="number" value="0" min="0" max="${availableToReturn}" class="return-quantity-input w-full p-2 mt-1 rounded-lg bg-gray-700 text-white" data-item-id="${item.id}" data-product-id="${item.productId}" data-size="${item.size}">
             `;
            container.appendChild(itemDiv);
        }
    });
    document.getElementById('return-modal').classList.remove('hidden');
}

function closeReturnModal() {
    document.getElementById('return-modal').classList.add('hidden');
    state.returningSaleId = null;
}

function showAdminPasswordModal() {
    document.getElementById('admin-password-input').value = '';
    document.getElementById('admin-password-error').classList.add('hidden');
    document.getElementById('admin-password-modal').classList.remove('hidden');
    document.getElementById('admin-password-input').focus();
}

function closeAdminPasswordModal() {
    document.getElementById('admin-password-modal').classList.add('hidden');
}

// --- EVENT LISTENERS (centralized setup)---
function setupEventListeners() {
    const header = document.querySelector('header');
    header.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link, .nav-link *')) {
            const navLink = e.target.closest('.nav-link');
            if (navLink) { state.currentPage = navLink.dataset.page; render(); }
        }
        if (e.target.closest('#home-btn')) { state.currentPage = 'home-page'; render(); }
        if (e.target.id === 'lang-switcher') { state.lang = state.lang === 'en' ? 'ar' : 'en'; render(); }
        if (e.target.id === 'admin-mode-btn') {
            if (state.isAdminMode) { state.isAdminMode = false; render(); return; }
            showAdminPasswordModal();
        }
    });

    document.getElementById('admin-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('admin-password-input').value;
        if (password === 'Moro159753') {
            state.isAdminMode = true;
            closeAdminPasswordModal();
            render();
        } else {
            document.getElementById('admin-password-error').classList.remove('hidden');
        }
    });
    document.getElementById('cancel-admin-password-btn').addEventListener('click', closeAdminPasswordModal);
    document.getElementById('product-sizes').addEventListener('blur', () => {
        const product = state.editingProductId ? state.products.find(p => p.id === state.editingProductId) : {};
        generateSizeQuantityFields(product);
    });

    document.addEventListener('click', async (e) => {
        if (e.target.id === 'add-product-btn') showProductModal();
        if (e.target.id === 'cancel-btn') closeProductModal();
        if (e.target.id === 'close-barcode-modal-btn') closeBarcodeModal();

        if (e.target.classList.contains('edit-product-btn')) {
            const p = state.products.find(p => p.id === e.target.dataset.id);
            if (p) showProductModal(p);
        }
        if (e.target.classList.contains('delete-product-btn')) {
            if (confirm('Are you sure?')) {
                state.products = state.products.filter(p => p.id !== e.target.dataset.id);
                await saveData();
                render();
            }
        }
        if (e.target.classList.contains('show-barcodes-btn')) {
            showBarcodeModal(e.target.dataset.id);
        }
        if (e.target.classList.contains('print-size-barcode-btn')) {
            const productId = e.target.dataset.productId;
            const size = e.target.dataset.size;
            const product = state.products.find(p => p.id === productId);
            if (product && product.sizes[size]) {
                printBarcode(product.sizes[size].barcode, product.name, size, product.sellingPrice);
            }
        }
        if (e.target.classList.contains('category-tab')) { state.activeCategory = e.target.dataset.category; render(); }
        
        if (e.target.classList.contains('add-gallery-to-cart-btn')) {
            const card = e.target.closest('.flex-col');
            const productId = e.target.dataset.productId;
            const size = card.querySelector('.size-selector').value;
            const quantity = parseInt(card.querySelector('.quantity-input').value, 10);
            addToCartHandler({ productId, size, quantity });
        }
        if (e.target.id === 'add-to-cart-btn') {
            const productId = document.getElementById('product-selection').value;
            if (productId) addToCartHandler({ productId });
        }

        if (e.target.classList.contains('remove-from-cart-btn')) {
            state.cart.splice(e.target.dataset.index, 1);
            cartSession.save();
            renderCart();
        }
        if (e.target.id === 'complete-sale-btn') await completeSale();
        if (e.target.matches('.return-sale-btn')) showReturnModal(e.target.dataset.saleId);
        if (e.target.matches('.print-receipt-btn')) await printReceipt(e.target.dataset.saleId);
        if (e.target.id === 'delete-selected-btn') await deleteSelectedSales();
        if (e.target.id === 'cancel-return-btn') closeReturnModal();
        if (e.target.id === 'confirm-return-btn') await confirmReturn();
        if (e.target.id === 'export-pdf-btn') await exportReportToPDF();
        if (e.target.id === 'manage-users-btn') window.api.openUsersWindow();
    });

    document.addEventListener('input', (e) => {
        if (e.target.id === 'product-search') renderProductGallery();
        if (e.target.id === 'inventory-search') renderInventoryTable();
        if (e.target.id === 'discount-percentage' || e.target.id === 'discount-amount') {
            if (e.target.id === 'discount-percentage') document.getElementById('discount-amount').value = '';
            if (e.target.id === 'discount-amount') document.getElementById('discount-percentage').value = '';
            renderCart();
        }
        if (['report-month-picker', 'report-day-picker', 'history-search'].includes(e.target.id)) generateReport();
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'time-filter-type' || e.target.id === 'user-filter') {
            if (e.target.id === 'time-filter-type') {
                document.getElementById('month-filter-container').classList.toggle('hidden', e.target.value !== 'month');
                document.getElementById('day-filter-container').classList.toggle('hidden', e.target.value !== 'day');
            }
            generateReport();
        }
        if (e.target.id === 'product-selection') handleProductSelectionChange(e.target.value);
        if (e.target.id === 'select-all-checkbox') toggleSelectAllSales(e.target.checked);
        if (e.target.classList.contains('sale-checkbox')) handleSaleCheckboxChange(e.target.dataset.saleId, e.target.checked);
        if (e.target.id === 'sale-size') {
            const productId = document.getElementById('product-selection').value;
            const product = state.products.find(p => p.id === productId);
            if (product) {
                const size = e.target.value;
                const qtyInput = document.getElementById('sale-quantity');
                qtyInput.max = product.sizes[size]?.quantity || 0;
            }
        }
    });
    
    // FIX: Combined event listener for paste and keydown for universal scanner compatibility.
    const barcodeInput = document.getElementById('barcode-scanner-input');
    barcodeInput.addEventListener('paste', (event) => {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        const barcode = pastedText.trim();
        if (barcode) {
            handleBarcodeScan(barcode);
            barcodeInput.value = '';
        }
    });
    barcodeInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); 
            const barcode = this.value.trim();
            if (barcode) {
                handleBarcodeScan(barcode);
                this.value = ''; 
            }
        }
    });

    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleProductFormSubmit();
    });
}

// --- Event Handler Logic ---
function handleBarcodeScan(barcode) {
    for (const product of state.products) {
        if (product.sizes) {
            for (const [size, sizeData] of Object.entries(product.sizes)) {
                if (sizeData.barcode === barcode) {
                    addToCartHandler({ productId: product.id, size: size, quantity: 1 });
                    return;
                }
            }
        }
    }
    alert("Barcode not found.");
}

function addToCartHandler({ productId, size = null, quantity = null }) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const selectedSize = size ?? document.getElementById('sale-size').value;
    const qty = quantity ?? parseInt(document.getElementById('sale-quantity').value, 10);
    const price = product.sellingPrice;
    
    if (!selectedSize) {
        alert("Please select a size.");
        return;
    }

    const availableQty = product.sizes[selectedSize]?.quantity || 0;
    if (qty > availableQty) {
        alert(`Not enough stock for size ${selectedSize}. Only ${availableQty} available.`);
        return;
    }

    if (qty > 0) {
        const existingCartItemIndex = state.cart.findIndex(item => item.productId === productId && item.size === selectedSize);
        if (existingCartItemIndex > -1) {
            state.cart[existingCartItemIndex].quantity += qty;
        } else {
            state.cart.push({
                productId: product.id,
                quantity: qty,
                price,
                size: selectedSize,
                purchasePrice: product.purchasePrice
            });
        }
        cartSession.save();
        renderCart();
    }
}


async function completeSale() {
    try {
        if (state.cart.length === 0) {
            console.log("Cart is empty. Cannot complete sale.");
            return;
        };

        const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountPercent = parseFloat(document.getElementById('discount-percentage').value) || 0;
        const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
        let finalTotal = subtotal;
        if (discountPercent > 0) finalTotal -= finalTotal * (discountPercent / 100);
        else if (discountAmount > 0) finalTotal -= discountAmount;

        const paidAmount = parseFloat(document.getElementById('paid-amount').value);
        if (isNaN(paidAmount) || paidAmount < 0) {
            console.log("Invalid paid amount.");
            return;
        }

        const newSale = {
            id: getDailyReceiptId(),
            cashier: state.currentUser ? state.currentUser.username : 'N/A',
            createdAt: new Date().toISOString(),
            totalAmount: finalTotal,
            paidAmount,
            profit: state.cart.reduce((sum, item) => sum + (item.price - item.purchasePrice) * item.quantity, 0) - (subtotal - finalTotal),
            discountAmount: subtotal - finalTotal,
            subtotal,
            items: state.cart.map(item => ({
                id: generateUUID(),
                productId: item.productId,
                productName: state.products.find(p => p.id === item.productId)?.name || 'Unknown',
                quantity: item.quantity,
                unitPrice: item.price,
                purchasePrice: item.purchasePrice,
                size: item.size,
                returnedQty: 0
            }))
        };

        newSale.items.forEach(item => {
            const productIndex = state.products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1 && state.products[productIndex].sizes[item.size] !== undefined) {
                state.products[productIndex].sizes[item.size].quantity -= item.quantity;
            }
        });

        state.sales.unshift(newSale);
        state.cart = [];
        cartSession.save();
        await saveData();
        await printReceipt(newSale.id);
        document.getElementById('paid-amount').value = '';
        document.getElementById('discount-percentage').value = '';
        document.getElementById('discount-amount').value = '';
        render();
    } catch (error) {
        console.error("Error completing sale:", error);
    }
}

async function handleProductFormSubmit() {
    const form = document.getElementById('product-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const newCategory = document.getElementById('product-category').value.trim();
    const mainBarcode = document.getElementById('main-barcode').value.trim();

    const processData = async (imgData) => {
        try {
            const productData = {
                name: document.getElementById('product-name').value,
                category: newCategory,
                code: document.getElementById('product-code').value.trim(),
                mainBarcode: mainBarcode,
                purchasePrice: parseFloat(document.getElementById('purchase-price').value),
                sellingPrice: parseFloat(document.getElementById('selling-price').value),
                image: imgData,
                sizes: {}
            };

            document.querySelectorAll('#size-quantity-container .size-quantity-input').forEach(input => {
                const size = input.dataset.size;
                const quantity = parseInt(input.value, 10);
                if (size && !isNaN(quantity)) {
                    productData.sizes[size] = {
                        quantity: quantity,
                        barcode: `${mainBarcode}${size}`
                    };
                }
            });

            if (state.editingProductId) {
                const index = state.products.findIndex(p => p.id === state.editingProductId);
                state.products[index] = { ...state.products[index], ...productData, updatedAt: new Date().toISOString() };
            } else {
                productData.id = generateUUID();
                productData.createdAt = new Date().toISOString();
                state.products.unshift(productData);
            }

            if (newCategory && !state.categories.includes(newCategory)) {
                state.categories.push(newCategory);
            }

            await saveData();
            closeProductModal();
            await loadAndRenderApp();
        } catch (error) {
            console.error("Error processing product data:", error);
            submitBtn.disabled = false;
        }
    };

    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => processData(reader.result);
        reader.onerror = () => {
            console.error("File reading error.");
            submitBtn.disabled = false;
        }
        reader.readAsDataURL(imageFile);
    } else {
        const existingImage = state.editingProductId ? state.products.find(p => p.id === state.editingProductId).image : null;
        await processData(document.getElementById('image-preview').src || existingImage);
    }
}


function handleProductSelectionChange(productId) {
    const productDetailsDiv = document.getElementById('product-details-for-sale');
    const qtyInput = document.getElementById('sale-quantity');
    const sizeSelect = document.getElementById('sale-size');

    if (productId) {
        const product = state.products.find(p => p.id === productId);
        document.getElementById('sale-price').value = product.sellingPrice;
        
        sizeSelect.innerHTML = Object.entries(product.sizes || {})
            .filter(([size, sizeData]) => sizeData.quantity > 0)
            .map(([size, sizeData]) => `<option value="${size}">${size} (Stock: ${sizeData.quantity})</option>`)
            .join('');

        if (sizeSelect.options.length > 0) {
            const firstSize = sizeSelect.options[0].value;
            qtyInput.max = product.sizes[firstSize]?.quantity || 0;
            productDetailsDiv.classList.remove('hidden');
        } else {
            productDetailsDiv.classList.add('hidden');
        }

    } else {
        productDetailsDiv.classList.add('hidden');
    }
}


function toggleSelectAllSales(isChecked) {
    const saleCheckboxes = document.querySelectorAll('#sales-history-list .sale-checkbox');
    saleCheckboxes.forEach(cb => {
        cb.checked = isChecked;
        const saleId = cb.dataset.saleId;
        if (isChecked) {
            state.selectedSales.add(saleId);
        } else {
            state.selectedSales.delete(saleId);
        }
    });
    document.getElementById('delete-selected-btn').classList.toggle('hidden', state.selectedSales.size === 0);
}

function handleSaleCheckboxChange(saleId, isChecked) {
    if (isChecked) state.selectedSales.add(saleId);
    else state.selectedSales.delete(saleId);
    document.getElementById('delete-selected-btn').classList.toggle('hidden', state.selectedSales.size === 0);
    const allCheckboxes = document.querySelectorAll('#sales-history-list .sale-checkbox');
    document.getElementById('select-all-checkbox').checked = allCheckboxes.length > 0 && state.selectedSales.size === allCheckboxes.length;
}

async function deleteSelectedSales() {
    if (confirm(`Are you sure you want to delete ${state.selectedSales.size} receipts? This will restore product stock.`)) {
        state.selectedSales.forEach(saleId => {
            const saleToDelete = state.sales.find(s => s.id === saleId);
            if (saleToDelete) {
                (saleToDelete.items || []).forEach(item => {
                    const effectiveQty = item.quantity - (item.returnedQty || 0);
                    if (effectiveQty > 0) {
                        const prodIndex = state.products.findIndex(p => p.id === item.productId);
                        if (prodIndex > -1) {
                            if (state.products[prodIndex].sizes[item.size] !== undefined) {
                                state.products[prodIndex].sizes[item.size].quantity += effectiveQty;
                            } else {
                                state.products[prodIndex].sizes[item.size] = { quantity: effectiveQty, barcode: `${state.products[prodIndex].mainBarcode}${item.size}`};
                            }
                        }
                    }
                });
            }
        });

        state.sales = state.sales.filter(s => !state.selectedSales.has(s.id));
        state.selectedSales.clear();
        await saveData();
        render();
    }
}

async function confirmReturn() {
    const sale = state.sales.find(s => s.id === state.returningSaleId);
    if (!sale) return;

    document.querySelectorAll('.return-quantity-input').forEach(input => {
        const returnQuantity = parseInt(input.value);
        if (returnQuantity > 0) {
            const saleItem = sale.items.find(i => i.id === input.dataset.itemId);
            const product = state.products.find(p => p.id === input.dataset.productId);
            
            saleItem.returnedQty = (saleItem.returnedQty || 0) + returnQuantity;

            const itemSubtotal = saleItem.unitPrice * returnQuantity;
            const discountRatio = sale.subtotal > 0 ? sale.discountAmount / sale.subtotal : 0;
            const returnedValue = itemSubtotal - (itemSubtotal * discountRatio);
            const returnedProfit = (saleItem.unitPrice - saleItem.purchasePrice) * returnQuantity - (itemSubtotal * discountRatio);

            sale.totalAmount -= returnedValue;
            sale.profit -= returnedProfit;
            
            if (product) {
                 if (product.sizes[saleItem.size] !== undefined) {
                    product.sizes[saleItem.size].quantity += returnQuantity;
                 } else {
                    product.sizes[saleItem.size] = { quantity: returnQuantity, barcode: `${product.mainBarcode}${saleItem.size}` };
                 }
            }
        }
    });

    await saveData();
    closeReturnModal();
    render();
}

// --- REPORT AND PRINT FUNCTIONS ---
async function printReceipt(saleId) {
    try {
        const sale = state.sales.find(s => s.id === saleId);
        if (!sale) {
            console.error(`Sale with ID ${saleId} not found.`);
            return;
        }

        const receiptData = await window.api.loadReceiptTemplate();
        if (!receiptData || receiptData.error || !receiptData.template) {
            console.error("Could not load receipt template or template is empty:", receiptData?.error);
            return;
        }

        let { template, logoBase64 } = receiptData;
        let itemsHtml = '';
        sale.items.forEach(item => {
            const effectiveQty = item.quantity - (item.returnedQty || 0);
            if (effectiveQty > 0) {
                const unitPrice = item.unitPrice || 0;
                itemsHtml += `<tr><td>${item.productName} (${item.size})</td><td>${effectiveQty}</td><td>${unitPrice.toFixed(2)}</td><td>${(unitPrice * effectiveQty).toFixed(2)}</td></tr>`;
            }
        });

        template = template.replace('{{saleDate}}', new Date(sale.createdAt).toLocaleString());
        template = template.replace('{{saleId}}', sale.id);
        template = template.replace('{{username}}', sale.cashier || 'N/A');
        template = template.replace('{{itemsHtml}}', itemsHtml);
        template = template.replace('{{subtotal}}', sale.subtotal.toFixed(2));
        template = template.replace('{{discountAmount}}', sale.discountAmount.toFixed(2));
        template = template.replace('{{finalTotal}}', sale.totalAmount.toFixed(2));
        template = template.replace('{{paidAmount}}', sale.paidAmount.toFixed(2));
        template = template.replace('{{changeAmount}}', (sale.paidAmount - sale.totalAmount).toFixed(2));
        template = template.replace('{{logoSrc}}', logoBase64 || '');

        const receiptWindow = window.open('', 'PRINT', 'height=800,width=400');
        receiptWindow.document.write(template);
        receiptWindow.document.close();
        setTimeout(() => {
            receiptWindow.focus();
            receiptWindow.print();
        }, 500);
    } catch (error) {
        console.error("Error printing receipt:", error);
    }
}

function getFilteredSales() {
    const timeFilterType = document.getElementById('time-filter-type').value;
    const selectedMonth = document.getElementById('report-month-picker').value;
    const selectedDay = document.getElementById('report-day-picker').value;
    const selectedUser = document.getElementById('user-filter').value;
    const historySearchTerm = document.getElementById('history-search').value.toLowerCase();
    let filteredSales = state.sales;

    if (timeFilterType === 'month' && selectedMonth) {
        filteredSales = filteredSales.filter(sale => sale.createdAt.startsWith(selectedMonth));
    } else if (timeFilterType === 'day' && selectedDay) {
        filteredSales = filteredSales.filter(sale => sale.createdAt.startsWith(selectedDay));
    }
    if (selectedUser !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.cashier === selectedUser);
    }
    if (historySearchTerm) {
        filteredSales = filteredSales.filter(sale =>
            sale.id.toLowerCase().includes(historySearchTerm) ||
            (sale.cashier && sale.cashier.toLowerCase().includes(historySearchTerm))
        );
    }
    return filteredSales;
}

function generateReport() {
    const historyList = document.getElementById('sales-history-list');
    if (!historyList) return;
    const filteredSales = getFilteredSales();

    let totalRevenue = 0, totalProfit = 0, totalItemsSold = 0, totalItemsReturned = 0, totalReturnsValue = 0;
    historyList.innerHTML = '';

    if (filteredSales.length === 0) {
        historyList.innerHTML = `<p class="text-center p-4">No sales history found for the selected criteria.</p>`;
    } else {
        filteredSales.forEach(sale => {
            const saleItems = sale.items || [];
            let itemsHtml = saleItems.map(item => {
                let returnInfo = (item.returnedQty || 0) > 0 ? `<span class="text-yellow-400 ml-2">(Returned: ${item.returnedQty})</span>` : '';
                return `<li class="flex justify-between"><span>${item.quantity}x ${item.productName} (${item.size})</span>${returnInfo}</li>`;
            }).join('');

            totalRevenue += sale.totalAmount;
            totalProfit += sale.profit;

            saleItems.forEach(item => {
                const effectiveQty = item.quantity - (item.returnedQty || 0);
                totalItemsSold += effectiveQty;
                const returnedQty = item.returnedQty || 0;
                if (returnedQty > 0) {
                    totalItemsReturned += returnedQty;
                    const discountRatio = sale.subtotal > 0 ? sale.discountAmount / sale.subtotal : 0;
                    totalReturnsValue += returnedQty * item.unitPrice * (1 - discountRatio);
                }
            });

            const saleCard = document.createElement('div');
            const isSelected = state.selectedSales.has(sale.id);
            saleCard.className = `bg-gray-800 p-4 rounded-lg flex items-start space-x-4 ${isSelected ? 'sale-card-selected' : ''}`;
            const canReturn = saleItems.some(item => (item.quantity - (item.returnedQty || 0)) > 0);

            saleCard.innerHTML = `
                <input type="checkbox" class="sale-checkbox h-5 w-5 mt-1 rounded bg-gray-700 border-gray-600 text-highlight-color focus:ring-highlight-color" data-sale-id="${sale.id}" ${isSelected ? 'checked' : ''}>
                <div class="flex-grow">
                     <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold">Receipt ID: ${sale.id}</p>
                            <p class="text-sm text-gray-400">${new Date(sale.createdAt).toLocaleString()}</p>
                            <p class="text-sm text-gray-500">Cashier: ${sale.cashier || 'N/A'}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="print-receipt-btn btn-secondary py-1 px-3 rounded text-xs" data-sale-id="${sale.id}">${translations[state.lang].btnPrint}</button>
                            <button class="return-sale-btn btn-primary py-1 px-3 rounded text-xs" data-sale-id="${sale.id}" ${canReturn ? '' : 'disabled'}>${canReturn ? translations[state.lang].btnReturn : translations[state.lang].btnReturned}</button>
                        </div>
                    </div>
                    <ul class="mt-2 list-disc list-inside text-sm space-y-1 pl-5">${itemsHtml}</ul>
                    <div class="text-right font-bold mt-2 border-t border-gray-700 pt-2">Total: ${sale.totalAmount.toFixed(2)} EGP</div>
                </div>`;
            historyList.appendChild(saleCard);
        });
    }

    document.getElementById('total-revenue').textContent = `${totalRevenue.toFixed(2)} EGP`;
    document.getElementById('total-profit').textContent = `${totalProfit.toFixed(2)} EGP`;
    document.getElementById('total-items-sold').textContent = totalItemsSold;
    document.getElementById('total-items-returned').textContent = totalItemsReturned;
    document.getElementById('total-returns-value').textContent = `${totalReturnsValue.toFixed(2)} EGP`;
    document.getElementById('selection-controls').classList.toggle('hidden', filteredSales.length === 0);
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
}

async function exportReportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const filteredSales = getFilteredSales();
    const receiptData = await window.api.loadReceiptTemplate();
    const logoBase64 = receiptData.logoBase64;

    const productSales = {};
    const cashierSales = {};
    let totalReturnsCount = 0;
    let totalReturnsValue = 0;

    filteredSales.forEach(sale => {
        const cashier = sale.cashier || 'Unknown';
        if (!cashierSales[cashier]) {
            cashierSales[cashier] = { revenue: 0, profit: 0 };
        }
        cashierSales[cashier].revenue += sale.totalAmount;
        cashierSales[cashier].profit += sale.profit;

        (sale.items || []).forEach(item => {
            const effectiveQty = item.quantity - (item.returnedQty || 0);
            
            const returnedQty = item.returnedQty || 0;
            if (returnedQty > 0) {
                totalReturnsCount += returnedQty;
                const discountRatio = sale.subtotal > 0 ? sale.discountAmount / sale.subtotal : 0;
                totalReturnsValue += returnedQty * item.unitPrice * (1 - discountRatio);
            }

            if (effectiveQty > 0) {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.productName,
                        quantity: 0,
                        income: 0,
                        profit: 0,
                        cashiers: new Set(),
                    };
                }
                const productStat = productSales[item.productId];
                const itemSubtotal = item.unitPrice * effectiveQty;
                const discountRatio = sale.subtotal > 0 ? (sale.discountAmount / sale.subtotal) : 0;
                const itemIncome = itemSubtotal * (1 - discountRatio);
                const itemProfit = (item.unitPrice - (item.purchasePrice || 0)) * effectiveQty - (itemSubtotal * discountRatio);

                productStat.quantity += effectiveQty;
                productStat.income += itemIncome;
                productStat.profit += itemProfit;
                productStat.cashiers.add(cashier);
            }
        });
    });
    
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 12, 12, 12);
    }
    doc.setFontSize(14);
    doc.text("Baz Sport", 28, 20);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Sales Report", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const timeFilterType = document.getElementById('time-filter-type').value;
    let dateText = new Date().toLocaleDateString();
    if (timeFilterType === 'day') dateText = document.getElementById('report-day-picker').value;
    if (timeFilterType === 'month') dateText = document.getElementById('report-month-picker').value;
    doc.text(dateText, doc.internal.pageSize.getWidth() - 14, 20, { align: 'right' });

    const head = [['Product', 'Quantity Sold', 'Cashiers', 'Total Income (EGP)', 'Total Profit (EGP)']];
    const body = Object.values(productSales).map(p => [
        p.name, p.quantity, Array.from(p.cashiers).join(', '),
        p.income.toFixed(2), p.profit.toFixed(2)
    ]);

    const subtotalIncome = Object.values(productSales).reduce((sum, p) => sum + p.income, 0);
    const subtotalProfit = Object.values(productSales).reduce((sum, p) => sum + p.profit, 0);
    body.push([
        { content: 'Subtotals', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: subtotalIncome.toFixed(2), styles: { fontStyle: 'bold' } },
        { content: subtotalProfit.toFixed(2), styles: { fontStyle: 'bold' } }
    ]);

    doc.autoTable({
        head, body, startY: 35,
        headStyles: { fillColor: [45, 55, 72] },
        styles: { font: 'helvetica', fontSize: 10 },
    });

    let finalY = doc.autoTable.previous.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Report Summary", 14, finalY + 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const overallRevenue = Object.values(cashierSales).reduce((sum, c) => sum + c.revenue, 0);
    const overallProfit = Object.values(cashierSales).reduce((sum, c) => sum + c.profit, 0);
    const totalItemsSold = Object.values(productSales).reduce((sum, p) => sum + p.quantity, 0);

    let summaryY = finalY + 22;
    doc.text(`Overall Revenue: ${overallRevenue.toFixed(2)} EGP`, 14, summaryY);
    summaryY += 5;
    doc.text(`Overall Profit: ${overallProfit.toFixed(2)} EGP`, 14, summaryY);
    summaryY += 5;
    doc.text(`Total Items Sold: ${totalItemsSold}`, 14, summaryY);
    summaryY += 5;
    doc.text(`Number of Returns: ${totalReturnsCount}`, 14, summaryY);
    summaryY += 5;
    doc.text(`Total Value of Returns: ${totalReturnsValue.toFixed(2)} EGP`, 14, summaryY);
    summaryY += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Sales by Cashier", 14, summaryY);
    summaryY += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    Object.entries(cashierSales).forEach(([cashier, sales]) => {
        if (summaryY > 280) { 
            doc.addPage();
            summaryY = 15;
        }
        doc.text(`${cashier}: ${sales.revenue.toFixed(2)} EGP (Profit: ${sales.profit.toFixed(2)} EGP)`, 14, summaryY);
        summaryY += 5;
    });

    doc.save(`Baz_Sport_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function populateUserFilter() {
    const userFilter = document.getElementById('user-filter');
    userFilter.innerHTML = `<option value="all">${translations[state.lang].allUsers}</option>`;
    if (state.users) {
        state.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userFilter.appendChild(option);
        });
    }
}

// --- INITIALIZATION ---
async function init() {
    window.api.onSetUser((user) => {
        state.currentUser = user;
        loadAndRenderApp();
    });
}

async function loadAndRenderApp() {
    const data = await window.api.loadData();
    if (data && !data.error) {
        state.products = data.products || [];
        state.sales = data.sales || [];
        state.users = data.users || [];
        const categories = new Set(['All']);
        state.products.forEach(p => { if (p.category) categories.add(p.category); });
        state.categories = Array.from(categories).sort();
    } else {
        console.error("Failed to load data:", data?.error);
    }
    cartSession.load();
    if (!window.listenersAttached) {
        setupEventListeners();
        window.listenersAttached = true;
    }
    populateUserFilter();
    render();
}

init();

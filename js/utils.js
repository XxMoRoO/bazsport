/**
 * js/utils.js
 * * يحتوي هذا الملف على دوال مساعدة متنوعة تستخدم في جميع أنحاء التطبيق.
 */
import { state } from './state.js';

/**
 * يولد معرفًا فريدًا عالميًا (UUID v4).
 * @returns {string} سلسلة UUID.
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * يولد معرفًا يوميًا فريدًا بناءً على التاريخ الحالي.
 * @param {string} prefix - البادئة للمعرّف (مثل 'S' للمبيعات).
 * @param {Array} collection - المجموعة للتحقق من المعرّفات الموجودة.
 * @returns {string} معرّف يومي فريد.
 */
export function getDailyId(prefix, collection) {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const itemsOnDate = collection.filter(item => (item.createdAt || item.date || '').startsWith(date));
    const nextId = itemsOnDate.length + 1;
    return `${prefix}${date.replace(/-/g, '')}-${nextId}`;
}

/**
 * دالة مساعدة لتوليد معرف فريد بسيط (مستخدم في التقارير والفواتير).
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


/**
 * يعرض إشعارًا بسيطًا يختفي تلقائيًا.
 * @param {string} message - الرسالة المراد عرضها.
 * @param {string} type - نوع الإشعار ('success', 'error', 'info').
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    notification.className = `fixed bottom-5 left-5 text-white py-2 px-4 rounded-lg shadow-lg z-50 ${typeClasses[type]}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * يعرض إشعارًا مع زر تراجع.
 * @param {string} message - الرسالة المراد عرضها.
 * @param {function} onUndo - الدالة التي سيتم استدعاؤها عند الضغط على زر التراجع.
 */
export function showUndoNotification(message, onUndo) {
    const existingUndo = document.getElementById('undo-notification');
    if (existingUndo) {
        existingUndo.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'undo-notification';
    notification.className = 'fixed bottom-5 right-5 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50';
    notification.style.minWidth = '300px';

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);

    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    undoButton.className = 'ml-4 text-blue-400 hover:text-blue-300 font-bold';
    notification.appendChild(undoButton);

    document.body.appendChild(notification);

    const timeoutId = setTimeout(() => {
        notification.remove();
    }, 5000);

    undoButton.addEventListener('click', () => {
        onUndo();
        notification.remove();
        clearTimeout(timeoutId);
    });
}

/**
 * يعرض شاشة التحميل.
 * @param {string} message - الرسالة التي ستظهر مع شاشة التحميل.
 */
export function showLoader(message = 'Loading...') {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        // Assuming the loader has a text element inside, if not, this part can be omitted.
        // const loaderText = loader.querySelector('p'); 
        // if (loaderText) {
        //     loaderText.textContent = message;
        // }
        loader.classList.remove('hidden');
    }
}

/**
 * يخفي شاشة التحميل.
 */
export function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.classList.add('hidden');
    }
}

/**
 * يحسب إجمالي كمية المخزون لمنتج معين عبر كل الألوان والمقاسات.
 * @param {object} product - كائن المنتج.
 * @returns {number} إجمالي الكمية.
 */
export function getProductTotalQuantity(product) {
    if (!product || !product.colors) {
        return 0;
    }
    return Object.values(product.colors).reduce((total, colorData) => {
        const colorTotal = Object.values(colorData.sizes || {}).reduce((sum, size) => sum + (size.quantity || 0), 0);
        return total + colorTotal;
    }, 0);
}

/**
 * يعيد التاريخ الحالي بصيغة YYYY-MM-DD.
 * @returns {string} التاريخ بالصيغة المطلوبة.
 */
export function getCurrentDateAsYYYYMMDD() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// [--- إضافة ---] دالة جديدة لتوليد تقرير المبيعات المفصل
export async function generateSoldItemsReportPDF(filteredSales) {
    showLoader('Generating detailed sales report...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Use standard font for English report
        doc.setFont('helvetica', 'normal');

        // --- Collect and analyze sales data ---
        const soldItemsSummary = {};
        const allItems = filteredSales.flatMap(sale =>
            sale.items
                .filter(item => (item.quantity - (item.returnedQty || 0)) > 0)
                .map(item => ({ ...item, saleId: sale.id, saleDate: sale.createdAt }))
        );

        allItems.forEach(item => {
            const netQty = item.quantity - (item.returnedQty || 0);
            const variantKey = `${item.productId}-${item.color}-${item.size}`;

            if (!soldItemsSummary[variantKey]) {
                const product = state.products.find(p => p.id === item.productId);
                soldItemsSummary[variantKey] = {
                    name: item.productName,
                    category: product?.category || 'N/A',
                    color: item.color,
                    size: item.size,
                    unitPrice: item.unitPrice,
                    totalQuantitySold: 0,
                    totalValue: 0,
                    invoices: []
                };
            }
            soldItemsSummary[variantKey].totalQuantitySold += netQty;
            soldItemsSummary[variantKey].totalValue += netQty * item.unitPrice;
            soldItemsSummary[variantKey].invoices.push({
                saleId: item.saleId,
                date: item.saleDate,
                quantity: netQty,
                unitPrice: item.unitPrice
            });
        });

        const sortedItems = Object.values(soldItemsSummary).sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);

        // --- Build PDF Report ---
        doc.setFontSize(20);
        doc.text("Sold Items Report", 105, 20, { align: 'center' });

        let finalY = 30;

        // Helper function to print a table for each item
        const printItemDetails = (item) => {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.name} (${item.color} / ${item.size}) - ${item.category}`, 15, finalY);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            finalY += 7;
            doc.text(`Total Quantity Sold: ${item.totalQuantitySold} | Total Value: ${item.totalValue.toFixed(2)} EGP`, 15, finalY);

            finalY += 5;

            const invoicesTableData = item.invoices.map(inv => [
                inv.saleId,
                new Date(inv.date).toLocaleDateString(),
                inv.quantity,
                `${inv.unitPrice.toFixed(2)} EGP`
            ]);

            doc.autoTable({
                startY: finalY + 5,
                head: [['Invoice ID', 'Date', 'Quantity', 'Value']],
                body: invoicesTableData,
                theme: 'grid',
                headStyles: { font: 'helvetica', fontStyle: 'bold', halign: 'center', fillColor: [44, 62, 80], textColor: [255, 255, 255] },
                bodyStyles: { font: 'helvetica', fontStyle: 'normal', halign: 'center' },
            });

            finalY = doc.lastAutoTable.finalY + 10;
        };

        sortedItems.forEach(item => {
            if (finalY > 260) { // New page if needed
                doc.addPage();
                finalY = 20;
            }
            printItemDetails(item);
        });

        doc.save(`sold-items-report-${new Date().toISOString().slice(0, 10)}.pdf`);
        showNotification('Detailed sold items report exported successfully.', 'success');

    } catch (e) {
        console.error("Detailed PDF Export failed", e);
        showNotification("Failed to generate PDF report.", "error");
    } finally {
        hideLoader();
    }
}


/**
 * Generates and saves a sales report PDF with details of sold items.
 * @param {Array} filteredSales - The sales data for the report.
 * @param {Array} filteredDamagedItems - The damaged items data for the report.
 * @param {Array} soldItemsSummary - Aggregated summary of sold items.
 * @param {string} startDate - The start date for the report period.
 * @param {string} endDate - The end date for the report period.
 */
export async function generateSalesReportPDF(filteredSales, filteredDamagedItems, startDate, endDate) {
    showLoader('Generating detailed report...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- تضمين الخطوط العربية أولاً ---
        const fontRegular = await fetch('./fonts/Tajawal-Regular.ttf').then(res => res.arrayBuffer());
        const fontBold = await fetch('./fonts/Tajawal-Bold.ttf').then(res => res.arrayBuffer());

        doc.addFileToVFS('Tajawal-Regular.ttf', btoa(String.fromCharCode.apply(null, new Uint8Array(fontRegular))));
        doc.addFileToVFS('Tajawal-Bold.ttf', btoa(String.fromCharCode.apply(null, new Uint8Array(fontBold))));

        doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
        doc.addFont('Tajawal-Bold.ttf', 'Tajawal', 'bold');
        doc.setFont('Tajawal', 'bold');

        const reportTitle = "تقرير المبيعات";
        const periodString = `الفترة من: ${startDate} إلى: ${endDate}`;

        // --- Header ---
        doc.setFontSize(20);
        doc.text(reportTitle, 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(periodString, 105, 22, { align: 'center' });
        doc.setFont('Tajawal', 'normal'); // Reset font style

        // --- Sales Summary Table ---
        let totalRevenue = 0, grossProfit = 0, totalItemsSold = 0, totalReturns = 0;
        filteredSales.forEach(s => {
            totalRevenue += s.totalAmount;
            grossProfit += s.profit;
            s.items.forEach(item => {
                const netQtySold = item.quantity - (item.returnedQty || 0);
                totalItemsSold += netQtySold;
                totalReturns += (item.returnedQty || 0);
            });
        });

        const summaryData = [
            ['إجمالي الإيرادات', `${totalRevenue.toFixed(2)} جنيه`],
            ['إجمالي الربح', `${grossProfit.toFixed(2)} جنيه`],
            ['القطع المباعة', totalItemsSold],
            ['إجمالي المرتجعات', totalReturns],
        ];

        doc.autoTable({
            startY: 30,
            head: [['المؤشر', 'القيمة']].map(col => col.reverse()), // Reverse for RTL
            body: summaryData.map(row => row.reverse()), // Reverse for RTL
            theme: 'striped',
            headStyles: { font: 'Tajawal', fontStyle: 'bold', halign: 'right', fillColor: [44, 62, 80], textColor: [255, 255, 255] },
            bodyStyles: { font: 'Tajawal', fontStyle: 'normal', halign: 'right' },
            columnStyles: { 0: { halign: 'right' }, 1: { halign: 'right' } },
        });

        // --- Sales List Table ---
        doc.setFontSize(16);
        doc.text("قائمة المبيعات", 195, doc.lastAutoTable.finalY + 15, { align: 'right' });

        const salesBody = filteredSales.map(sale => [
            `${sale.totalAmount.toFixed(2)} جنيه`,
            sale.cashier,
            sale.customerName || 'N/A',
            new Date(sale.createdAt).toLocaleDateString(),
            sale.id
        ]).map(row => row.reverse()); // Reverse for RTL

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 18,
            head: [['الإجمالي', 'الكاشير', 'العميل', 'التاريخ', 'رقم الفاتورة']].map(col => col.reverse()), // Reverse for RTL
            body: salesBody,
            theme: 'grid',
            headStyles: { font: 'Tajawal', fontStyle: 'bold', halign: 'right', fillColor: [44, 62, 80], textColor: [255, 255, 255] },
            bodyStyles: { font: 'Tajawal', fontStyle: 'normal', halign: 'right' },
            columnStyles: { 0: { halign: 'right' }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        });

        doc.save(`Sales-Report-${startDate}-to-${endDate}.pdf`);
        showNotification('Report exported successfully.', 'success');
    } catch (e) {
        console.error("PDF Export failed", e);
        showNotification("Failed to generate PDF report.", "error");
    } finally {
        hideLoader();
    }
}


/**
 * يقوم بإنشاء فاتورة شحن للمورد بصيغة PDF بتصميم محسن.
 * @param {object} supplier - كائن يحتوي على بيانات المورد.
 * @param {Array} items - قائمة المنتجات المراد شحنها.
 */
export async function generateSupplierShippingPDF(supplier, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // تحميل الخط
    const font = await fetch('./fonts/Tajawal-Regular.ttf').then(res => res.arrayBuffer());
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    doc.addFileToVFS('Tajawal-Regular.ttf', arrayBufferToBase64(font));
    doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
    doc.setFont('Tajawal');

    // إضافة الشعار
    try {
        const logo = await fetch('./build/logo.png').then(res => res.arrayBuffer());
        const logoBase64 = arrayBufferToBase64(logo);
        doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
    } catch (e) {
        console.error("Could not load logo for PDF:", e);
    }

    // رأس الفاتورة
    doc.setFontSize(26);
    doc.setTextColor(44, 62, 80);
    doc.text("فاتورة شحن للمورد", 195, 25, { align: 'right' });

    // التاريخ ورقم الفاتورة
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 195, 35, { align: 'right' });
    doc.text(`رقم الفاتورة: ${generateId().slice(0, 8)}`, 195, 42, { align: 'right' });

    // صندوق بيانات المورد
    doc.setDrawColor(224, 224, 224);
    doc.roundedRect(140, 50, 60, 25, 3, 3, 'S');
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("بيانات المورد", 195, 57, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(supplier.name, 195, 64, { align: 'right' });
    doc.text(supplier.phone || 'N/A', 195, 71, { align: 'right' });

    // جدول المنتجات
    const tableColumn = ["الاجمالي", "الكمية", "السعر", "المقاس", "الاسم", "الكود"];
    const tableRows = items.map(item => [
        (item.cost * item.quantity).toFixed(2),
        item.quantity,
        item.cost.toFixed(2),
        item.size,
        item.name,
        item.code
    ]);

    doc.autoTable({
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            font: 'Tajawal',
            halign: 'center',
            fillColor: [44, 62, 80],
            textColor: [255, 255, 255]
        },
        styles: { font: 'Tajawal', halign: 'center', cellPadding: 3 },
        columnStyles: { 4: { halign: 'right' } },
        didDrawPage: (data) => {
            // تذييل الصفحة
            doc.setFontSize(10);
            doc.setTextColor(127, 140, 141);
            doc.text('Page ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });

    // الإجماليات في نهاية الفاتورة
    let finalY = doc.autoTable.previous.finalY;
    const totalAmount = items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`اجمالي الفاتورة: ${totalAmount.toFixed(2)} جنيه`, 195, finalY + 20, { align: 'right' });

    doc.save(`Shipping_Invoice_${supplier.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
}


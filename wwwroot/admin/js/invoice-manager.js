// Mock Data cho Hóa đơn
const mockInvoices = [
    {
        id: 27,
        customer: "Trần Thị Bích",
        date: "01/11/2025 12:16:46 SA",
        total: 1525000,
        approver: "admin",
        status: "approved", // Đã nhận hàng
        product: { name: "Combo IELTS Intensive", img: "https://via.placeholder.com/50", price: 28500000 }
    },
    {
        id: 28,
        customer: "Nguyễn Văn An",
        date: "01/11/2025 2:37:28 CH",
        total: 1525000,
        approver: null,
        status: "pending", // Đang chờ duyệt
        product: { name: "Combo TOEIC 4 Kỹ Năng", img: "https://via.placeholder.com/50", price: 34500000 }
    }
];

document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem đang ở trang nào để load dữ liệu tương ứng
    if (document.getElementById("invoiceTableBody")) loadApprovedInvoices();
    if (document.getElementById("pendingTableBody")) loadPendingInvoices();
});

// 1. Load danh sách đã duyệt (Cho trang invoices.html)
function loadApprovedInvoices() {
    const tbody = document.getElementById("invoiceTableBody");
    const list = mockInvoices.filter(i => i.status === 'approved');

    document.getElementById("invoiceCount").innerText = list.length;

    tbody.innerHTML = list.map(inv => `
        <tr>
            <td>${inv.id}</td>
            <td><a href="#">${inv.customer}</a></td>
            <td>${inv.date}</td>
            <td>${inv.total.toLocaleString()} VNĐ</td>
            <td><a href="#" onclick="showDetail(${inv.id})">Xem chi tiết</a></td>
            <td>${inv.approver}</td>
            <td><span class="status-badge success">Đã nhận được hàng</span></td>
            <td><button class="btn btn-danger" onclick="deleteInvoice(${inv.id})">Xoá</button></td>
        </tr>
    `).join('');
}

// 2. Load danh sách chờ duyệt (Cho trang pending-invoices.html)
function loadPendingInvoices() {
    const tbody = document.getElementById("pendingTableBody");
    const list = mockInvoices.filter(i => i.status === 'pending');

    tbody.innerHTML = list.map(inv => `
        <tr>
            <td>${inv.id}</td>
            <td><a href="#">${inv.customer}</a></td>
            <td>${inv.date}</td>
            <td>${inv.total.toLocaleString()} VNĐ</td>
            <td><a href="#" onclick="showDetail(${inv.id})">Xem chi tiết</a></td>
            <td>
                <textarea id="note-${inv.id}" rows="2" style="width:100%; border:1px solid #ddd; padding:5px" placeholder="Đang kiểm tra..."></textarea>
            </td>
            <td>
                <button class="btn btn-primary" onclick="updateStatus(${inv.id}, 'approve')">Cập nhật</button>
                <button class="btn btn-success" onclick="updateStatus(${inv.id}, 'approve')">Xác nhận</button>
                <button class="btn btn-danger" onclick="updateStatus(${inv.id}, 'reject')">Huỷ</button>
            </td>
        </tr>
    `).join('');
}

// 3. Xem chi tiết (Modal)
function showDetail(id) {
    const inv = mockInvoices.find(i => i.id === id);
    const modal = document.getElementById("invoiceModal");
    const tbody = document.getElementById("modalInvoiceDetails");

    if (!modal || !inv) return;

    tbody.innerHTML = `
        <tr>
            <td>${inv.product.name}</td>
            <td><img src="${inv.product.img}" width="50"></td>
            <td>1</td>
            <td>${inv.product.price.toLocaleString()} VNĐ</td>
            <td style="color:red">${inv.product.price.toLocaleString()} VNĐ</td>
        </tr>
    `;

    modal.style.display = "block";
}

function closeModal() {
    document.getElementById("invoiceModal").style.display = "none";
}

// 4. Cập nhật trạng thái (Logic giả lập)
function updateStatus(id, action) {
    const note = document.getElementById(`note-${id}`)?.value;
    alert(`Đã thực hiện: ${action.toUpperCase()} cho HĐ #${id}.\nGhi chú: ${note || "Không có"}`);

    // Trong thực tế: Gọi API PUT /api/Orders/{id}
    location.reload();
}

function deleteInvoice(id) {
    if (confirm("Xoá hóa đơn này?")) {
        alert("Đã xoá (Giả lập)");
        location.reload();
    }
}
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Ví dụ: "Nhân viên Kho"
    description: { type: String },
    // permissions chứa danh sách các "vùng" được quản lý
    // Ví dụ: ['product', 'category'] => Có full quyền với Sản phẩm và Danh mục
    permissions: [{ type: String, required: true }], 
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
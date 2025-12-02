const Role = require("../models/RoleModel");

const createRole = (newRole) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { name, permissions } = newRole;
            
            // Check xem tên quyền có bị trùng không
            const checkRole = await Role.findOne({ name: name });
            if (checkRole !== null) {
                return resolve({ status: 'ERR', message: 'Tên vai trò đã tồn tại' });
            }

            const createdRole = await Role.create(newRole);
            resolve({
                status: 'OK',
                message: 'Tạo vai trò thành công',
                data: createdRole
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllRoles = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allRoles = await Role.find().sort({ createdAt: -1 });
            resolve({
                status: 'OK',
                message: 'Success',
                data: allRoles
            });
        } catch (e) {
            reject(e);
        }
    });
};

const updateRole = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRole = await Role.findById(id);
            if (checkRole === null) {
                return resolve({ status: 'ERR', message: 'Role not found' });
            }

            const updatedRole = await Role.findByIdAndUpdate(id, data, { new: true });
            resolve({
                status: 'OK',
                message: 'Cập nhật thành công',
                data: updatedRole
            });
        } catch (e) {
            reject(e);
        }
    });
};

const deleteRole = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRole = await Role.findById(id);
            if (checkRole === null) {
                return resolve({ status: 'ERR', message: 'Role not found' });
            }
            
            await Role.findByIdAndDelete(id);
            resolve({
                status: 'OK',
                message: 'Xóa thành công'
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
    deleteRole
};
const RoleService = require('../services/RoleService');

const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        if (!name || !permissions) {
            return res.status(200).json({ status: 'ERR', message: 'Vui lòng nhập đủ thông tin' });
        }
        const response = await RoleService.createRole(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({ message: e });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const response = await RoleService.getAllRoles();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({ message: e });
    }
};

const updateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const data = req.body;
        if (!roleId) {
            return res.status(200).json({ status: 'ERR', message: 'Role ID is required' });
        }
        const response = await RoleService.updateRole(roleId, data);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({ message: e });
    }
};

const deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        if (!roleId) {
            return res.status(200).json({ status: 'ERR', message: 'Role ID is required' });
        }
        const response = await RoleService.deleteRole(roleId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({ message: e });
    }
};

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
    deleteRole
};
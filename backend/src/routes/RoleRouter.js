const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/checkPermissionMiddleware');


// Chỉ Admin mới được thao tác với Role
router.post('/create', authMiddleware, checkPermission('system'), RoleController.createRole);
router.get('/get-all', authMiddleware, RoleController.getAllRoles);
router.put('/update/:id', authMiddleware, checkPermission('system'), RoleController.updateRole);
router.delete('/delete/:id', authMiddleware, checkPermission('system'), RoleController.deleteRole);

module.exports = router;
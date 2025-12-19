const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");
const { checkBlockMiddleware } = require("../middleware/checkBlockMiddleware");

const upload = require("../config/multer");
const { checkPermission } = require("../middleware/checkPermissionMiddleware");


router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser)
router.put("/update-user/:id", authUserMiddleware, checkBlockMiddleware, upload.single('avatar'), userController.updateUser);
router.delete("/delete-user/:id", authUserMiddleware, userController.deleteUser);
router.get("/getAll", authMiddleware, userController.getAllUser);
router.get("/get-detail/:id", authUserMiddleware, checkBlockMiddleware, userController.getDetailUser); // chỉ có admin và chính người đó mới được phép xem
router.post("/refresh-token", userController.refreshToken);
router.post("/admin/sign-in", userController.loginAdmin);
router.put("/change-password/:id", authUserMiddleware, userController.changePassword);
router.get("/get-all", authMiddleware, userController.getAllUser);

router.post(
    "/create-user-admin", 
    authMiddleware, 
    checkPermission('user'), 
    userController.createUserByAdmin
);

module.exports = router;
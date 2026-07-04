"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminUsers_1 = require("../controllers/adminUsers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth limits - Admin role strictly required for all coordinator management operations
router.use(auth_1.authMiddleware);
router.use((0, auth_1.requireRole)([client_1.Role.ADMIN]));
router.get('/', adminUsers_1.listCoordinators);
router.post('/', adminUsers_1.createCoordinator);
router.patch('/:id', adminUsers_1.updateCoordinator);
router.delete('/:id', adminUsers_1.deleteCoordinator);
exports.default = router;

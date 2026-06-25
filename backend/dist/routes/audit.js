"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const audit_1 = require("../controllers/audit");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Retrieve system audit logs with pagination and filters
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), audit_1.listAuditLogs);
exports.default = router;

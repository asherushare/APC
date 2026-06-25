"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const applications_1 = require("../controllers/applications");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public route to submit a shareholder application
router.post('/', applications_1.submitApplication);
// Administrative route to list shareholder applications (scoped by block for coordinators)
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.listApplications);
// Administrative route to retrieve stats (registered before general /:id parameters)
router.get('/stats', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.getApplicationStats);
// Administrative route to fetch application details (scoped by block for coordinators)
router.get('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.getApplicationDetails);
// Administrative route to update application review status (scoped by block for coordinators)
router.patch('/:id/status', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.updateApplicationStatus);
exports.default = router;

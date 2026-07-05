"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const applications_1 = require("../controllers/applications");
const auth_1 = require("../middleware/auth");
const publicAuth_1 = require("../middleware/publicAuth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Strict rate limiter for public shareholder application submissions (max 10 per hour per IP)
const submitRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_SUBMISSION_ATTEMPTS',
            message: 'Too many application submissions from this IP. Please try again after an hour.',
        },
    },
});
// Public route to submit a shareholder application
router.post('/', submitRateLimiter, applications_1.submitApplication);
// Administrative route to list shareholder applications (scoped by block for coordinators)
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.listApplications);
// Administrative route to retrieve stats (registered before general /:id parameters)
router.get('/stats', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.getApplicationStats);
// Public portal authenticated application submission and retrieval routes
router.post('/apply', publicAuth_1.publicAuthMiddleware, upload_1.upload.fields([
    { name: 'aadhaar' },
    { name: 'pan' },
    { name: 'photo' },
    { name: 'passbook' }
]), applications_1.applyShareholderApplication);
router.get('/my-application', publicAuth_1.publicAuthMiddleware, applications_1.getMyApplication);
// Export shareholder applications list to CSV (Admin only, registered before dynamic /:id parameter)
router.get('/export', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN]), applications_1.exportApplicationsCSV);
// Administrative route to fetch application details (scoped by block for coordinators)
router.get('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.getApplicationDetails);
// Administrative route to update application review status (scoped by block for coordinators)
router.patch('/:id/status', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), applications_1.updateApplicationStatus);
exports.default = router;

## Current Task: Phase 7B — Authentication

**Objective**: Implement secure staff and admin authentication using Argon2id password hashing, JSON Web Tokens (JWT), Refresh Token Rotation (RTR), and secure cookies.
**Status**: Planning

### Requirements
1. Implement password security utility (`backend/src/utils/auth.ts`) utilizing Argon2id for hashing and verification, with a fallback to bcrypt (12 rounds) if Argon2 is not supported.
2. Implement JWT signing and validation utilities (15-minute Access Tokens, 7-day Refresh Tokens).
3. Create `RefreshToken` queries in services to persist token hashes (SHA-256) and handle revocation.
4. Implement `POST /api/v1/auth/login` returning HTTP-only, secure, SameSite=Strict cookies.
5. Implement `POST /api/v1/auth/refresh` executing Refresh Token Rotation (marking old token revoked, issuing new token pair).
6. Implement `POST /api/v1/auth/logout` revoking the current session's refresh token.
7. Create `authMiddleware` to gate and authenticate v1 routes.

### Pre-conditions
- Phase 7A: Backend Foundation compiled and verified.
- Env file containing `JWT_SECRET` and `JWT_REFRESH_SECRET` initialized.

### Files Expected to Change
- `backend/src/utils/auth.ts` [NEW]
- `backend/src/routes/auth.ts` [NEW]
- `backend/src/controllers/auth.ts` [NEW]
- `backend/src/middleware/auth.ts` [NEW]
- `backend/src/app.ts` [MODIFY]

### Definition of Done
- [ ] Authentication endpoints fully functional and tested.
- [ ] Refresh token rotation successfully logs out session upon reuse attempt.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `AI/STATUS.md` updated.
- [ ] `AI/changelog.md` updated.

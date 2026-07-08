-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "ShareholderApplication" DROP COLUMN "nomineeDateOfBirth",
ADD COLUMN     "bankBranch" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "publicUserId" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lockoutUntil",
DROP COLUMN "loginAttempts",
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "PublicUser" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicRefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicUser_phoneNumber_key" ON "PublicUser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PublicUser_email_key" ON "PublicUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PublicRefreshToken_tokenHash_key" ON "PublicRefreshToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "ShareholderApplication" ADD CONSTRAINT "ShareholderApplication_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicRefreshToken" ADD CONSTRAINT "PublicRefreshToken_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

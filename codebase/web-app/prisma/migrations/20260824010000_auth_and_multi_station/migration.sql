CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(6) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(6),
  "refreshTokenExpiresAt" TIMESTAMP(6),
  "scope" TEXT,
  "idToken" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,

  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(6) NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,

  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeatherStation" (
  "id" TEXT NOT NULL,
  "stationCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,

  CONSTRAINT "WeatherStation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StationApiKey" (
  "id" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(6),
  "revokedAt" TIMESTAMP(6),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StationApiKey_pkey" PRIMARY KEY ("id")
);

INSERT INTO "WeatherStation" (
  "id",
  "stationCode",
  "name",
  "description",
  "isActive",
  "updatedAt"
) VALUES (
  'station_main',
  'main-station',
  'Main Station',
  'Default station for readings created before multi-station support.',
  true,
  CURRENT_TIMESTAMP
);

ALTER TABLE "WeatherReading" ADD COLUMN "stationId" TEXT;

UPDATE "WeatherReading"
SET "stationId" = 'station_main'
WHERE "stationId" IS NULL;

ALTER TABLE "WeatherReading" ALTER COLUMN "stationId" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
CREATE UNIQUE INDEX "WeatherStation_stationCode_key" ON "WeatherStation"("stationCode");
CREATE UNIQUE INDEX "StationApiKey_keyHash_key" ON "StationApiKey"("keyHash");

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX "Verification_expiresAt_idx" ON "Verification"("expiresAt");
CREATE INDEX "StationApiKey_stationId_idx" ON "StationApiKey"("stationId");
CREATE INDEX "WeatherReading_stationId_timestamp_idx" ON "WeatherReading"("stationId", "timestamp" DESC);

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StationApiKey" ADD CONSTRAINT "StationApiKey_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "WeatherStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeatherReading" ADD CONSTRAINT "WeatherReading_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "WeatherStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

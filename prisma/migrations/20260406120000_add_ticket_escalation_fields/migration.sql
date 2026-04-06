ALTER TABLE "Ticket"
ADD COLUMN "reportedImpact" TEXT,
ADD COLUMN "urgencyReason" TEXT,
ADD COLUMN "escalationFlag" BOOLEAN NOT NULL DEFAULT false;

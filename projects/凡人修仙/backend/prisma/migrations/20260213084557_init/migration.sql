-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "dao_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" DATETIME,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cultivations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "current_exp" INTEGER NOT NULL DEFAULT 0,
    "total_exp" INTEGER NOT NULL DEFAULT 0,
    "realm" INTEGER NOT NULL DEFAULT 1,
    "realm_name" TEXT NOT NULL DEFAULT '炼气',
    "total_days" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "today_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_cultivating" BOOLEAN NOT NULL DEFAULT false,
    "cultivate_start_at" DATETIME,
    "last_cultivate_at" DATETIME,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cultivations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bazi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "birth_year" INTEGER NOT NULL,
    "birth_month" INTEGER NOT NULL,
    "birth_day" INTEGER NOT NULL,
    "birth_hour" INTEGER NOT NULL,
    "birth_minute" INTEGER NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "year_stem" TEXT NOT NULL,
    "year_branch" TEXT NOT NULL,
    "year_element" TEXT NOT NULL,
    "month_stem" TEXT NOT NULL,
    "month_branch" TEXT NOT NULL,
    "month_element" TEXT NOT NULL,
    "day_stem" TEXT NOT NULL,
    "day_branch" TEXT NOT NULL,
    "day_element" TEXT NOT NULL,
    "hour_stem" TEXT NOT NULL,
    "hour_branch" TEXT NOT NULL,
    "hour_element" TEXT NOT NULL,
    "metal_count" INTEGER NOT NULL DEFAULT 0,
    "wood_count" INTEGER NOT NULL DEFAULT 0,
    "water_count" INTEGER NOT NULL DEFAULT 0,
    "fire_count" INTEGER NOT NULL DEFAULT 0,
    "earth_count" INTEGER NOT NULL DEFAULT 0,
    "root_type" TEXT NOT NULL,
    "root_name" TEXT NOT NULL,
    "primary_element" TEXT NOT NULL,
    "secondary_element" TEXT,
    "variant_type" TEXT,
    "root_bonus" REAL NOT NULL,
    "root_description" TEXT NOT NULL,
    "calculated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bazi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "spirit_stones" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "resources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "treasures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resources_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "effect" TEXT,
    "acquired_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "treasures_resources_id_fkey" FOREIGN KEY ("resources_id") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cultivate_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "exp_gained" INTEGER NOT NULL,
    "bonus_applied" REAL NOT NULL,
    "weather" TEXT,
    "temperature" REAL,
    "city" TEXT,
    "wu_yun" TEXT,
    "liu_qi" TEXT,
    "zi_wu_meridian" TEXT,
    "moon_phase" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cultivate_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "today_minutes" INTEGER NOT NULL,
    "exp_gained" INTEGER NOT NULL,
    "bonus_applied" REAL NOT NULL,
    "greeting" TEXT NOT NULL,
    "cultivation_review" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "wisdom" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "golden_quote" TEXT NOT NULL,
    "generation_prompt" TEXT NOT NULL,
    "model_used" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL,
    "user_rating" INTEGER,
    "user_feedback" TEXT,
    CONSTRAINT "daily_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proverbs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "element" TEXT,
    "theme" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_proverbs" (
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "proverb_id" TEXT NOT NULL,
    "is_comprehended" BOOLEAN NOT NULL DEFAULT false,
    "comprehended_at" DATETIME,

    PRIMARY KEY ("user_id", "date")
);

-- CreateTable
CREATE TABLE "realm_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "max_exp" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dao_name_key" ON "users"("dao_name");

-- CreateIndex
CREATE UNIQUE INDEX "cultivations_user_id_key" ON "cultivations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bazi_user_id_key" ON "bazi"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_user_id_key" ON "resources"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_created_at_idx" ON "chat_messages"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_summaries_user_id_date_key" ON "daily_summaries"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "realm_configs_level_key" ON "realm_configs"("level");

CREATE TABLE IF NOT EXISTS "WeatherReading" (
    "id" SERIAL PRIMARY KEY,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "soilMoisture" DOUBLE PRECISION NOT NULL,
    "soilRaw" DOUBLE PRECISION,
    "rain" BOOLEAN NOT NULL,
    "rainRaw" DOUBLE PRECISION,
    "fire" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WeatherReading_timestamp_idx"
    ON "WeatherReading" ("timestamp" DESC);

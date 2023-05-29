

DROP TABLE IF EXISTS cities;

CREATE TABLE cities(
    "id" SERIAL PRIMARY KEY,
    "openweather_id" INT,
    "name" VARCHAR(255),
    "country" VARCHAR(255),
    "lat" FLOAT,
    "lon" FLOAT
);

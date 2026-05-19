CREATE TABLE IF NOT EXISTS exercises (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    description TEXT NULL,
    instructions TEXT NOT NULL,
    image_url VARCHAR(1000) NULL,
    video_url VARCHAR(1000) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_exercises_name UNIQUE (name)
);

CREATE INDEX idx_exercises_muscle_group ON exercises (muscle_group);
CREATE INDEX idx_exercises_difficulty ON exercises (difficulty);
CREATE INDEX idx_exercises_equipment ON exercises (equipment);
CREATE INDEX idx_exercises_name ON exercises (name);

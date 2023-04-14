CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(120),
    last_name VARCHAR(120),
    city VARCHAR(120),
    state VARCHAR(120),
    country VARCHAR(120),
    profile_picture_url VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS users_roles (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT DEFAULT 3,
    CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    friend_id INT,
    status TEXT DEFAULT 'padding',
    CONSTRAINT friend_relationship UNIQUE (user_id, friend_id)
);
CREATE TABLE IF NOT EXISTS chat_relations (
    id SERIAL PRIMARY KEY,
    chat_id SERIAL,
    user_id BIGINT REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    chat_id BIGINT,
    line_text TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS group_information (
    id SERIAL PRIMARY KEY,
    chat_id INT,
    group_name TEXT,
    group_picture TEXT
);
INSERT INTO roles (id, role)
VALUES (1, 'SUPERADMIN');
INSERT INTO roles (id, role)
VALUES (2, 'ADMIN');
INSERT INTO roles (id, role)
VALUES (3, 'USER');
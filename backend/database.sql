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
    UNIQUE KEY friend_relationship (user_id, friend_id)
);
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id),
    user1_id INT NOT NULL REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS users_groups (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    group_id INT NOT NULL REFERENCES groups(id),
);
CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id),
    consignee_id INT NOT NULL REFERENCES users(id),
    group_id INT REFERENCES groups(id),
    Text TEXT NOT NULL,
    sent_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
INSERT INTO roles (id, role)
VALUES (1, 'SUPERADMIN');
INSERT INTO roles (id, role)
VALUES (2, 'ADMIN');
INSERT INTO roles (id, role)
VALUES (3, 'USER');
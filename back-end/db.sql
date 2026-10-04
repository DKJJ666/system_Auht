CREATE DATABASE system_auth;

USE system_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE users SET role = 'admin' WHERE id = 1;

ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL,
ADD COLUMN google_id VARCHAR(255) NOT NULL UNIQUE AFTER email,
ADD COLUMN foto VARCHAR(255) NULL AFTER google_id;


ALTER TABLE users
MODIFY COLUMN google_id VARCHAR(255) NULL UNIQUE;

ALTER TABLE users
ADD COLUMN last_login TIMESTAMP NULL,
ADD COLUMN provedor VARCHAR(255) NULL AFTER last_login;

ALTER TABLE users
MODIFY COLUMN provedor ENUM('google', 'facebook', 'twitter', 'local') NOT NULL DEFAULT 'local' AFTER google_id;

DESCRIBE users;


CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    CONSTRAINT fk_enderecos_usuarios
        FOREIGN KEY (usuario_id) REFERENCES users(id)
        ON DELETE CASCADE
);
 





 INSERT INTO users (username, email, password, role, provedor) 
VALUES (
  'joaosilva', 
  'joao@email.com', 
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Exemplo de hash bcrypt para a senha "123456"
  'user', 
  'local'
);

INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf) 
VALUES (
  2, 
  '01001000', 
  'Praça da Sé', 
  '100', 
  'Apto 12', 
  'Sé', 
  'São Paulo', 
  'SP'
);

SELECT id, username, email, password, provedor FROM users WHERE email = 'joao@email.com';
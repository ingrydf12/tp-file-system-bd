-- Criar o banco de dados
CREATE DATABASE sistema_arquivos;

-- Conectar ao banco (necessário no psql)
\c sistema_arquivos;

CREATE TABLE usuario (
    id    SERIAL PRIMARY KEY,
    login VARCHAR(50)  NOT NULL UNIQUE,
    nome  VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE pasta (
    id           SERIAL PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_public    BOOLEAN      NOT NULL,
    pin          VARCHAR(20),
    usuario_id   INT NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE arquivo (
    id        SERIAL PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    tamanho   INT NOT NULL,
    tipo      VARCHAR(50) NOT NULL,
    pasta_id  INT NOT NULL,

    FOREIGN KEY (pasta_id) REFERENCES pasta(id) ON DELETE CASCADE
);

CREATE TYPE tipo_permissao AS ENUM ('leitura', 'escrita', 'admin');
CREATE TABLE permissao (
    id         SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    pasta_id   INT NOT NULL,
    tipo       tipo_permissao NOT NULL DEFAULT 'leitura',

    UNIQUE (usuario_id, pasta_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (pasta_id)   REFERENCES pasta(id)   ON DELETE CASCADE
);

CREATE TABLE log_acao (
    id         SERIAL PRIMARY KEY,
    acao       VARCHAR(100) NOT NULL,
    data_hora  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);
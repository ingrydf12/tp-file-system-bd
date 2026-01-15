# Trabalho prático de gerenciamento de banco de dados

## Sobre o Projeto
O projeto é baseado num sistema de arquivos, como Drive e segue a seguinte estrutura:

 - Possui 5 tabelas com chaves primárias e estrangeiras, seguindo um esquema de Usuario - Pasta - Permissao - Arquivo e conta com um Log com histórico de açoes feitas.

 - A aplicação é operada via linha de comando (CLI), focando na lógica de negócios e na interação com o banco de dados.

## Pré-requisitos
Para rodar este projeto, você precisa ter o seguinte instalado em sua máquina:

- Node.js: Versão 18.x ou superior.

- npm (gerenciador de pacotes do Node.js): Vem com a instalação do Node.js.

- PostgreSQL: Servidor de banco de dados relacional.

## Instalação e Configuração
Siga os passos abaixo para configurar e rodar a aplicação em sua máquina.

**Passo 1: Clone o Repositório**
Baixe o código-fonte do projeto para sua máquina.

```
git clone https://github.com/ingrydf12/tp-file-system-bd.git
```

```
cd tp-file-system-bd
```

**Passo 2: Instale as Dependências**
Instale as bibliotecas necessárias para o projeto. 

```
npm install
```

**Passo 3: Configure o Banco de Dados**
Você precisa ter uma instância do PostgreSQL rodando em sua máquina. Se precisar de ajuda para instalar, siga o guia de instalação oficial do PostgreSQL.

Crie um novo banco de dados. Você pode usar uma ferramenta como o pgAdmin ou o cliente de linha de comando psql.

```
CREATE DATABASE sistema_arquivos;
```

Crie as tabelas executando o script SQL abaixo no seu novo banco de dados. É crucial que as tabelas sejam criadas na ordem correta devido às chaves estrangeiras.

```
-- Copie e cole o script completo para criação das tabelas

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
```

Crie um arquivo na raiz do projeto chamado **.env** e adicione suas credenciais de conexão com o banco de dados.

Snippet de código
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=sistema_arquivos
```

**Passo 4: Rode a Aplicação**
Com o banco de dados configurado e as dependências instaladas, você pode iniciar a aplicação CLI.

```
npm run dev
```

Após executar o comando, o menu da aplicação será exibido no terminal, e você poderá interagir com o sistema para criar, ler, atualizar e deletar dados no banco.
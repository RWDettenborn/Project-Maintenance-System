# Sistema de Controle de Manutenção de Equipamentos

Sistema web interno para controlar equipamentos, categorias, locais, técnicos e ordens de serviço de manutenção. Ele substitui planilhas por um dashboard com indicadores obtidos direto do banco de dados.

## Funcionalidades
- Login, logout e páginas protegidas (Firebase Authentication)
- Dashboard com equipamentos ativos, em manutenção e manutenções preventivas
- Cadastro de equipamentos, categorias, locais (com ViaCEP) e técnicos
- Ordens de serviço: abrir, iniciar, concluir e consultar o histórico por equipamento

## Tecnologias utilizadas
- **Front-end:** HTML5, CSS3, Bootstrap 5 e JavaScript (ES6+)
- **Back-end:** Node.js e Express
- **Banco de dados:** Supabase PostgreSQL com Prisma ORM
- **Autenticação:** Firebase Authentication
- **API externa:** ViaCEP
- **Deploy:** Render (API) e Firebase Hosting (front-end)
- **Ferramentas:** VS Code, Git, GitHub, Postman e Google Chrome

## Instruções de execução
1. Entre na pasta do back-end: `cd backend`
2. Copie `.env.example` para `.env` e preencha com os dados do Supabase
3. Instale as dependências: `npm install`
4. Crie as tabelas: `npx prisma migrate deploy`
5. Inicie a API: `npm run dev` (http://localhost:3000)
6. Abra `frontend/login.html` com o Live Server do VS Code

O passo a passo de configuração está em [`docs/SETUP.md`](docs/SETUP.md) e o de deploy (Render, Firebase Hosting, Storage e Postman) em [`docs/DEPLOY.md`](docs/DEPLOY.md).
Os testes da API estão em `docs/maintenance-system.postman_collection.json` (importe no Postman).

## Estrutura do projeto
```
frontend/
  css/  js/  images/  pages/  index.html  login.html
backend/
  server.js
  prisma/            schema.prisma e migrations (o Model)
  src/
    app.js           configuração do Express e das rotas
    routes/          URL -> controller
    controllers/     valida a requisição e responde (HTTP)
    services/        regras de negócio e acesso ao banco (Prisma)
    middlewares/     autenticação por token
    database/        conexão do Prisma
docs/
firebase.json
```

## Autor
Robert William Dettenborn

# Sistema de Controle de Manutenção de Equipamentos

Sistema web interno para controlar equipamentos, categorias, locais, técnicos e ordens de serviço de manutenção. Ele substitui planilhas por um dashboard com indicadores obtidos direto do banco de dados.

## Links
- **Front-end (Firebase Hosting):** https://project-maintenance-system.web.app
- **API (Render):** https://maintenance-system-api-ionx.onrender.com
- **Repositório (GitHub):** https://github.com/RWDettenborn/Project-Maintenance-System

> A API está no plano gratuito do Render: a primeira chamada depois de um tempo parado pode levar cerca de 50 segundos.

## Funcionalidades
- Login, logout e páginas protegidas (Firebase Authentication)
- Perfis de acesso: **Administrador** (acessa tudo) e **Técnico** (visualiza equipamentos e atualiza ordens de serviço)
- Dashboard com equipamentos ativos, em manutenção e manutenções preventivas
- Cadastro de equipamentos (nome, patrimônio, categoria, local, data de aquisição, status e foto no Supabase Storage)
- Histórico de manutenções de cada equipamento
- Cadastro de categorias, locais (com preenchimento de endereço pelo ViaCEP) e técnicos
- Ordens de serviço: abrir, iniciar, concluir e consultar o histórico. O status do equipamento acompanha as ordens (em manutenção enquanto houver ordem pendente)

## Tecnologias utilizadas
- **Front-end:** HTML5, CSS3, Bootstrap 5 e JavaScript (ES6+)
- **Back-end:** Node.js e Express
- **Banco de dados:** Supabase PostgreSQL com Prisma ORM
- **Autenticação:** Firebase Authentication (token validado na API com o Firebase Admin)
- **Armazenamento de arquivos:** Supabase Storage
- **API externa:** ViaCEP
- **Deploy:** Render (API) e Firebase Hosting (front-end)
- **Ferramentas:** VS Code, Git, GitHub, Postman e Google Chrome

## Instruções de execução
1. Entre na pasta do back-end: `cd backend`
2. Copie `.env.example` para `.env` e preencha (Supabase, Firebase Admin, `ADMIN_EMAILS` e Storage)
3. Salve a chave do Firebase Admin como `backend/serviceAccountKey.json` (não vai para o Git)
4. Instale as dependências: `npm install`
5. Crie as tabelas: `npx prisma migrate deploy` e depois `npx prisma generate`
6. Inicie a API: `npm run dev` (http://localhost:3000)
7. Abra `frontend/login.html` com o Live Server do VS Code

Os testes da API estão em `docs/maintenance-system.postman_collection.json` (importe no Postman e defina `baseUrl` e `token`).

## Arquitetura
Cada requisição segue o caminho **Route → Controller → Service → Prisma → Supabase PostgreSQL**:

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Route | `backend/src/routes` | liga a URL e o método HTTP a um controller |
| Controller | `backend/src/controllers` | valida os dados e responde com o código HTTP |
| Service | `backend/src/services` | regras de negócio e acesso ao banco |
| Model | `backend/prisma/schema.prisma` | tabelas do banco (migrations versionadas) |

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
    services/        regras de negócio, Prisma e Supabase Storage
    middlewares/     autenticação por token, perfis e upload de foto
    database/        conexão do Prisma
docs/
  README.md  maintenance-system.postman_collection.json
render.yaml          configuração do deploy da API no Render
firebase.json        configuração do Firebase Hosting
```

## Autor
Robert William Dettenborn

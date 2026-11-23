# Guia de configuração das ferramentas

Ordem recomendada: **VS Code → GitHub → Supabase → Prisma → Firebase Auth → rodar local → Postman → Render → Firebase Hosting**.

## 1. VS Code
- Extensões: *Live Server*, *Prisma*, *ESLint*, *Thunder Client* (opcional).
- Abra a pasta raiz do projeto (a que contém `frontend/` e `backend/`).
- Instale o Node.js LTS (`node -v` deve responder).

## 2. Git + GitHub
```bash
git init
git add .
git commit -m "feat: initial project"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/maintenance-system.git
git push -u origin main
```
Antes do primeiro push confira com `git status` que **nenhum** `.env` nem `*firebase-adminsdk*.json` aparece (o `.gitignore` já bloqueia).
Use commits pequenos e frequentes: o professor pode usá-los para validar autoria.

## 3. Supabase (banco + storage)
1. Crie um projeto em supabase.com (guarde a senha do banco).
2. *Project Settings → Database → Connection string*:
   - **Transaction pooler** (porta 6543) → `DATABASE_URL` (adicione `?pgbouncer=true`).
   - **Session/Direct** (porta 5432) → `DIRECT_URL` (usado pelas migrations).
3. *Storage → New bucket* chamado `equipments` (público para leitura das fotos). Será usado no módulo de upload.
4. Copie `backend/.env.example` para `backend/.env` e preencha.

## 4. Prisma
```bash
cd backend
npm install
npx prisma migrate deploy     # cria as tabelas no Supabase
npx prisma generate
npx prisma studio             # opcional: ver os dados
```
Ao alterar `schema.prisma`: `npx prisma migrate dev --name descricao_da_mudanca`.

## 5. Firebase Authentication
1. console.firebase.google.com → seu projeto → *Authentication → Sign-in method → E-mail/senha* (ativar).
2. *Authentication → Settings → Authorized domains*: adicione o domínio do Hosting e o do Render, se necessário.
3. Chave do **Admin SDK** (para a API validar tokens): *Project settings → Service accounts → Generate new private key*.
   Salve como `backend/serviceAccountKey.json` (**nunca** commitar) e use `GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"` no `.env`.
4. O `firebaseConfig` de `frontend/js/firebase.js` é público por design, mas restrinja a API key por domínio em *Google Cloud → APIs & Services → Credentials*.

## 6. Rodar localmente
```bash
cd backend && npm run dev          # API em http://localhost:3000
```
Front-end: clique direito em `frontend/login.html` → *Open with Live Server*.
Teste: `http://localhost:3000/equipments` deve devolver `[]`.

## 7. Postman
- Crie a collection **Maintenance System** com a variável `baseUrl = http://localhost:3000`.
- Requests: `GET {{baseUrl}}/equipments`, `POST {{baseUrl}}/equipments` (body JSON `{"name":"Compressor","patrimony":"PAT-001"}`), `DELETE {{baseUrl}}/equipments/1`.
- Crie um segundo *Environment* `production` com a URL do Render. Exporte a collection para `docs/`.

## 8. Render (API)
1. *New → Web Service* → conecte o repositório GitHub.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npx prisma migrate deploy`
4. **Start Command:** `npm start`
5. *Environment*: `DATABASE_URL`, `DIRECT_URL`, `CORS_ORIGIN` (URL do Firebase Hosting), `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/serviceAccountKey.json`.
6. *Secret Files*: crie `serviceAccountKey.json` com o conteúdo da chave do Admin SDK.
7. Copie a URL gerada (`https://xxx.onrender.com`) para `frontend/js/config.js`.
> Plano gratuito "dorme" após inatividade: a primeira requisição pode levar ~1 min. Abra a API antes da apresentação.

## 9. Firebase Hosting (front-end)
```bash
npm install -g firebase-tools
firebase login
firebase use --add            # escolha o projeto maintenance-system-...
firebase deploy --only hosting
```
O `firebase.json` já publica a pasta `frontend/`.

## 10. Chrome DevTools
- **Console:** logs e erros do JS. **Network:** confira se `/equipments` retorna 200 e se há erro de CORS.
- **Application → IndexedDB/Local Storage:** sessão do Firebase.

## Checklist de entrega (do enunciado)
- [ ] Link do repositório GitHub
- [ ] Front-end publicado (Firebase Hosting)
- [ ] API publicada (Render)
- [ ] Banco no Supabase
- [ ] README completo

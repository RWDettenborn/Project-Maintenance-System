# Guia de configuração final e deploy

Faça os passos na ordem. Tudo aqui usa o que você já tem (Supabase, Firebase, GitHub).

## 1. Supabase Storage (foto do equipamento)

1. Supabase → **Storage** → **New bucket**.
2. Nome: `equipment-photos`. Marque **Public bucket**. Salve.
3. Supabase → **Project Settings → API**. Copie:
   - **Project URL** → vai em `SUPABASE_URL`
   - **service_role** key → vai em `SUPABASE_SERVICE_ROLE_KEY` (é secreta: nunca coloque no front-end nem no GitHub).

## 2. Firebase Admin (a API valida o login)

1. Firebase → **Configurações do projeto → Contas de serviço → Gerar nova chave privada**.
2. Salve o arquivo como `backend/serviceAccountKey.json` (já está no `.gitignore`).

## 3. Arquivo `.env` local (backend/.env)

Acrescente (veja `.env.example`):

```
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
ADMIN_EMAILS="seu-email@exemplo.com"
SUPABASE_URL="https://SEU-PROJETO.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="cole-a-chave-aqui"
SUPABASE_BUCKET="equipment-photos"
```

- `ADMIN_EMAILS`: e-mails dos administradores, separados por vírgula. Quem não estiver na lista é **Técnico** (só consulta e muda o status das ordens). Se deixar vazio, todos são administradores.

## 4. Atualizar e testar local

```
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Abra o front com o Live Server. Teste: criar equipamento com local, data e foto; entrar com um e-mail que **não** está em `ADMIN_EMAILS` e ver que os botões de criar/editar/excluir somem.

## 5. Deploy da API no Render

1. Suba o código para o GitHub (`git add .`, `git commit`, `git push`).
2. Render → **New → Blueprint** (ele lê o `render.yaml`) **ou** **New → Web Service** com: Root Directory `backend`, Build Command `npm install && npx prisma migrate deploy`, Start Command `npm start`.
3. Em **Environment**, cadastre:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | string do pooler 6543 (a mesma do seu `.env`) |
| `DIRECT_URL` | string do pooler 5432 |
| `CORS_ORIGIN` | `https://maintenance-system-49404.web.app,https://maintenance-system-49404.firebaseapp.com` |
| `FIREBASE_SERVICE_ACCOUNT` | todo o conteúdo do `serviceAccountKey.json` **em uma única linha** |
| `ADMIN_EMAILS` | seu e-mail |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | chave service_role |
| `SUPABASE_BUCKET` | `equipment-photos` |

4. Quando o deploy terminar, abra a URL do Render (`https://....onrender.com`). Deve aparecer `{"message":"Maintenance System API is running."}`.
5. No plano gratuito a API "dorme" e a primeira chamada demora ~50 s. Abra a URL antes da apresentação.

## 6. Deploy do front no Firebase Hosting

1. Em `frontend/js/config.js`, troque `https://YOUR-API-NAME.onrender.com` pela URL real do Render.
2. Instale e entre (uma vez): `npm install -g firebase-tools` e `firebase login`.
3. Na raiz do projeto: `firebase init hosting` (use o projeto existente, pasta pública `frontend`, **não** reescrever para index.html, **não** sobrescrever arquivos). Se já existir `firebase.json`, pule este passo e rode apenas `firebase use --add`.
4. `firebase deploy --only hosting`.
5. Firebase → Authentication → Configurações → **Domínios autorizados**: confirme que o domínio `.web.app` está na lista.

## 7. Postman

1. Importe `docs/maintenance-system.postman_collection.json`.
2. Em **Variables**: `baseUrl` = URL da API (local ou Render).
3. Para pegar o `token`: abra o **Dashboard** já logado, aperte F12 → Console e rode:
   `await (await import("../js/firebase.js")).auth.currentUser.getIdToken()`
   Copie o texto que aparecer (sem as aspas) e cole na variável `token`. Ele expira em 1 hora; repita quando der 401.
4. Rode as requisições e tire prints (criar, listar, atualizar, excluir e mudar status) para o trabalho.

## 8. Erros comuns

| Mensagem | Causa |
|---|---|
| `Acesso negado. Faça login novamente.` (401) | token ausente, expirado, ou `serviceAccountKey.json` não configurado na API |
| `Acesso restrito a administradores.` (403) | e-mail fora de `ADMIN_EMAILS` |
| CORS no console | `CORS_ORIGIN` sem a URL do front |
| `SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured` (no terminal) | faltou configurar a chave do Storage |

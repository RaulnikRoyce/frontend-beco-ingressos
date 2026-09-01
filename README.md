# Ingressos Beco Underground

<img src="public/logo-beco.png" alt="Logo Beco Underground Produções" width="160">

Loja pública de ingressos para os shows do Beco. Checkout Mercado Pago, pedido, QR e recuperação por e-mail.

**Loja** [https://ingressosbeco.raulnikroyce.dev](https://ingressosbeco.raulnikroyce.dev) · **Painel** [https://demo.raulnikroyce.dev](https://demo.raulnikroyce.dev)  
**API** [api-beco-underground](https://github.com/RaulnikRoyce/api-beco-underground) · **Painel (repo)** [frontend-beco-underground](https://github.com/RaulnikRoyce/frontend-beco-underground) · **Loja** este repositório

Produção no [Vercel](https://vercel.com) com domínio `ingressosbeco.raulnikroyce.dev`. A API roda no Render. Meta, lotes e publicação ficam no painel admin.

## Sobre este projeto

Front da venda de ingressos do ecossistema Beco Underground. Consome rotas públicas da API (`/publico/eventos`, `/ingressos/pedidos`) e depende do painel para configurar cada evento antes de abrir a loja.

## Stack

Vue 3 · Vite · UnoCSS · Vue Router · Axios

## Subir local

Com a API em `http://localhost:3000`, rode os comandos abaixo.

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (`5173` ou `5174`). Em desenvolvimento as chamadas `/publico` e `/ingressos` vão para a API via proxy.

Configure `MP_ACCESS_TOKEN` no `.env` da API para checkout real. Sem o token, a loja lista eventos e para no pagamento.

## Rotas

- `/` próximos shows
- `/:slug` evento e checkout
- `/e/:id` fallback numérico (redireciona para slug)
- `/pedido/:codigo` status do pedido
- `/ingresso/:codigo` QR do ingresso pago
- `/recuperar` buscar ingresso por e-mail + código

## Qualidade

```bash
npm run lint
npm run build
```

## Produção

Deploy conectado ao GitHub no Vercel. Build `npm run build`, output `dist`. Domínio `ingressosbeco.raulnikroyce.dev` via CNAME no DNS de `raulnikroyce.dev`.

Variável `VITE_API_URL=https://api-beco-underground.onrender.com` no painel do Vercel. O `vercel.json` garante rewrite SPA para o Vue Router.

Detalhes de DNS, API e widget em [DEPLOY.md](./DEPLOY.md).

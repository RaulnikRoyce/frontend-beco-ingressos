# Ingressos Beco Underground

Loja pública de ingressos. Vue 3 + Vite + UnoCSS.

- Produção: https://ingressosbeco.raulnikroyce.dev
- Painel admin: https://demo.raulnikroyce.dev

## Local

```bash
npm install
npm run dev
```

API em `http://localhost:3000` (proxy Vite). Configure `MP_ACCESS_TOKEN` na API para checkout real.

## Rotas

- `/` próximos shows
- `/:slug` evento e checkout
- `/e/:id` fallback numérico (redireciona para slug)
- `/pedido/:codigo` status do pedido
- `/ingresso/:codigo` QR do ingresso pago
- `/recuperar` buscar ingresso por e-mail + código

Deploy: veja [DEPLOY.md](./DEPLOY.md).

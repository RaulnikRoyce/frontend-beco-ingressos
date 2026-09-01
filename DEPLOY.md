# Deploy da loja de ingressos

Site no ar em [https://ingressosbeco.raulnikroyce.dev](https://ingressosbeco.raulnikroyce.dev).

## Vercel

1. Conecte o repositório `frontend-beco-ingressos` na branch `main`.
2. Framework Vite (detectado automaticamente). Build `npm run build`, output `dist`.
3. Em **Environment Variables**, cadastre `VITE_API_URL` = `https://api-beco-underground.onrender.com` (Production).
4. Em **Domains**, adicione `ingressosbeco.raulnikroyce.dev`.
5. No DNS de `raulnikroyce.dev`, crie CNAME `ingressosbeco` apontando para o valor que o Vercel indicar (em geral `cname.vercel-dns.com`).

O `vercel.json` na raiz faz rewrite SPA (`/recuperar`, `/:slug`, etc.).

## Variáveis de ambiente (Vercel)

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://api-beco-underground.onrender.com` |

## API (Render)

Atualize `CORS_ORIGIN` na API para incluir as duas origens:

```text
https://demo.raulnikroyce.dev,https://ingressosbeco.raulnikroyce.dev
```

Variáveis de pagamento na API:

| Variável | Uso |
|---|---|
| `MP_ACCESS_TOKEN` | Token Mercado Pago (produção ou test) |
| `LOJA_INGRESSOS_URL` | `https://ingressosbeco.raulnikroyce.dev` |
| `API_PUBLIC_URL` | URL pública da API (webhook MP) |

## Cron (reservas expiradas)

Agende no Render ou cron externo a cada 5 minutos:

```bash
npm run job:expirar-reservas
```

## Widget portfólio

Inclua no site pessoal:

```html
<div id="beco-proximo-show"></div>
<script src="https://ingressosbeco.raulnikroyce.dev/widget.js"></script>
```

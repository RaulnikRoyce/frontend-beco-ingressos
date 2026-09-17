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

## Widget portfólio

Inclua no site pessoal:

```html
<div id="beco-proximo-show"></div>
<script src="https://ingressosbeco.raulnikroyce.dev/widget.js"></script>
```

**Importante:** o widget faz `fetch` na API a partir do domínio onde ele está embedado — esse domínio (o "site pessoal", não a loja nem o painel) também precisa estar em `CORS_ORIGIN` na API, senão o navegador bloqueia a chamada e o widget não aparece (silenciosamente, exceto por um aviso no console).

Se a API ou a loja rodarem em outro domínio (staging, por exemplo), sobrescreva sem editar o arquivo:

```html
<script
  src="https://ingressosbeco.raulnikroyce.dev/widget.js"
  data-api="https://outra-api.exemplo.com"
  data-loja="https://outra-loja.exemplo.com"
></script>
```

# Deploy da loja de ingressos

Site público em `https://ingressosbeco.raulnikroyce.dev`.

## Netlify

1. Conecte o repositório `frontend-beco-ingressos` (ou monorepo apontando para esta pasta).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Domínio customizado: `ingressosbeco.raulnikroyce.dev`

## Variáveis de ambiente

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

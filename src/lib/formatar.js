export function formatarData(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  if (!y) return iso;
  return `${d}/${m}/${y}`;
}

export function formatarMoeda(valor) {
  const n = Number(valor);
  if (Number.isNaN(n)) return '0,00';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function atualizarOg({ title, description, url }) {
  document.title = title;
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      if (prop.startsWith('og:')) el.setAttribute('property', prop);
      else el.setAttribute('name', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  setMeta('og:title', title);
  setMeta('og:description', description);
  setMeta('description', description);
  if (url) setMeta('og:url', url);
  setMeta('og:image', `${window.location.origin}/logo-beco.png`);
}

export function schemaEvento(evento, lote) {
  const scriptId = 'schema-evento';
  document.getElementById(scriptId)?.remove();
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.nome,
    startDate: evento.data,
    location: { '@type': 'Place', name: evento.local },
    offers: lote ? {
      '@type': 'Offer',
      price: lote.preco,
      priceCurrency: 'BRL',
      availability: lote.restam > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
    } : undefined
  });
  document.head.appendChild(script);
}

(function () {
  const script = document.currentScript;
  const API = (script && script.getAttribute('data-api')) || 'https://api-beco-underground.onrender.com';
  const LOJA = (script && script.getAttribute('data-loja')) || 'https://ingressosbeco.raulnikroyce.dev';

  fetch(`${API}/publico/eventos`)
    .then((r) => r.json())
    .then((eventos) => {
      const proximo = eventos[0];
      if (!proximo) return;
      const link = proximo.slug ? `${LOJA}/${proximo.slug}` : `${LOJA}/e/${proximo.id}`;
      const alvo = document.getElementById('beco-proximo-show');
      if (!alvo) return;
      const a = document.createElement('a');
      a.setAttribute('href', link);
      a.style.color = '#dc2626';
      a.style.fontWeight = '700';
      a.textContent = proximo.nome;
      alvo.textContent = '';
      alvo.appendChild(a);
      alvo.appendChild(document.createTextNode(' · ' + proximo.local));
    })
    .catch((erro) => {
      console.warn('[beco-widget] não foi possível carregar o próximo show:', erro);
    });
})();

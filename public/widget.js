(function () {
  const API = 'https://api-beco-underground.onrender.com';
  const LOJA = 'https://ingressosbeco.raulnikroyce.dev';

  fetch(`${API}/publico/eventos`)
    .then((r) => r.json())
    .then((eventos) => {
      const proximo = eventos[0];
      if (!proximo) return;
      const link = proximo.slug ? `${LOJA}/${proximo.slug}` : `${LOJA}/e/${proximo.id}`;
      const alvo = document.getElementById('beco-proximo-show');
      if (!alvo) return;
      alvo.innerHTML = `<a href="${link}" style="color:#dc2626;font-weight:700">${proximo.nome}</a> · ${proximo.local}`;
    })
    .catch(() => {});
})();

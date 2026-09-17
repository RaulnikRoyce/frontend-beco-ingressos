export function mensagemDeErro(erro, fallback = 'Não foi possível concluir a operação.') {
  const dados = erro?.response?.data;
  if (!dados) return fallback;

  if (Array.isArray(dados.detalhes) && dados.detalhes.length) {
    return dados.detalhes.map((d) => d.mensagem).filter(Boolean).join(' ') || dados.erro || fallback;
  }

  return dados.erro || fallback;
}

import api from '../api';

export async function listarEventos() {
  const { data } = await api.get('/publico/eventos');
  return data;
}

export async function obterEvento(slugOuId, preview = false) {
  const { data } = await api.get(`/publico/eventos/${slugOuId}`, {
    params: preview ? { preview: '1' } : undefined
  });
  return data;
}

export async function criarPedido(payload) {
  const { data } = await api.post('/ingressos/pedidos', payload);
  return data;
}

export async function obterPedido(codigo) {
  const { data } = await api.get(`/ingressos/pedidos/${codigo}`);
  return data;
}

export async function obterIngresso(codigo) {
  const { data } = await api.get(`/ingressos/emitidos/${codigo}`);
  return data;
}

export async function inscreverListaEspera(eventoId, email) {
  const { data } = await api.post('/ingressos/lista-espera', { evento_id: eventoId, email });
  return data;
}

export async function recuperarIngresso(email, codigoPedido) {
  const { data } = await api.post('/ingressos/recuperar', { email, codigo_pedido: codigoPedido });
  return data;
}

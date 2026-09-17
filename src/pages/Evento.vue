<template>
  <div v-if="evento">
    <p v-if="preview" class="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">Preview admin. Venda ainda em rascunho.</p>

    <header class="hero-evento mb-8">
      <p class="text-xs font-bold uppercase tracking-wider text-red-400">{{ formatarData(evento.data) }}</p>
      <h1 class="mt-2 text-3xl font-extrabold sm:text-4xl">{{ evento.nome }}</h1>
      <p class="mt-2 text-zinc-400">{{ evento.local }}</p>
    </header>

    <div v-if="loteAtivo" class="card checkout-card">
      <p class="text-xs font-bold uppercase tracking-wider text-zinc-500">Lote atual</p>
      <div class="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-zinc-300">{{ loteAtivo.nome }}</p>
          <p class="checkout-preco mt-2">R$ {{ formatarMoeda(loteAtivo.preco) }}</p>
          <p class="mt-3">
            <span class="badge-disponivel">Restam {{ loteAtivo.restam }}</span>
          </p>
        </div>
      </div>

      <form class="form-grid mt-8 border-t border-zinc-800 pt-8" @submit.prevent="comprar">
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Quantidade (máx. 4)</span>
          <input v-model.number="form.quantidade" type="number" min="1" :max="Math.min(4, loteAtivo.restam)" class="field" required @input="atualizarTotal" />
        </label>

        <div class="total-box grid gap-1 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-zinc-400">Subtotal</span>
            <span class="font-mono">R$ {{ formatarMoeda(precificacao.subtotal) }}</span>
          </div>
          <div v-if="precificacao.desconto > 0" class="flex items-center justify-between text-emerald-400">
            <span>Desconto do cupom</span>
            <span class="font-mono">- R$ {{ formatarMoeda(precificacao.desconto) }}</span>
          </div>
          <div v-if="precificacao.repassa && precificacao.taxa > 0" class="flex items-center justify-between text-zinc-400">
            <span>Taxa de serviço</span>
            <span class="font-mono">+ R$ {{ formatarMoeda(precificacao.taxa) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-zinc-800 pt-2">
            <span class="font-semibold text-zinc-300">Total{{ precificacao.carregando ? ' (atualizando…)' : '' }}</span>
            <span class="text-xl font-bold font-mono">R$ {{ formatarMoeda(precificacao.total) }}</span>
          </div>
        </div>

        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Nome completo</span>
          <input v-model="form.nome" class="field" required autocomplete="name" />
        </label>
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">E-mail</span>
          <input v-model="form.email" type="email" class="field" required autocomplete="email" />
        </label>
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Cupom (opcional)</span>
          <input v-model="form.cupom" class="field" autocomplete="off" />
          <span v-if="erroCupom" class="text-xs text-amber-300">{{ erroCupom }}</span>
        </label>
        <label class="flex items-start gap-2 text-sm text-zinc-400">
          <input v-model="form.lgpd" type="checkbox" class="mt-1" />
          Li e aceito o uso dos meus dados para emissão do ingresso e contato sobre este evento.
        </label>
        <p v-if="erro" class="erro-box" role="alert">{{ erro }}</p>
        <button type="submit" class="btn-primary" :disabled="enviando || !form.lgpd">
          {{ enviando ? 'Redirecionando…' : `Pagar R$ ${formatarMoeda(precificacao.total)}` }}
        </button>
      </form>
    </div>

    <div v-else-if="loteEsgotado" class="card checkout-card">
      <p class="text-xs font-bold uppercase tracking-wider text-zinc-500">Lote atual</p>
      <div class="mt-2">
        <p class="text-sm font-semibold text-zinc-300">{{ loteEsgotado.nome }}</p>
        <p class="checkout-preco mt-2">R$ {{ formatarMoeda(loteEsgotado.preco) }}</p>
        <p class="mt-3"><span class="badge-esgotado">Esgotado</span></p>
      </div>
      <div class="mt-6">
        <p class="text-sm text-zinc-400">Esgotado neste lote. Deixe seu e-mail para aviso.</p>
        <form class="form-grid form-grid-2 mt-4" @submit.prevent="listaEspera">
          <input v-model="emailEspera" type="email" class="field" placeholder="Seu e-mail" required />
          <button type="submit" class="btn-ghost w-full">Avisar quando abrir</button>
        </form>
      </div>
    </div>

    <p v-else class="card text-sm text-zinc-500">Em breve. Nenhum lote à venda no momento.</p>
  </div>
  <p v-else-if="carregando" class="text-sm text-zinc-500">Carregando evento…</p>
  <p v-else class="erro-box">{{ erro || 'Evento não encontrado.' }}</p>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obterEvento, criarPedido, previsualizarPedido, inscreverListaEspera } from '../services/loja';
import { formatarData, formatarMoeda, atualizarOg, schemaEvento } from '../lib/formatar';
import { mensagemDeErro } from '../lib/erros';
import { LOJA_URL } from '../config';

function mensagemAmigavel(e) {
  const status = e?.response?.status;
  const texto = mensagemDeErro(e, '');
  if (!texto) return 'Não foi possível iniciar a compra. Tente de novo em instantes.';
  if (status === 503 || /indisponível|MP_ACCESS|mercadopago|access_token/i.test(texto)) {
    return 'Pagamento temporariamente indisponível. Fale com a produção do evento.';
  }
  if (/esgotado|estoque/i.test(texto)) return 'Ingressos esgotados para este lote.';
  if (/cupom/i.test(texto)) return texto;
  return texto.length > 120 ? 'Não foi possível concluir a compra. Tente novamente.' : texto;
}

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const evento = ref(null);
    const carregando = ref(true);
    const erro = ref('');
    const enviando = ref(false);
    const emailEspera = ref('');
    const previewToken = computed(() => String(route.query.preview_token || ''));
    const preview = computed(() => Boolean(previewToken.value));

    const form = reactive({
      quantidade: 1,
      nome: '',
      email: '',
      cupom: '',
      lgpd: false,
    });

    const slugOuId = computed(() => route.params.slug || route.params.id);

    const loteAtivo = computed(() => {
      if (evento.value?.lote_vigente) return evento.value.lote_vigente;
      const lotes = evento.value?.lotes || [];
      return lotes.find((l) => l.vigente || l.status_venda === 'vigente') || null;
    });

    const loteEsgotado = computed(() => {
      if (loteAtivo.value) return null;
      const lotes = evento.value?.lotes || [];
      return lotes.find((l) => l.status_venda === 'esgotado') || null;
    });

    const precificacao = reactive({
      subtotal: 0,
      desconto: 0,
      taxa: 0,
      repassa: false,
      total: 0,
      carregando: false,
    });
    const erroCupom = ref('');
    let timerPrecificacao = null;

    function montarPayloadPrecificacao(comCupom) {
      const payload = { lote_id: loteAtivo.value.id, quantidade: form.quantidade };
      if (comCupom && form.cupom) payload.cupom = form.cupom;
      if (/^\d+$/.test(String(slugOuId.value))) payload.evento_id = Number(slugOuId.value);
      else payload.slug = String(slugOuId.value);
      return payload;
    }

    function aplicarPrecificacao(resultado) {
      precificacao.subtotal = resultado.subtotal;
      precificacao.desconto = resultado.desconto;
      precificacao.taxa = resultado.taxa;
      precificacao.repassa = resultado.repassa_taxa_comprador;
      precificacao.total = resultado.total;
    }

    async function atualizarPrecificacao() {
      if (!loteAtivo.value) return;
      precificacao.carregando = true;
      erroCupom.value = '';
      try {
        aplicarPrecificacao(await previsualizarPedido(montarPayloadPrecificacao(true)));
      } catch (e) {
        const mensagem = e.response?.data?.erro || '';
        if (form.cupom && /cupom/i.test(mensagem)) {
          erroCupom.value = mensagem;
          try {
            aplicarPrecificacao(await previsualizarPedido(montarPayloadPrecificacao(false)));
          } catch {
            /* mantém o último total conhecido em caso de falha na nova tentativa */
          }
        }
      } finally {
        precificacao.carregando = false;
      }
    }

    function agendarAtualizacaoPrecificacao() {
      clearTimeout(timerPrecificacao);
      timerPrecificacao = setTimeout(atualizarPrecificacao, 350);
    }

    function atualizarTotal() {
      if (loteAtivo.value && form.quantidade > loteAtivo.value.restam) {
        form.quantidade = Math.max(1, loteAtivo.value.restam);
      }
    }

    watch(() => form.quantidade, atualizarTotal);
    watch(() => [form.quantidade, form.cupom], agendarAtualizacaoPrecificacao);

    onMounted(async () => {
      try {
        evento.value = await obterEvento(slugOuId.value, previewToken.value);
        if (evento.value.slug && /^\d+$/.test(String(slugOuId.value))) {
          router.replace({ path: `/${evento.value.slug}`, query: route.query });
        }
        atualizarOg({
          title: `${evento.value.nome} · Ingressos Beco`,
          description: `${formatarData(evento.value.data)} · ${evento.value.local}`,
          url: `${LOJA_URL}/${evento.value.slug || slugOuId.value}`,
        });
        schemaEvento(evento.value, loteAtivo.value);
        await atualizarPrecificacao();
      } catch (e) {
        erro.value = mensagemAmigavel(e) || 'Evento indisponível.';
      } finally {
        carregando.value = false;
      }
    });

    async function comprar() {
      enviando.value = true;
      erro.value = '';
      try {
        const payload = {
          lote_id: loteAtivo.value.id,
          quantidade: form.quantidade,
          nome: form.nome,
          email: form.email,
          lgpd: form.lgpd,
        };
        if (form.cupom) payload.cupom = form.cupom;
        if (/^\d+$/.test(String(slugOuId.value))) payload.evento_id = Number(slugOuId.value);
        else payload.slug = String(slugOuId.value);

        const res = await criarPedido(payload);
        if (res.init_point) window.location.href = res.init_point;
        else router.push(`/pedido/${res.codigo}`);
      } catch (e) {
        erro.value = mensagemAmigavel(e);
      } finally {
        enviando.value = false;
      }
    }

    async function listaEspera() {
      try {
        await inscreverListaEspera(evento.value.id, emailEspera.value);
        erro.value = '';
        emailEspera.value = '';
        alert('E-mail registrado na lista de espera.');
      } catch (e) {
        erro.value = mensagemAmigavel(e) || 'Erro ao inscrever.';
      }
    }

    return {
      evento,
      carregando,
      erro,
      enviando,
      form,
      loteAtivo,
      loteEsgotado,
      preview,
      emailEspera,
      precificacao,
      erroCupom,
      formatarData,
      formatarMoeda,
      comprar,
      listaEspera,
      atualizarTotal,
    };
  },
};
</script>

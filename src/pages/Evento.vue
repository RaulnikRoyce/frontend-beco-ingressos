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
            <span :class="loteAtivo.restam > 0 ? 'badge-disponivel' : 'badge-esgotado'">
              {{ loteAtivo.restam > 0 ? `Restam ${loteAtivo.restam}` : 'Esgotado' }}
            </span>
          </p>
        </div>
      </div>

      <form v-if="loteAtivo.restam > 0" class="form-grid mt-8 border-t border-zinc-800 pt-8" @submit.prevent="comprar">
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Quantidade (máx. 4)</span>
          <input v-model.number="form.quantidade" type="number" min="1" :max="Math.min(4, loteAtivo.restam)" class="field" required @input="atualizarTotal" />
        </label>

        <div class="total-box flex items-center justify-between text-sm">
          <span class="text-zinc-400">Total estimado</span>
          <span class="text-xl font-bold font-mono">R$ {{ formatarMoeda(totalEstimado) }}</span>
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
        </label>
        <label class="flex items-start gap-2 text-sm text-zinc-400">
          <input v-model="form.lgpd" type="checkbox" class="mt-1" />
          Li e aceito o uso dos meus dados para emissão do ingresso e contato sobre este evento.
        </label>
        <p v-if="erro" class="erro-box" role="alert">{{ erro }}</p>
        <button type="submit" class="btn-primary" :disabled="enviando || !form.lgpd">
          {{ enviando ? 'Redirecionando…' : `Pagar R$ ${formatarMoeda(totalEstimado)}` }}
        </button>
      </form>

      <div v-else class="mt-6">
        <p class="text-sm text-zinc-400">Esgotado neste lote. Deixe seu e-mail para aviso.</p>
        <form class="form-grid form-grid-2 mt-4" @submit.prevent="listaEspera">
          <input v-model="emailEspera" type="email" class="field" placeholder="Seu e-mail" required />
          <button type="submit" class="btn-ghost w-full">Avisar quando abrir</button>
        </form>
      </div>
    </div>

    <p v-else class="card text-sm text-zinc-500">Em breve. Nenhum lote ativo.</p>
  </div>
  <p v-else-if="carregando" class="text-sm text-zinc-500">Carregando evento…</p>
  <p v-else class="erro-box">{{ erro || 'Evento não encontrado.' }}</p>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obterEvento, criarPedido, inscreverListaEspera } from '../services/loja';
import { formatarData, formatarMoeda, atualizarOg, schemaEvento } from '../lib/formatar';
import { LOJA_URL } from '../config';

function mensagemAmigavel(erroBruto, status) {
  if (!erroBruto) return 'Não foi possível iniciar a compra. Tente de novo em instantes.';
  const texto = String(erroBruto);
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
      const vigente = lotes.find((l) => l.vigente || l.status_venda === 'vigente');
      if (vigente) return vigente;
      return lotes.sort((a, b) => a.ordem - b.ordem || a.id - b.id)[0] || null;
    });

    const totalEstimado = computed(() => {
      const preco = Number(loteAtivo.value?.preco) || 0;
      const qtd = Number(form.quantidade) || 1;
      return Math.round(preco * qtd * 100) / 100;
    });

    function atualizarTotal() {
      if (loteAtivo.value && form.quantidade > loteAtivo.value.restam) {
        form.quantidade = Math.max(1, loteAtivo.value.restam);
      }
    }

    watch(() => form.quantidade, atualizarTotal);

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
      } catch (e) {
        erro.value = mensagemAmigavel(e.response?.data?.erro, e.response?.status) || 'Evento indisponível.';
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
          lgpd: true,
        };
        if (form.cupom) payload.cupom = form.cupom;
        if (/^\d+$/.test(String(slugOuId.value))) payload.evento_id = Number(slugOuId.value);
        else payload.slug = String(slugOuId.value);

        const res = await criarPedido(payload);
        if (res.init_point) window.location.href = res.init_point;
        else router.push(`/pedido/${res.codigo}`);
      } catch (e) {
        erro.value = mensagemAmigavel(e.response?.data?.erro, e.response?.status);
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
        erro.value = mensagemAmigavel(e.response?.data?.erro) || 'Erro ao inscrever.';
      }
    }

    return {
      evento,
      carregando,
      erro,
      enviando,
      form,
      loteAtivo,
      preview,
      emailEspera,
      totalEstimado,
      formatarData,
      formatarMoeda,
      comprar,
      listaEspera,
      atualizarTotal,
    };
  },
};
</script>

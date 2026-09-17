<template>
  <div v-if="ingresso" class="card checkout-card text-center">
    <p class="text-xs font-bold uppercase tracking-wider text-red-400">Ingresso válido</p>
    <h1 class="mt-2 text-2xl font-bold">{{ ingresso.evento_nome }}</h1>
    <p class="mt-1 text-sm text-zinc-400">{{ formatarData(ingresso.evento_data) }} · {{ ingresso.evento_local }}</p>
    <p class="mt-2 text-sm">{{ ingresso.lote_nome }} · {{ ingresso.comprador_nome }}</p>

    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="QR Code do ingresso"
      class="ingresso-qr mx-auto"
      width="200"
      height="200"
    />
    <p class="mt-4 font-mono text-xs text-zinc-500 break-all">{{ ingresso.codigo }}</p>
    <p v-if="ingresso.status === 'usado'" class="mt-4 text-amber-300">Já utilizado na porta</p>
  </div>
  <p v-else-if="carregando" class="text-sm text-zinc-500">Carregando ingresso…</p>
  <p v-else class="text-sm text-red-400">{{ erro }}</p>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import QRCode from 'qrcode';
import { obterIngresso } from '../services/loja';
import { formatarData, atualizarOg } from '../lib/formatar';
import { LOJA_URL } from '../config';

export default {
  setup() {
    const route = useRoute();
    const ingresso = ref(null);
    const carregando = ref(true);
    const erro = ref('');
    const qrDataUrl = ref('');

    async function gerarQr(url) {
      try {
        qrDataUrl.value = await QRCode.toDataURL(url, { width: 200, margin: 1 });
      } catch {
        qrDataUrl.value = '';
      }
    }

    onMounted(async () => {
      try {
        ingresso.value = await obterIngresso(route.params.codigo);
        atualizarOg({
          title: `Ingresso · ${ingresso.value.evento_nome}`,
          description: ingresso.value.lote_nome
        });
        await gerarQr(`${LOJA_URL}/ingresso/${ingresso.value.codigo}`);
      } catch (e) {
        erro.value = e.response?.status === 400
          ? 'Pagamento ainda não confirmado. Atualize esta página em alguns instantes.'
          : 'Ingresso não encontrado.';
      } finally {
        carregando.value = false;
      }
    });

    return { ingresso, carregando, erro, qrDataUrl, formatarData };
  }
};
</script>

<template>
  <div v-if="dados" class="card text-center">
    <h1 class="text-2xl font-bold">{{ dados.evento.nome }}</h1>
    <p class="mt-2 text-sm text-zinc-400">Pedido {{ dados.pedido.codigo_publico }}</p>

    <p v-if="dados.pedido.status === 'pendente'" class="mt-6 text-amber-300">
      Aguardando pagamento. Se você já pagou, atualize esta página em instantes.
    </p>
    <p v-else-if="dados.pedido.status === 'pago'" class="mt-6 text-emerald-400 font-semibold">
      Pagamento confirmado
    </p>
    <p v-else-if="dados.pedido.status === 'expirado'" class="mt-6 text-red-400">
      Reserva expirada. Volte ao evento e tente de novo.
    </p>
    <p v-else class="mt-6 text-zinc-400">Status: {{ dados.pedido.status }}</p>

    <p class="mt-4 font-mono text-lg">R$ {{ formatarMoeda(dados.pedido.total) }}</p>

    <ul v-if="dados.ingressos?.length" class="mt-8 space-y-3 text-left">
      <li v-for="ing in dados.ingressos" :key="ing.codigo">
        <RouterLink :to="`/ingresso/${ing.codigo}`" class="btn-ghost w-full">
          Ver ingresso · {{ ing.codigo.slice(0, 8) }}…
        </RouterLink>
      </li>
    </ul>

    <RouterLink
      v-if="dados.evento.slug"
      :to="`/${dados.evento.slug}`"
      class="btn-ghost mt-8 inline-flex"
    >
      Voltar ao evento
    </RouterLink>
  </div>
  <p v-else-if="carregando" class="text-sm text-zinc-500">Carregando pedido…</p>
  <p v-else class="text-sm text-red-400">{{ erro }}</p>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { obterPedido } from '../services/loja';
import { formatarMoeda } from '../lib/formatar';

export default {
  setup() {
    const route = useRoute();
    const dados = ref(null);
    const carregando = ref(true);
    const erro = ref('');

    onMounted(async () => {
      try {
        dados.value = await obterPedido(route.params.codigo);
      } catch {
        erro.value = 'Pedido não encontrado.';
      } finally {
        carregando.value = false;
      }
    });

    return { dados, carregando, erro, formatarMoeda };
  }
};
</script>

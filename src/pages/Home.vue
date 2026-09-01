<template>
  <div>
    <h1 class="text-3xl font-extrabold">Próximos shows</h1>
    <p class="mt-2 text-sm text-zinc-400">Escolha a noite e garanta seu ingresso.</p>

    <p v-if="carregando" class="mt-8 text-sm text-zinc-500">Carregando…</p>
    <p v-else-if="erro" class="mt-8 text-sm text-red-400">{{ erro }}</p>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="evento in eventos" :key="evento.id">
        <RouterLink
          :to="evento.slug ? `/${evento.slug}` : `/e/${evento.id}`"
          class="card block no-underline text-inherit transition hover:border-red-500/40"
        >
          <p class="text-xs font-bold uppercase tracking-wider text-red-400">{{ formatarData(evento.data) }}</p>
          <h2 class="mt-1 text-xl font-bold">{{ evento.nome }}</h2>
          <p class="mt-1 text-sm text-zinc-400">{{ evento.local }}</p>
          <p v-if="evento.lotes?.length" class="mt-3 font-mono text-sm text-emerald-400">
            a partir de R$ {{ formatarMoeda(menorPreco(evento.lotes)) }}
          </p>
        </RouterLink>
      </li>
      <li v-if="!eventos.length" class="card text-center text-sm text-zinc-500">Nenhum show com venda aberta no momento.</li>
    </ul>

    <p class="mt-8 text-center">
      <RouterLink to="/recuperar" class="text-sm text-zinc-400 no-underline hover:text-red-400">Recuperar ingresso</RouterLink>
    </p>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { listarEventos } from '../services/loja';
import { formatarData, formatarMoeda, atualizarOg } from '../lib/formatar';

export default {
  setup() {
    const eventos = ref([]);
    const carregando = ref(true);
    const erro = ref('');

    onMounted(async () => {
      atualizarOg({
        title: 'Ingressos Beco Underground',
        description: 'Próximos shows com venda aberta'
      });
      try {
        eventos.value = await listarEventos();
      } catch {
        erro.value = 'Não foi possível carregar os eventos.';
      } finally {
        carregando.value = false;
      }
    });

    const menorPreco = (lotes) => Math.min(...lotes.map((l) => Number(l.preco)));

    return { eventos, carregando, erro, formatarData, formatarMoeda, menorPreco };
  }
};
</script>

<template>
  <div>
    <header class="page-lead">
      <p class="page-kicker">Agenda</p>
      <h1 class="page-title">Próximos shows</h1>
      <p class="page-sub">Escolha a noite e garanta seu ingresso.</p>
    </header>

    <p v-if="carregando" class="text-sm text-zinc-500">Carregando…</p>
    <p v-else-if="erro" class="erro-box">{{ erro }}</p>

    <ul v-else class="space-y-4">
      <li v-for="evento in eventos" :key="evento.id">
        <RouterLink
          :to="evento.slug ? `/${evento.slug}` : `/e/${evento.id}`"
          class="card show-card"
        >
          <p class="show-card-date">{{ formatarData(evento.data) }}</p>
          <h2 class="show-card-title">{{ evento.nome }}</h2>
          <p class="show-card-local">{{ evento.local }}</p>
          <p v-if="evento.lotes?.length" class="show-card-price">
            a partir de R$ {{ formatarMoeda(menorPreco(evento.lotes)) }}
          </p>
        </RouterLink>
      </li>
      <li v-if="!eventos.length" class="card estado-vazio">
        Nenhum show com venda aberta no momento.
      </li>
    </ul>

    <p class="mt-10 text-center">
      <RouterLink to="/recuperar" class="link-muted">Recuperar ingresso</RouterLink>
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

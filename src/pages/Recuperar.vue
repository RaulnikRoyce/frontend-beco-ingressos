<template>
  <div class="card checkout-card max-w-md mx-auto">
    <header class="page-lead page-lead-compact">
      <p class="page-kicker">Conta</p>
      <h1 class="page-title page-title-sm">Recuperar ingresso</h1>
      <p class="page-sub">Use o e-mail da compra e o código do pedido.</p>
    </header>

    <form class="form-grid mt-6" @submit.prevent="enviar">
      <input v-model="email" type="email" class="field" placeholder="E-mail" required />
      <input v-model="codigo" class="field" placeholder="Código do pedido" required />
      <p v-if="erro" class="text-sm text-red-400">{{ erro }}</p>
      <button type="submit" class="btn-primary" :disabled="enviando">Buscar</button>
    </form>

    <ul v-if="ingressos.length" class="mt-8 space-y-2">
      <li v-for="ing in ingressos" :key="ing.codigo">
        <RouterLink :to="`/ingresso/${ing.codigo}`" class="btn-ghost w-full">
          Abrir ingresso {{ ing.codigo.slice(0, 8) }}…
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref } from 'vue';
import { recuperarIngresso } from '../services/loja';

export default {
  setup() {
    const email = ref('');
    const codigo = ref('');
    const ingressos = ref([]);
    const erro = ref('');
    const enviando = ref(false);

    async function enviar() {
      enviando.value = true;
      erro.value = '';
      ingressos.value = [];
      try {
        const res = await recuperarIngresso(email.value, codigo.value);
        ingressos.value = res.ingressos || [];
        if (!ingressos.value.length) erro.value = 'Nenhum ingresso neste pedido.';
      } catch (e) {
        erro.value = e.response?.data?.erro || 'Não encontramos este pedido.';
      } finally {
        enviando.value = false;
      }
    }

    return { email, codigo, ingressos, erro, enviando, enviar };
  }
};
</script>

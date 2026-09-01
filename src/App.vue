<template>
  <div class="min-h-screen bg-[var(--beco-bg)] text-[var(--beco-fg)]">
    <header class="border-b border-zinc-800 bg-zinc-950/90">
      <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <RouterLink to="/" class="flex items-center gap-3 no-underline text-inherit">
          <img src="/logo-beco.png" alt="Beco Underground" class="h-10 w-10 rounded-full object-cover" width="40" height="40" />
          <span class="text-sm font-extrabold uppercase tracking-widest text-red-500">Ingressos Beco</span>
        </RouterLink>
      </div>
    </header>
    <main class="mx-auto w-full max-w-3xl px-4 py-8">
      <RouterView />
    </main>
    <footer class="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
      Beco Underground Produções · Compra segura via Mercado Pago
    </footer>
  </div>
</template>

<script>
export default { name: 'AppRoot' };
</script>

<template>
  <div class="shell">
    <div class="shell-dots" aria-hidden="true"></div>
    <div class="shell-orbs" aria-hidden="true"></div>

    <header class="shell-header">
      <div class="shell-header-inner">
        <RouterLink to="/" class="shell-brand">
          <img src="/logo-beco.png" alt="Beco Underground Produções" width="42" height="42" />
          <span class="marca-beco">Ingressos <span>Beco</span></span>
        </RouterLink>
        <span class="shell-tag">Underground</span>
      </div>
    </header>

    <main class="shell-main">
      <RouterView />
    </main>

    <footer class="shell-footer">
      <p>Beco Underground Produções</p>
      <p>Compra segura via Mercado Pago</p>
    </footer>
  </div>
</template>

<script>
export default { name: 'AppRoot' };
</script>

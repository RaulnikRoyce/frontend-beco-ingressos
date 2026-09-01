import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'home', component: () => import('../pages/Home.vue') },
  { path: '/e/:id', name: 'evento-id', component: () => import('../pages/Evento.vue') },
  { path: '/pedido/:codigo', name: 'pedido', component: () => import('../pages/Pedido.vue') },
  { path: '/ingresso/:codigo', name: 'ingresso', component: () => import('../pages/Ingresso.vue') },
  { path: '/recuperar', name: 'recuperar', component: () => import('../pages/Recuperar.vue') },
  { path: '/:slug', name: 'evento', component: () => import('../pages/Evento.vue') },
];

export default createRouter({ history: createWebHistory(), routes });

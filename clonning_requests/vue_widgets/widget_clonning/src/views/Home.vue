<template>
  <div class="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-700">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-[#002D72] mb-3">
        Novo Redirecionamento
      </h1>
      <p class="text-slate-500 text-lg">
        Escolha o método de autenticação para começar
      </p>
    </header>

    <div
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
    >
      <div
        v-for="auth in authMethods"
        :key="auth.title"
        class="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-start transition-all hover:shadow-md"
      >
        <div
          :class="`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${auth.iconBg}`"
        >
          <component :is="auth.icon" class="w-6 h-6" :class="auth.iconColor" />
        </div>

        <h3 class="text-xl font-bold text-slate-800 mb-3">{{ auth.title }}</h3>
        <p class="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
          {{ auth.description }}
        </p>

        <router-link class="w-full" :to="auth.to"
          ><button
            class="w-full py-3 bg-[#003087] hover:bg-[#00266b] text-white font-bold rounded-full transition-colors"
          >
            Selecionar
          </button></router-link
        >
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-[#002D72]">Recents</h2>
        <a href="#" class="text-sm font-bold text-[#002D72] hover:underline"
          >Ver todos</a
        >
      </div>

      <div
        class="bg-[#EEF2FF]/50 rounded-[24px] overflow-hidden border border-blue-50"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-blue-50"
            >
              <th class="px-8 py-5">Endpoint</th>
              <th class="px-8 py-5 text-center">Método</th>
              <th class="px-8 py-5 text-center">Status</th>
              <th class="px-8 py-5 text-right">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-blue-50">
            <tr
              v-for="item in recentCalls"
              :key="item.endpoint"
              class="hover:bg-blue-50/30 transition-colors"
            >
              <td class="px-8 py-5 flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102 1.101"
                  />
                </svg>
                <span class="font-medium text-slate-600">{{
                  item.endpoint
                }}</span>
              </td>
              <td class="px-8 py-5 text-center">
                <span
                  class="px-3 py-1 rounded-md bg-white border border-blue-100 text-[10px] font-black text-blue-800 uppercase"
                >
                  {{ item.method }}
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex justify-center">
                  <span
                    :class="`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${item.statusClass}`"
                  >
                    <span class="w-2 h-2 rounded-full bg-current"></span>
                    {{ item.status }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-5 text-right text-sm text-slate-400">
                {{ item.date }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <button
      class="fixed bottom-8 right-8 w-16 h-16 bg-[#003087] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
    >
      <svg
        class="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { Lock, User } from "lucide-vue-next";

// Mock de dados baseado na imagem
const authMethods = [
  {
    title: "Basic Auth",
    description:
      "Autenticação simples baseada em usuário e senha codificados em Base64.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: Lock,
    to: "/basic",
  },
  {
    title: "OAuth",
    description:
      "Fluxo seguro com tokens de acesso para APIs modernas e integrações third-party.",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    icon: User,
    to: "/oauth",
  },
  // {
  //   title: "API Key",
  //   description:
  //     "Chave estática enviada via header ou query parameter para acesso rápido.",
  //   iconBg: "bg-orange-50",
  //   iconColor: "text-orange-600",
  //   icon: "CodeIcon",
  // },
  // {
  //   title: "Bearer Token",
  //   description:
  //     "Uso de JWT ou tokens opacos no header de autorização para segurança granular.",
  //   iconBg: "bg-indigo-50",
  //   iconColor: "text-indigo-600",
  //   icon: "ShieldCheckIcon",
  // },
];

const recentCalls = [
  {
    endpoint: "api.v1/auth/user-profile",
    method: "Bearer",
    status: "Success",
    statusClass: "bg-green-100 text-green-600",
    date: "2 min ago",
  },
  {
    endpoint: "cloud-storage/v2/upload",
    method: "OAuth 2.0",
    status: "Success",
    statusClass: "bg-green-100 text-green-600",
    date: "15 min ago",
  },
  {
    endpoint: "internal-service/admin/log",
    method: "Basic",
    status: "Failed",
    statusClass: "bg-red-100 text-red-600",
    date: "42 min ago",
  },
  {
    endpoint: "stripe-api.v3/checkout/session",
    method: "API Key",
    status: "Pending",
    statusClass: "bg-orange-100 text-orange-600",
    date: "1 hour ago",
  },
];
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { formatEuro, toEuros } from '@/lib/cart'
import { catalog, findOrder } from '@/lib/store'

const route = useRoute()
const order = computed(() => findOrder(String(route.params.ref)))
const label = (pid: string, vid: string) => {
  const p = catalog.value.find((x) => x.id === pid)
  return `${p?.name ?? pid} · ${p?.variants.find((v) => v.id === vid)?.label ?? vid}`
}
</script>

<template>
  <div class="wrap">
    <div v-if="!order" style="padding-block: 3rem"><p>Η παραγγελία δεν βρέθηκε σε αυτόν τον browser.</p><RouterLink class="btn" to="/">Αρχική</RouterLink></div>
    <article v-else class="receipt" aria-labelledby="r">
      <h1 id="r">Ευχαριστούμε, {{ order.customer.name.split(' ')[0] }}.</h1>
      <p class="ref">{{ order.ref }}</p>
      <p>Θα στείλουμε επιβεβαίωση στο {{ order.customer.email }}. Αυτό είναι demo: δεν έγινε πραγματική παραγγελία.</p>
      <table class="t"><tbody>
        <tr v-for="l in order.lines" :key="l.productId + l.variantId"><td>{{ l.qty }} × {{ label(l.productId, l.variantId) }}</td></tr>
        <tr><td>Αποστολή: {{ order.totals.shipping ? formatEuro(toEuros(order.totals.shipping)) : 'Δωρεάν' }}<span v-if="order.totals.discount"> · Έκπτωση −{{ formatEuro(toEuros(order.totals.discount)) }}</span></td></tr>
        <tr><td style="font: 500 1.7rem 'Vollkorn Variable', serif">Σύνολο {{ formatEuro(toEuros(order.totals.total)) }}</td></tr>
      </tbody></table>
      <p style="margin-top: 1.5rem"><RouterLink class="btn" to="/">Συνεχίστε τις αγορές</RouterLink></p>
    </article>
  </div>
</template>

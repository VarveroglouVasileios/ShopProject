<script setup lang="ts">
import { ref } from 'vue'
import { NEXT_STATUS, formatEuro, toEuros, type OrderStatus } from '@/lib/cart'
import { catalog, orders, resetDemo, setStatus } from '@/lib/store'

const authed = ref(false)
const pw = ref('')
const wrong = ref(false)
const login = () => { authed.value = pw.value === 'demo'; wrong.value = !authed.value }
const labels: Record<OrderStatus, string> = { new: 'Νέα', packed: 'Συσκευάστηκε', shipped: 'Στάλθηκε', cancelled: 'Ακυρώθηκε' }
const action: Record<OrderStatus, string> = { new: 'Συσκευάστηκε', packed: 'Στάλθηκε', shipped: '', cancelled: '' }
const advance = (id: string, s: OrderStatus) => { const n = NEXT_STATUS[s]; if (n) setStatus(id, n) }
const reset = () => { if (confirm('Να επανέλθουν οι αρχικές παραγγελίες και το απόθεμα;')) resetDemo() }
const when = (t: number) => new Date(t).toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' })
</script>

<template>
  <div class="wrap">
    <h1 class="page-h">Παραγγελίες</h1>
    <form v-if="!authed" class="receipt" style="margin-left: 0" @submit.prevent="login">
      <div class="f"><label for="pw">Κωδικός πρόσβασης</label><input id="pw" v-model="pw" type="password" /><p class="note">Κωδικός demo: demo</p><p v-if="wrong" class="err" role="alert">Ο κωδικός δεν είναι σωστός.</p></div>
      <button class="btn">Είσοδος</button>
    </form>
    <div v-else style="padding-bottom: 5rem; display: grid; gap: 3rem">
      <div class="tbl">
        <table class="t">
          <thead><tr><th>Κωδικός</th><th>Πελάτης</th><th>Ημερομηνία</th><th>Σύνολο</th><th>Κατάσταση</th><th>Ενέργειες</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td><b>{{ o.ref }}</b></td><td>{{ o.customer.name }}<br /><small>{{ o.customer.city }}</small></td><td>{{ when(o.createdAt) }}</td>
              <td>{{ formatEuro(toEuros(o.totals.total)) }}</td>
              <td><span class="pill" :class="o.status">{{ labels[o.status] }}</span></td>
              <td style="display: flex; gap: .4rem; flex-wrap: wrap">
                <button v-if="action[o.status]" class="mini" @click="advance(o.id, o.status)">{{ action[o.status] }}</button>
                <button v-if="o.status !== 'shipped' && o.status !== 'cancelled'" class="mini alt" @click="setStatus(o.id, 'cancelled')">Ακύρωση</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <section>
        <h2 style="font-size: 2.4rem; margin-bottom: 1rem">Απόθεμα</h2>
        <div class="stock">
          <p v-for="p in catalog" :key="p.id" style="margin: 0"><b>{{ p.name }}</b>:
            <span v-for="v in p.variants" :key="v.id" style="margin-right: 1rem" :class="{ warn: v.stock <= 6 }">{{ v.label }} → {{ v.stock }}</span></p>
        </div>
      </section>
      <p><button class="btn btn-line" @click="reset">Επαναφορά demo</button> <button class="btn btn-line" @click="authed = false">Έξοδος</button></p>
    </div>
  </div>
</template>

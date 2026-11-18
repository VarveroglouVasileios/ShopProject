<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { applyDiscount, computeTotals, FREE_SHIPPING_FROM, formatEuro, toEuros, type CheckoutErrors, type Region } from '@/lib/cart'
import { img } from '@/lib/storage'
import { cart, catalog, checkout, setQty } from '@/lib/store'

const router = useRouter()
const region = ref<Region>('mainland')
const code = ref('')
const appliedCode = ref('')
const giftWrap = ref(false)
const form = reactive({ name: '', email: '', phone: '', address: '', city: '', postcode: '' })
const errors = ref<CheckoutErrors>({})
const stockMsg = ref('')
const codeMsg = ref('')

const rows = computed(() => cart.value.map((l) => {
  const p = catalog.value.find((x) => x.id === l.productId)!
  const v = p.variants.find((x) => x.id === l.variantId)!
  return { l, p, v }
}))
const totals = computed(() => computeTotals({ lines: cart.value, products: catalog.value, region: region.value, code: appliedCode.value, giftWrap: giftWrap.value }))
const pct = computed(() => (region.value === 'abroad' ? 0 : Math.min(100, ((totals.value.subtotal - totals.value.discount) / (FREE_SHIPPING_FROM * 100)) * 100)))

function applyCode() {
  const r = applyDiscount(code.value, totals.value.subtotal)
  if (r.ok) { appliedCode.value = r.code; codeMsg.value = `Ο κωδικός ${r.code} εφαρμόστηκε.` }
  else { appliedCode.value = ''; codeMsg.value = r.reason === 'minimum' ? 'Ο κωδικός ισχύει από 20 € και πάνω.' : r.reason === 'unknown' ? 'Ο κωδικός δεν είναι έγκυρος.' : 'Γράψτε έναν κωδικό.' }
}
function submit() {
  stockMsg.value = ''
  const res = checkout({ ...form }, { region: region.value, code: appliedCode.value, giftWrap: giftWrap.value })
  errors.value = res.errors
  if (res.stock) stockMsg.value = 'Κάποιο προϊόν δεν έχει πια αρκετά τεμάχια. Ελέγξτε τις ποσότητες.'
  if (res.order) router.push({ name: 'order', params: { ref: res.order.ref } })
}
</script>

<template>
  <div class="wrap">
    <h1 class="page-h">Το καλάθι</h1>
    <div v-if="!cart.length" style="padding-block: 2rem 5rem"><p>Το καλάθι είναι άδειο.</p><RouterLink class="btn" to="/">Δείτε τα προϊόντα</RouterLink></div>
    <form v-else class="co" novalidate @submit.prevent="submit">
      <div>
        <section aria-label="Προϊόντα στο καλάθι">
          <div v-for="r in rows" :key="r.l.productId + r.l.variantId" class="line">
            <img :src="img(r.p.image)" alt="" />
            <div><h3>{{ r.p.name }}</h3><p class="note" style="margin: .2rem 0">{{ r.v.label }} · {{ formatEuro(r.v.price) }}</p>
              <p v-if="r.l.qty > r.v.stock" class="err">Διαθέσιμα μόνο {{ r.v.stock }}.</p></div>
            <div style="text-align: right">
              <div class="stepper">
                <button type="button" :aria-label="`Λιγότερα: ${r.p.name}`" @click="setQty(r.l.productId, r.l.variantId, r.l.qty - 1)">−</button>
                <b>{{ r.l.qty }}</b>
                <button type="button" :aria-label="`Περισσότερα: ${r.p.name}`" :disabled="r.l.qty >= r.v.stock" @click="setQty(r.l.productId, r.l.variantId, r.l.qty + 1)">+</button>
              </div>
              <p style="margin: .3rem 0 0; font: 500 1.3rem 'Vollkorn Variable', serif">{{ formatEuro(r.v.price * r.l.qty) }}</p>
            </div>
          </div>
        </section>

        <fieldset class="fs" style="margin-top: 2.5rem">
          <legend>Στοιχεία αποστολής</legend>
          <div class="f"><label for="region">Περιοχή αποστολής</label>
            <select id="region" v-model="region"><option value="mainland">Ηπειρωτική Ελλάδα</option><option value="islands">Νησιά</option><option value="abroad">Εξωτερικό</option></select></div>
          <div class="f-row">
            <div class="f"><label for="name">Ονοματεπώνυμο</label><input id="name" v-model="form.name" autocomplete="name" :aria-invalid="!!errors.name" /><p v-if="errors.name" class="err" role="alert">{{ errors.name }}</p></div>
            <div class="f"><label for="email">Email</label><input id="email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" /><p v-if="errors.email" class="err" role="alert">{{ errors.email }}</p></div>
          </div>
          <div class="f-row">
            <div class="f"><label for="phone">Τηλέφωνο</label><input id="phone" v-model="form.phone" inputmode="tel" autocomplete="tel" :aria-invalid="!!errors.phone" /><p v-if="errors.phone" class="err" role="alert">{{ errors.phone }}</p></div>
            <div class="f"><label for="address">Διεύθυνση</label><input id="address" v-model="form.address" autocomplete="street-address" :aria-invalid="!!errors.address" /><p v-if="errors.address" class="err" role="alert">{{ errors.address }}</p></div>
          </div>
          <div class="f-row">
            <div class="f"><label for="city">Πόλη</label><input id="city" v-model="form.city" autocomplete="address-level2" :aria-invalid="!!errors.city" /><p v-if="errors.city" class="err" role="alert">{{ errors.city }}</p></div>
            <div class="f"><label for="pc">Ταχυδρομικός κώδικας</label><input id="pc" v-model="form.postcode" inputmode="numeric" autocomplete="postal-code" :aria-invalid="!!errors.postcode" /><p v-if="errors.postcode" class="err" role="alert">{{ errors.postcode }}</p></div>
          </div>
          <label class="chk"><input v-model="giftWrap" type="checkbox" /> Συσκευασία δώρου με κάρτα (+2,50 €)</label>
        </fieldset>
      </div>

      <aside class="sum" aria-label="Σύνοψη παραγγελίας">
        <h2>Σύνοψη</h2>
        <template v-if="region !== 'abroad'">
          <p v-if="totals.toFreeShipping > 0" class="note" style="margin: 0">Προσθέστε {{ formatEuro(toEuros(totals.toFreeShipping)) }} για δωρεάν αποστολή.</p>
          <p v-else class="ok" style="margin: 0">Έχετε δωρεάν αποστολή.</p>
          <div class="progress" aria-hidden="true"><i :style="{ width: pct + '%' }"></i></div>
        </template>
        <div class="f" style="display: flex; gap: .5rem; align-items: end">
          <div style="flex: 1"><label for="code">Κωδικός έκπτωσης</label><input id="code" v-model="code" autocomplete="off" /></div>
          <button type="button" class="mini alt" @click="applyCode">Εφαρμογή</button>
        </div>
        <p class="note" role="status" style="margin-top: -.5rem">{{ codeMsg || 'Δοκιμάστε: THASOS10' }}</p>
        <dl>
          <div><dt>Προϊόντα</dt><dd style="margin: 0">{{ formatEuro(toEuros(totals.subtotal)) }}</dd></div>
          <div v-if="totals.discount"><dt>Έκπτωση</dt><dd style="margin: 0">−{{ formatEuro(toEuros(totals.discount)) }}</dd></div>
          <div><dt>Αποστολή</dt><dd style="margin: 0">{{ totals.shipping ? formatEuro(toEuros(totals.shipping)) : 'Δωρεάν' }}</dd></div>
          <div v-if="totals.gift"><dt>Συσκευασία δώρου</dt><dd style="margin: 0">{{ formatEuro(toEuros(totals.gift)) }}</dd></div>
          <div class="grand"><dt>Σύνολο</dt><dd style="margin: 0">{{ formatEuro(toEuros(totals.total)) }}</dd></div>
        </dl>
        <p class="note">Οι τιμές περιλαμβάνουν ΦΠΑ. Πληρωμή με αντικαταβολή σε αυτό το demo.</p>
        <button class="btn" style="width: 100%">Ολοκλήρωση παραγγελίας</button>
        <p v-if="stockMsg" class="err" role="alert">{{ stockMsg }}</p>
      </aside>
    </form>
  </div>
</template>

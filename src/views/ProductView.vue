<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { formatEuro } from '@/lib/cart'
import { img } from '@/lib/storage'
import { add, cart, catalog } from '@/lib/store'

const route = useRoute()
const product = computed(() => catalog.value.find((p) => p.id === route.params.id))
const chosen = ref('')
watch(product, (p) => { chosen.value = p?.variants.find((v) => v.stock > 0)?.id ?? p?.variants[0]?.id ?? '' }, { immediate: true })
const variant = computed(() => product.value?.variants.find((v) => v.id === chosen.value))
const inCart = computed(() => cart.value.find((l) => l.productId === product.value?.id && l.variantId === chosen.value)?.qty ?? 0)
const msg = ref('')
function addToCart() {
  if (!product.value || !variant.value) return
  msg.value = add(product.value.id, variant.value.id) ? `Προστέθηκε στο καλάθι: ${variant.value.label}.` : 'Δεν υπάρχουν άλλα διαθέσιμα τεμάχια.'
}
</script>

<template>
  <div class="wrap">
    <div v-if="!product" style="padding-block: 3rem"><p>Το προϊόν δεν βρέθηκε.</p><RouterLink class="btn" to="/">Πίσω στο ράφι</RouterLink></div>
    <template v-else>
      <p class="crumb"><RouterLink to="/">Το ράφι</RouterLink> / {{ product.kind }}</p>
      <div class="pd">
        <img :src="img(product.image)" :alt="product.name" width="1024" height="768" />
        <div>
          <p class="eyebrow">{{ product.kind }}</p>
          <h1>{{ product.name }}</h1>
          <p style="font: italic 500 1.5rem 'Vollkorn', serif; margin: 1rem 0 0">{{ product.tagline }}</p>
          <p style="font-size: 1.15rem">{{ product.description }}</p>
          <div role="radiogroup" aria-label="Μέγεθος" class="opts">
            <button v-for="v in product.variants" :key="v.id" role="radio" :aria-checked="chosen === v.id" class="opt" :disabled="v.stock === 0" @click="chosen = v.id">{{ v.label }}</button>
          </div>
          <p v-if="variant" class="big-price">{{ formatEuro(variant.price) }}</p>
          <p v-if="variant" :class="variant.stock === 0 ? 'warn' : variant.stock <= 6 ? 'warn' : 'ok'">
            {{ variant.stock === 0 ? 'Εξαντλήθηκε' : variant.stock <= 6 ? `Μόνο ${variant.stock} διαθέσιμα` : 'Διαθέσιμο, αποστολή σε 1–2 εργάσιμες' }}
          </p>
          <p style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center">
            <button class="btn" :disabled="!variant || variant.stock === 0 || inCart >= variant.stock" @click="addToCart">Στο καλάθι</button>
            <RouterLink v-if="inCart" class="btn btn-line" to="/cart">Καλάθι ({{ inCart }})</RouterLink>
          </p>
          <p role="status" class="note">{{ msg }}</p>
          <p class="note">Δωρεάν αποστολή για αγορές άνω των 40 €. Επιστροφή εντός 14 ημερών.</p>
        </div>
      </div>
    </template>
  </div>
</template>

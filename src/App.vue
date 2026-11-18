<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { cartCount } from '@/lib/store'

const focusMain = () => document.getElementById('main')?.focus()
</script>

<template>
  <a class="skip" href="#main" @click.prevent="focusMain">Μετάβαση στο περιεχόμενο</a>
  <header class="bar">
    <nav aria-label="Κύρια πλοήγηση" class="bar-nav">
      <RouterLink to="/" class="hide-sm">Προϊόντα</RouterLink>
      <RouterLink to="/admin" class="hide-sm">Παραγγελίες</RouterLink>
    </nav>
    <RouterLink to="/" class="brand">Eleon</RouterLink>
    <div class="bar-right"><span class="demo-tag">DEMO CONCEPT</span><RouterLink to="/cart" class="cart-btn">Καλάθι ({{ cartCount }})</RouterLink></div>
  </header>
  <main id="main" tabindex="-1"><RouterView /></main>
  <footer class="foot">
    <p class="foot-brand">Eleon</p>
    <p>Φανταστική επιχείρηση · Οι παραγγελίες δεν είναι πραγματικές<br />Σχεδιασμός και υλοποίηση: Βασίλειος Βαρβέρογλου · Οι φωτογραφίες είναι δημιουργημένες με AI και ενδεικτικές.</p>
    <p><RouterLink to="/privacy" class="foot-link">Απόρρητο και cookies</RouterLink></p>
  </footer>
</template>

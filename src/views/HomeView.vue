<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { formatEuro } from '@/lib/cart'
import { img } from '@/lib/storage'
import { catalog } from '@/lib/store'

const from = (id: string) => Math.min(...catalog.value.find((p) => p.id === id)!.variants.map((v) => v.price))
const left = (id: string) => catalog.value.find((p) => p.id === id)!.variants.reduce((s, v) => s + v.stock, 0)
const gift = () => catalog.value.find((p) => p.id === 'set')!
</script>

<template>
  <div class="wrap">
    <div class="hero-rule"></div>
    <section class="hero" aria-labelledby="h">
      <div class="hero-copy">
        <p class="eyebrow">Από έναν ελαιώνα της Θάσου</p>
        <h1 id="h">Λάδι, <em>μέλι</em> και βουνό.</h1>
        <p class="lead">Μικρές παρτίδες από τα χωριά του νησιού. Το κάθε βαζάκι γράφει τη χρονιά και το χωράφι του.</p>
        <p style="margin-top: 2rem; display: flex; gap: 1.6rem; align-items: center; flex-wrap: wrap">
          <a class="btn" href="#shelf">Δείτε τα προϊόντα</a>
          <a href="#story" style="font-weight: 700; text-decoration: underline; text-underline-offset: 6px">Η ιστορία μας</a>
        </p>
      </div>
      <div class="hero-photo">
        <img :src="img('hero')" alt="Ελαιόλαδο, μέλι, ελιές και ρίγανη μπροστά σε αιωνόβιες ελιές" width="1024" height="576" />
        <svg class="stamp" viewBox="0 0 200 200" role="img" aria-label="Εξαιρετικό παρθένο, Θάσος, συγκομιδή">
          <circle cx="100" cy="100" r="98" fill="#2b3318" />
          <defs><path id="ring" d="M100 100m-72 0a72 72 0 1 1 144 0a72 72 0 1 1-144 0" /></defs>
          <text font-family="Source Sans 3 Variable" font-weight="700" font-size="15" letter-spacing="3.4" fill="#e7e2cf"><textPath href="#ring">ΕΞΑΙΡΕΤΙΚΟ ΠΑΡΘΕΝΟ ✦ ΘΑΣΟΣ ✦ ΣΥΓΚΟΜΙΔΗ ✦</textPath></text>
          <circle cx="100" cy="100" r="30" fill="#c8962b" />
        </svg>
      </div>
    </section>

    <section id="shelf" aria-labelledby="sh">
      <div class="shelf-head"><h2 id="sh">Το ράφι</h2><p class="note" style="max-width: 20rem">Διαλέξτε προϊόν για να δείτε μεγέθη και διαθεσιμότητα. Οι τιμές είναι ενδεικτικές.</p></div>
      <RouterLink v-for="(p, i) in catalog" :key="p.id" :to="`/product/${p.id}`" class="prod">
        <img class="pic" :src="img(p.image)" alt="" />
        <span class="no">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ p.name }}<span v-if="left(p.id) === 0" class="badge">Εξαντλήθηκε</span><span v-else-if="left(p.id) <= 6" class="badge" style="color: var(--terra)">Τελευταία τεμάχια</span></h3>
          <p class="sub">{{ p.tagline }}</p>
        </div>
        <span class="note hide-sm" style="min-width: 0">{{ p.variants.map((v) => v.label).join(' · ') }}</span>
        <b class="price">από {{ formatEuro(from(p.id)) }}</b>
        <span class="btn btn-line hide-sm">Δείτε</span>
      </RouterLink>
    </section>
  </div>

  <section id="story" class="story">
    <div class="wrap story-grid">
      <img :src="img('olives')" alt="Ελιές Θάσου σε ξύλινο μπολ" loading="lazy" />
      <div>
        <h2>Ένας ελαιώνας, <em>τρεις γενιές.</em></h2>
        <p style="margin-top: 1.6rem"><span class="cap" aria-hidden="true">Ο</span><span class="sr-only" style="position: absolute; left: -999px">Ο</span>ι ελιές μαζεύονται με το χέρι και πιέζονται την ίδια μέρα. Το μέλι βγαίνει από μελίσσια που κινούνται με τις εποχές. Δεν υπάρχουν ενδιάμεσοι, γι’ αυτό ξέρουμε το όνομα κάθε χωραφιού [ΙΣΤΟΡΙΑ ΠΑΡΑΓΩΓΟΥ].</p>
        <div class="facts"><div><b>3</b><span>γενιές</span></div><div><b>1</b><span>ελαιώνας</span></div><div><b>0</b><span>ενδιάμεσοι</span></div></div>
      </div>
    </div>
  </section>

  <div class="wrap">
    <section class="gift" aria-labelledby="g">
      <div>
        <p class="eyebrow">Δώρα</p>
        <h2 id="g">Το κουτί <em>δώρου.</em></h2>
        <p style="font-size: 1.2rem; max-width: 28rem; margin-top: 1.4rem">{{ gift().description }}</p>
        <p style="display: flex; gap: 1.4rem; align-items: center; flex-wrap: wrap; margin-top: 1.6rem"><b style="font: 500 2.8rem 'Vollkorn Variable', serif">{{ formatEuro(gift().variants[0].price) }}</b><RouterLink class="btn" to="/product/set">Στείλτε το</RouterLink></p>
      </div>
      <img :src="img('gift')" alt="Ξύλινο κουτί δώρου με ελαιόλαδο, μέλι, ελιές και βότανα" loading="lazy" />
    </section>
  </div>
</template>

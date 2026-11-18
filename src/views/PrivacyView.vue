<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

// Static legal text. The HTML in each section is written here, never built from user input.
const content = {
  "el": {
    "title": "Απόρρητο και cookies",
    "updated": "Τελευταία ενημέρωση: Νοέμβριος 2026",
    "sections": [
      [
        "Τι είναι αυτό το site",
        "Το Eleon Pantry είναι <strong>demo concept</strong>: μια φανταστική επιχείρηση που έφτιαξε ο Βασίλειος Βαρβέρογλου για να δείχνει πώς μπορεί να δουλέψει μια ιστοσελίδα. Δεν είναι πραγματική επιχείρηση και δεν δέχεται πραγματικές παραγγελίες."
      ],
      [
        "Cookies",
        "Δεν χρησιμοποιούμε cookies. Δεν υπάρχουν εργαλεία στατιστικών, διαφήμισης ή παρακολούθησης, και γι’ αυτό δεν εμφανίζουμε banner συγκατάθεσης."
      ],
      [
        "Τι αποθηκεύεται στη συσκευή σας",
        "Για να δουλεύει το demo, ο browser σας αποθηκεύει τοπικά (localStorage): το καλάθι σας, οι παραγγελίες που κάνετε στο demo (όνομα, email, τηλέφωνο, διεύθυνση), το απόθεμα του demo και ένας μετρητής κωδικών. Τα κλειδιά είναι: <code>eleon.cart.v1</code>, <code>eleon.orders.v1</code>, <code>eleon.stock.v1</code>, <code>eleon.seq.v1</code>. Τα δεδομένα μένουν στη συσκευή σας, δεν στέλνονται σε κανέναν server και δεν τα βλέπουμε. Με το «Επαναφορά demo» στη σελίδα «Παραγγελίες» επανέρχονται τα αρχικά δοκιμαστικά δεδομένα, και μπορείτε να τα σβήσετε πλήρως από τα δεδομένα ιστότοπου του browser σας."
      ],
      [
        "Τι πληκτρολογείτε στις φόρμες",
        "Οι φόρμες είναι δοκιμαστικές. Μη γράφετε πραγματικά προσωπικά στοιχεία: χρησιμοποιήστε φανταστικά. Ό,τι γράψετε μένει μόνο στον browser σας."
      ],
      [
        "Γραμματοσειρές και εικόνες",
        "Οι γραμματοσειρές και οι εικόνες φιλοξενούνται στο ίδιο το site, χωρίς κλήσεις σε τρίτους (π.χ. Google Fonts). Οι φωτογραφίες είναι δημιουργημένες με AI και ενδεικτικές."
      ],
      [
        "Φιλοξενία",
        "Το site φιλοξενείται στο GitHub Pages. Ο πάροχος μπορεί να καταγράφει τεχνικά δεδομένα σύνδεσης, όπως η διεύθυνση IP, σύμφωνα με τη <a href=\"https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement\" rel=\"noopener\" class=\"underline underline-offset-4\">δική του πολιτική απορρήτου</a>."
      ],
      [
        "Επικοινωνία",
        "Για ερωτήσεις: <a href=\"https://varveroglouvasileios.github.io/\" rel=\"noopener\" class=\"underline underline-offset-4\">https://varveroglouvasileios.github.io/</a>."
      ]
    ],
    "note": "Αυτό είναι κείμενο demo. Σε πραγματικό site, η πολιτική απορρήτου προσαρμόζεται στα δεδομένα που συλλέγονται (φόρμες, στατιστικά, πληρωμές) και πρέπει να ελέγχεται από νομικό ή DPO.",
    "back": "Πίσω στην αρχική"
  }
} as const
const c = computed(() => content.el)
</script>

<template>
  <div class="wrap">
    <article class="mx-auto max-w-2xl py-12" aria-labelledby="privacy-title">
      <h1 id="privacy-title" class="text-4xl">{{ c.title }}</h1>
      <p class="mt-2 text-sm opacity-70">{{ c.updated }}</p>
      <section v-for="s in c.sections" :key="s[0]" class="mt-8">
        <h2 class="text-2xl">{{ s[0] }}</h2>
        <p class="mt-2 text-lg leading-relaxed" v-html="s[1]"></p>
      </section>
      <p class="mt-10 rounded border border-current/30 p-4 text-base opacity-80">{{ c.note }}</p>
      <p class="mt-8"><RouterLink to="/" class="underline underline-offset-4">{{ c.back }}</RouterLink></p>
    </article>
  </div>
</template>

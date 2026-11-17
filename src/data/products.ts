import type { Product } from '@/lib/cart'

// Prices and stock are illustrative.
export const products: Product[] = [
  {
    id: 'ladi', name: 'Εξαιρετικό παρθένο ελαιόλαδο', kind: 'Ελαιόλαδο', image: 'oil',
    tagline: 'Κορωνέικη, πρώτη κρύα έκθλιψη',
    description: 'Από ελιές που μαζεύονται με το χέρι και πιέζονται την ίδια μέρα. Φρουτώδες, με ελαφρύ πικάντικο τέλος. Ιδανικό για σαλάτες και για το τελικό ράντισμα στο πιάτο.',
    variants: [
      { id: '500', label: '500 ml', price: 12.5, stock: 40 },
      { id: '1l', label: '1 L', price: 21, stock: 24 },
      { id: '5l', label: '5 L τενεκές', price: 89, stock: 3 },
    ],
  },
  {
    id: 'meli', name: 'Θυμαρίσιο μέλι', kind: 'Μέλι', image: 'honey',
    tagline: 'Από μελίσσια των πλαγιών',
    description: 'Πυκνό, ανοιχτόχρωμο και αρωματικό. Τα μελίσσια μετακινούνται με τις εποχές, ώστε το θυμάρι να ανθίζει δίπλα τους.',
    variants: [
      { id: '250', label: '250 g', price: 6.5, stock: 35 },
      { id: '450', label: '450 g', price: 9.8, stock: 20 },
    ],
  },
  {
    id: 'elies', name: 'Ελιές Θάσου', kind: 'Ελιές', image: 'olives',
    tagline: 'Ξηρές και τσακιστές, σε άλμη',
    description: 'Η ξηρόβραστη ελιά του νησιού, ζαρωμένη και γλυκιά, και η τσακιστή με λίγο ρίγανη. Σε βάζο που κρατά τη γεύση.',
    variants: [
      { id: '350', label: '350 g', price: 6.2, stock: 28 },
      { id: '700', label: '700 g', price: 10.5, stock: 0 },
    ],
  },
  {
    id: 'votana', name: 'Ρίγανη και τσάι του βουνού', kind: 'Βότανα', image: 'herbs',
    tagline: 'Μαζεμένα στις πλαγιές, στεγνωμένα στη σκιά',
    description: 'Ρίγανη ανθός για το ψητό και τσάι του βουνού για τα κρύα βράδια. Σε ξύλινο κουτάκι και χάρτινο σακουλάκι.',
    variants: [
      { id: 'riganh', label: 'Ρίγανη 40 g', price: 3.5, stock: 50 },
      { id: 'tsai', label: 'Τσάι του βουνού 30 g', price: 4.5, stock: 6 },
    ],
  },
  {
    id: 'set', name: 'Σετ «Γεύσεις της Θάσου»', kind: 'Δώρα', image: 'gift',
    tagline: 'Ξύλινο κουτί με χειρόγραφη κάρτα',
    description: 'Ελαιόλαδο 500 ml, μέλι 250 g, ελιές 350 g και ρίγανη, σε ξύλινο κουτί με προσωπική κάρτα. Έτοιμο να δοθεί.',
    variants: [{ id: 'set', label: 'Κουτί δώρου', price: 34, stock: 12 }],
  },
]

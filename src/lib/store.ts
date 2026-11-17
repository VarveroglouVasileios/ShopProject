import { computed, ref, watch } from 'vue'
import { load, save } from './storage'
import {
  addItem, computeTotals, makeRef, setLineQty, stockProblems, validateCheckout,
  type CartLine, type CheckoutErrors, type CheckoutInput, type OrderStatus, type Region, type Totals,
} from './cart'
import { products } from '@/data/products'

export interface Order {
  id: string
  ref: string
  customer: CheckoutInput
  region: Region
  lines: CartLine[]
  totals: Totals
  code: string
  giftWrap: boolean
  status: OrderStatus
  createdAt: number
}

const KEYS = { cart: 'eleon.cart.v1', orders: 'eleon.orders.v1', stock: 'eleon.stock.v1', seq: 'eleon.seq.v1' }

type StockMap = Record<string, number> // "productId/variantId" -> units
const baseStock = (): StockMap => Object.fromEntries(products.flatMap((p) => p.variants.map((v) => [`${p.id}/${v.id}`, v.stock])))
const stockState = ref<StockMap>({ ...baseStock(), ...load<StockMap>(KEYS.stock, {}) })

/** Products with their live stock (the catalogue minus what orders took). */
export const catalog = computed(() =>
  products.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, stock: stockState.value[`${p.id}/${v.id}`] ?? v.stock })) })),
)

const sample = (n: number, name: string, lines: CartLine[], status: OrderStatus, region: Region = 'mainland'): Order => {
  const totals = computeTotals({ lines, products, region })
  return {
    id: `seed-${n}`, ref: makeRef(n), customer: { name, email: 'demo@example.com', phone: '6900000000', address: 'Ενδεικτική 1', city: 'Καβάλα', postcode: '65404' },
    region, lines, totals, code: '', giftWrap: false, status, createdAt: Date.now() - n * 5_400_000,
  }
}
const seed = (): Order[] => [
  sample(1, 'Νίκη Αντωνίου', [{ productId: 'ladi', variantId: '1l', qty: 2 }, { productId: 'meli', variantId: '450', qty: 1 }], 'shipped'),
  sample(2, 'Peter Hansen', [{ productId: 'set', variantId: 'set', qty: 1 }], 'packed', 'abroad'),
  sample(3, 'Κώστας Λαμπρίδης', [{ productId: 'votana', variantId: 'riganh', qty: 3 }], 'new', 'islands'),
]

export const orders = ref<Order[]>(load<Order[]>(KEYS.orders, []))
if (!orders.value.length) orders.value = seed()
export const cart = ref<CartLine[]>(load<CartLine[]>(KEYS.cart, []))
let seq = load<number>(KEYS.seq, 3)

watch(orders, (v) => save(KEYS.orders, v), { deep: true })
watch(cart, (v) => save(KEYS.cart, v), { deep: true })
watch(stockState, (v) => save(KEYS.stock, v), { deep: true })

export const cartCount = computed(() => cart.value.reduce((s, l) => s + l.qty, 0))
export const add = (productId: string, variantId: string): boolean => {
  const next = addItem(cart.value, catalog.value, productId, variantId)
  const changed = next !== cart.value
  cart.value = next
  return changed
}
export const setQty = (productId: string, variantId: string, qty: number): void => {
  cart.value = setLineQty(cart.value, catalog.value, productId, variantId, qty)
}

export interface CheckoutOptions { region: Region; code: string; giftWrap: boolean }

export function checkout(input: CheckoutInput, opts: CheckoutOptions): { order?: Order; errors: CheckoutErrors; stock?: boolean } {
  const errors = validateCheckout(input, opts.region)
  if (Object.keys(errors).length) return { errors }
  // Stock may have changed since the cart was filled.
  if (stockProblems(cart.value, catalog.value).length) return { errors: {}, stock: true }
  const totals = computeTotals({ lines: cart.value, products: catalog.value, region: opts.region, code: opts.code, giftWrap: opts.giftWrap })
  seq += 1
  save(KEYS.seq, seq)
  const order: Order = {
    id: `o-${Date.now()}`, ref: makeRef(seq), customer: { ...input }, region: opts.region, lines: [...cart.value], totals,
    code: opts.code.trim().toUpperCase(), giftWrap: opts.giftWrap, status: 'new', createdAt: Date.now(),
  }
  for (const l of cart.value) {
    const key = `${l.productId}/${l.variantId}`
    stockState.value = { ...stockState.value, [key]: Math.max(0, (stockState.value[key] ?? 0) - l.qty) }
  }
  orders.value = [order, ...orders.value]
  cart.value = []
  return { order, errors }
}

export const findOrder = (ref: string): Order | undefined => orders.value.find((o) => o.ref === ref)
export function setStatus(id: string, status: OrderStatus): void {
  const o = orders.value.find((x) => x.id === id)
  if (o && status === 'cancelled' && o.status !== 'cancelled') {
    // Cancelling puts the units back on the shelf.
    for (const l of o.lines) {
      const key = `${l.productId}/${l.variantId}`
      stockState.value = { ...stockState.value, [key]: (stockState.value[key] ?? 0) + l.qty }
    }
  }
  orders.value = orders.value.map((x) => (x.id === id ? { ...x, status } : x))
}
export function resetDemo(): void {
  seq = 3
  save(KEYS.seq, seq)
  stockState.value = baseStock()
  orders.value = seed()
  cart.value = []
}

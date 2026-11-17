/** Pure shop logic: cart, stock, discount, shipping and checkout validation. Money is handled in cents. */

export interface Variant {
  id: string
  label: string
  price: number // euros
  stock: number
}
export interface Product {
  id: string
  name: string
  kind: string
  tagline: string
  description: string
  image: string
  variants: Variant[]
}
export interface CartLine {
  productId: string
  variantId: string
  qty: number
}
export type Region = 'mainland' | 'islands' | 'abroad'
export type OrderStatus = 'new' | 'packed' | 'shipped' | 'cancelled'

export const FREE_SHIPPING_FROM = 40 // euros, mainland and islands only
export const SHIPPING: Record<Region, number> = { mainland: 3.9, islands: 5.5, abroad: 12 }
export const GIFT_WRAP = 2.5
export const MAX_PER_LINE = 12
export const DISCOUNT_CODES: Record<string, { percent: number; minSubtotal: number }> = {
  THASOS10: { percent: 10, minSubtotal: 20 },
}

const cents = (euros: number): number => Math.round(euros * 100)
export const toEuros = (c: number): number => c / 100
export const formatEuro = (euros: number): string => `${euros.toFixed(2).replace('.', ',')} €`

export function findVariant(products: Product[], productId: string, variantId: string): Variant | undefined {
  return products.find((p) => p.id === productId)?.variants.find((v) => v.id === variantId)
}

/** Add one unit, never above stock or the per-line maximum. Returns the same array if nothing changed. */
export function addItem(lines: CartLine[], products: Product[], productId: string, variantId: string): CartLine[] {
  const variant = findVariant(products, productId, variantId)
  if (!variant) return lines
  const current = lines.find((l) => l.productId === productId && l.variantId === variantId)
  const qty = (current?.qty ?? 0) + 1
  if (qty > Math.min(variant.stock, MAX_PER_LINE)) return lines
  return current
    ? lines.map((l) => (l === current ? { ...l, qty } : l))
    : [...lines, { productId, variantId, qty }]
}

export function setLineQty(lines: CartLine[], products: Product[], productId: string, variantId: string, qty: number): CartLine[] {
  const variant = findVariant(products, productId, variantId)
  const rest = lines.filter((l) => !(l.productId === productId && l.variantId === variantId))
  if (!variant || qty <= 0) return rest
  const safe = Math.min(qty, variant.stock, MAX_PER_LINE)
  return lines.some((l) => l.productId === productId && l.variantId === variantId)
    ? lines.map((l) => (l.productId === productId && l.variantId === variantId ? { ...l, qty: safe } : l))
    : [...rest, { productId, variantId, qty: safe }]
}

export function subtotalCents(lines: CartLine[], products: Product[]): number {
  return lines.reduce((sum, l) => {
    const v = findVariant(products, l.productId, l.variantId)
    return sum + (v ? cents(v.price) * l.qty : 0)
  }, 0)
}

export type DiscountResult = { ok: true; cents: number; code: string } | { ok: false; reason: 'unknown' | 'minimum' | 'empty' }

export function applyDiscount(code: string, subtotal: number): DiscountResult {
  const key = code.trim().toUpperCase()
  if (!key) return { ok: false, reason: 'empty' }
  const rule = DISCOUNT_CODES[key]
  if (!rule) return { ok: false, reason: 'unknown' }
  if (subtotal < cents(rule.minSubtotal)) return { ok: false, reason: 'minimum' }
  return { ok: true, code: key, cents: Math.round((subtotal * rule.percent) / 100) }
}

export function shippingCents(region: Region, afterDiscount: number): number {
  if (afterDiscount === 0) return 0
  if (region !== 'abroad' && afterDiscount >= cents(FREE_SHIPPING_FROM)) return 0
  return cents(SHIPPING[region])
}

export interface Totals {
  subtotal: number
  discount: number
  shipping: number
  gift: number
  total: number
  toFreeShipping: number // cents still missing for free shipping, 0 when not applicable
}

export function computeTotals(opts: { lines: CartLine[]; products: Product[]; region: Region; code?: string; giftWrap?: boolean }): Totals {
  const subtotal = subtotalCents(opts.lines, opts.products)
  const d = opts.code ? applyDiscount(opts.code, subtotal) : null
  const discount = d && d.ok ? d.cents : 0
  const after = subtotal - discount
  const shipping = shippingCents(opts.region, after)
  const gift = opts.giftWrap && subtotal > 0 ? cents(GIFT_WRAP) : 0
  const toFreeShipping = opts.region === 'abroad' || after === 0 ? 0 : Math.max(0, cents(FREE_SHIPPING_FROM) - after)
  return { subtotal, discount, shipping, gift, total: after + shipping + gift, toFreeShipping }
}

export interface CheckoutInput {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
}
export type CheckoutErrors = Partial<Record<keyof CheckoutInput, string>>

export const normalizePhone = (raw: string): string => raw.replace(/[\s\-().]/g, '').replace(/^(\+30|0030)/, '')

export function validateCheckout(input: CheckoutInput, region: Region): CheckoutErrors {
  const e: CheckoutErrors = {}
  if (input.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = 'Συμπληρώστε όνομα και επώνυμο.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) e.email = 'Συμπληρώστε έγκυρο email.'
  const phone = normalizePhone(input.phone)
  if (region === 'abroad' ? !/^\+?\d{7,15}$/.test(input.phone.replace(/[\s\-().]/g, '')) : !/^(69|2\d)\d{8}$/.test(phone))
    e.phone = 'Συμπληρώστε έγκυρο τηλέφωνο επικοινωνίας.'
  if (input.address.trim().length < 5) e.address = 'Συμπληρώστε διεύθυνση και αριθμό.'
  if (input.city.trim().length < 2) e.city = 'Συμπληρώστε πόλη.'
  if (region !== 'abroad' && !/^\d{5}$/.test(input.postcode.trim())) e.postcode = 'Ο ταχυδρομικός κώδικας έχει 5 ψηφία.'
  if (region === 'abroad' && input.postcode.trim().length < 3) e.postcode = 'Συμπληρώστε ταχυδρομικό κώδικα.'
  return e
}

/** Lines whose quantity no longer fits the stock (for example after another order). */
export function stockProblems(lines: CartLine[], products: Product[]): CartLine[] {
  return lines.filter((l) => {
    const v = findVariant(products, l.productId, l.variantId)
    return !v || l.qty > v.stock
  })
}

export const makeRef = (seq: number): string => `EL-${String(seq).padStart(4, '0')}`
export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = { new: 'packed', packed: 'shipped', shipped: null, cancelled: null }

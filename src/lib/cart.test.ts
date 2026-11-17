import { describe, expect, it } from 'vitest'
import {
  addItem, applyDiscount, computeTotals, formatEuro, setLineQty, shippingCents, stockProblems, subtotalCents,
  validateCheckout, MAX_PER_LINE, type CartLine, type Product,
} from './cart'

const products: Product[] = [
  { id: 'oil', name: 'Λάδι', kind: 'Ελαιόλαδο', tagline: '', description: '', image: 'oil', variants: [
    { id: '500', label: '500 ml', price: 12.5, stock: 30 }, { id: '1l', label: '1 L', price: 21, stock: 2 } ] },
  { id: 'honey', name: 'Μέλι', kind: 'Μέλι', tagline: '', description: '', image: 'honey', variants: [{ id: '250', label: '250 g', price: 6.5, stock: 5 }] },
]
const good = { name: 'Μαρία Παπά', email: 'maria@example.com', phone: '6912345678', address: 'Ακτή 12', city: 'Καβάλα', postcode: '65404' }

describe('cart lines', () => {
  it('adds units and merges identical variants', () => {
    let l: CartLine[] = []
    l = addItem(l, products, 'oil', '500')
    l = addItem(l, products, 'oil', '500')
    l = addItem(l, products, 'oil', '1l')
    expect(l).toEqual([{ productId: 'oil', variantId: '500', qty: 2 }, { productId: 'oil', variantId: '1l', qty: 1 }])
  })

  it('stops at stock and ignores unknown items', () => {
    let l: CartLine[] = []
    for (let i = 0; i < 5; i++) l = addItem(l, products, 'oil', '1l')
    expect(l[0].qty).toBe(2)
    expect(addItem(l, products, 'ghost', 'x')).toBe(l)
  })

  it('caps quantity per line and removes at zero', () => {
    const l = setLineQty([], products, 'oil', '500', 99)
    expect(l[0].qty).toBe(MAX_PER_LINE)
    expect(setLineQty(l, products, 'oil', '500', 0)).toEqual([])
    expect(setLineQty([], products, 'oil', '1l', 9)[0].qty).toBe(2)
  })

  it('flags lines that exceed the stock', () => {
    expect(stockProblems([{ productId: 'honey', variantId: '250', qty: 6 }], products)).toHaveLength(1)
    expect(stockProblems([{ productId: 'honey', variantId: '250', qty: 5 }], products)).toHaveLength(0)
  })
})

describe('money', () => {
  it('sums in cents', () => {
    expect(subtotalCents([{ productId: 'oil', variantId: '500', qty: 3 }, { productId: 'honey', variantId: '250', qty: 1 }], products)).toBe(4400)
    expect(formatEuro(4.4)).toBe('4,40 €')
  })

  it('applies a code only above its minimum and rejects unknown codes', () => {
    expect(applyDiscount('thasos10', 5000)).toEqual({ ok: true, code: 'THASOS10', cents: 500 })
    expect(applyDiscount('THASOS10', 1500)).toEqual({ ok: false, reason: 'minimum' })
    expect(applyDiscount('NOPE', 5000)).toEqual({ ok: false, reason: 'unknown' })
    expect(applyDiscount('  ', 5000)).toEqual({ ok: false, reason: 'empty' })
  })

  it('charges shipping by region and waives it from 40 € except abroad', () => {
    expect(shippingCents('mainland', 3999)).toBe(390)
    expect(shippingCents('mainland', 4000)).toBe(0)
    expect(shippingCents('islands', 2000)).toBe(550)
    expect(shippingCents('abroad', 9000)).toBe(1200)
    expect(shippingCents('mainland', 0)).toBe(0)
  })

  it('computes totals with discount, free shipping threshold and gift wrap', () => {
    const lines: CartLine[] = [{ productId: 'oil', variantId: '500', qty: 4 }] // 50,00 €
    const t = computeTotals({ lines, products, region: 'mainland', code: 'THASOS10', giftWrap: true })
    expect(t).toMatchObject({ subtotal: 5000, discount: 500, shipping: 0, gift: 250, total: 4750, toFreeShipping: 0 })
    const small = computeTotals({ lines: [{ productId: 'honey', variantId: '250', qty: 1 }], products, region: 'mainland' })
    expect(small.shipping).toBe(390)
    expect(small.toFreeShipping).toBe(3350)
  })

  it('does not waive shipping when a discount drops the cart below 40 €', () => {
    const t = computeTotals({ lines: [{ productId: 'oil', variantId: '500', qty: 3 }, { productId: 'honey', variantId: '250', qty: 1 }], products, region: 'mainland', code: 'THASOS10' })
    // 44,00 − 4,40 = 39,60 → shipping applies
    expect(t.shipping).toBe(390)
  })
})

describe('checkout validation', () => {
  it('accepts a complete Greek address', () => {
    expect(validateCheckout(good, 'mainland')).toEqual({})
  })

  it('reports each broken field', () => {
    const e = validateCheckout({ name: 'Μαρία', email: 'x', phone: '12', address: 'Α', city: '', postcode: '654' }, 'mainland')
    expect(Object.keys(e).sort()).toEqual(['address', 'city', 'email', 'name', 'phone', 'postcode'])
  })

  it('accepts landlines in Greece and international numbers abroad', () => {
    expect(validateCheckout({ ...good, phone: '2510 123456' }, 'mainland').phone).toBeUndefined()
    expect(validateCheckout({ ...good, phone: '+49 151 2345678', postcode: '10115' }, 'abroad')).toEqual({})
  })
})

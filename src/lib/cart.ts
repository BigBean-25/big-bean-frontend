const CART_KEY = 'bigbean_merch_cart'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string | null
  quantity: number
  slug: string
}

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch { return [] }
}

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

const notifyCartUpdate = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('bigbean-cart-updated'))
}

export const addToCart = (item: Omit<CartItem, 'quantity'>, qty = 1): CartItem[] => {
  const cart = getCart()
  const idx = cart.findIndex(c => c.id === item.id)
  if (idx >= 0) {
    cart[idx].quantity += qty
  } else {
    cart.push({ ...item, quantity: qty })
  }
  saveCart(cart)
  notifyCartUpdate()
  return cart
}

export const updateQty = (id: number, qty: number): CartItem[] => {
  let cart = getCart()
  if (qty <= 0) {
    cart = cart.filter(c => c.id !== id)
  } else {
    cart = cart.map(c => c.id === id ? { ...c, quantity: qty } : c)
  }
  saveCart(cart)
  notifyCartUpdate()
  return cart
}

export const removeFromCart = (id: number): CartItem[] => {
  const cart = getCart().filter(c => c.id !== id)
  saveCart(cart)
  notifyCartUpdate()
  return cart
}

export const clearCart = () => {
  localStorage.removeItem(CART_KEY)
  notifyCartUpdate()
}

export const cartCount = (): number =>
  getCart().reduce((s, c) => s + c.quantity, 0)

export const cartSubtotal = (): number =>
  getCart().reduce((s, c) => s + c.price * c.quantity, 0)

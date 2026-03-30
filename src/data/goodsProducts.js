export const PRODUCTS = [
  {
    id: 'hoodie',
    name: '후드티',
    price: 70000,
    category: '의류',
    description: 'SolFort 시그니처 로고 후드',
    longDesc: 'SolFort 브랜드 아이덴티티를 반영한 프리미엄 후드티',
    composition: '후드티 1개',
    material: '코튼 혼방 / 오버핏',
    delivery: '주문 후 순차 발송',
    colors: ['블랙', '네이비', '그레이'],
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
    badge: 'BEST',
    badgeColor: '#8b5cf6',
    membership: '기본 회원',
    membershipColor: '#3b82f6',
    featured: true,
  },
  {
    id: 'windbreaker',
    name: '바람막이',
    price: 90000,
    category: '의류',
    description: '프리미엄 경량 윈드브레이커',
    longDesc: '실용성과 브랜딩을 동시에 갖춘 프리미엄 바람막이',
    composition: '바람막이 1개',
    material: '경량 기능성 원단',
    delivery: '배송 준비 후 순차 발송',
    colors: ['블랙', '카키'],
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    badge: 'NEW',
    badgeColor: '#00d4aa',
    membership: '프리미엄 회원',
    membershipColor: '#8b5cf6',
    featured: true,
  },
  {
    id: 'notebook',
    name: '노트',
    price: 10000,
    category: '문구',
    description: '브랜드 로고 하드커버 노트',
    longDesc: '브랜드 기록용 프리미엄 노트',
    composition: '노트 1권',
    material: '하드커버 / 내지 포함',
    delivery: '주문 후 2~3일 내 발송',
    colors: null,
    options: null,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    badge: null,
    badgeColor: null,
    membership: null,
    membershipColor: null,
    featured: true,
  },
  {
    id: 'pen',
    name: '펜',
    price: 5000,
    category: '문구',
    description: 'SolFort 시그니처 볼펜',
    longDesc: 'SolFort 로고가 각인된 기본 볼펜',
    composition: '펜 1개',
    material: '블랙 잉크',
    delivery: '주문 후 순차 발송',
    colors: null,
    options: null,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600',
    badge: null,
    badgeColor: null,
    membership: null,
    membershipColor: null,
    featured: false,
  },
];

export const CATEGORIES = ['전체', '의류', '문구', '액세서리', '한정판'];

export const SOF_PRICE_KRW = 850; // 1 SOF = 850 KRW (mock)

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

// Cart helpers using localStorage
export function getCart() {
  try { return JSON.parse(localStorage.getItem('sf_goods_cart') || '[]'); } catch { return []; }
}
export function saveCart(cart) {
  localStorage.setItem('sf_goods_cart', JSON.stringify(cart));
}
export function addToCart(product, qty, option, color) {
  const cart = getCart();
  const key = `${product.id}-${option}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty += qty;
  else cart.push({ key, id: product.id, name: product.name, price: product.price, image: product.image, qty, option, color });
  saveCart(cart);
  window.dispatchEvent(new Event('cart_updated'));
}
export function removeFromCart(key) {
  saveCart(getCart().filter(i => i.key !== key));
  window.dispatchEvent(new Event('cart_updated'));
}
export function updateCartQty(key, qty) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (item) { item.qty = qty; if (qty <= 0) return removeFromCart(key); }
  saveCart(cart);
  window.dispatchEvent(new Event('cart_updated'));
}
export function clearCart() {
  localStorage.removeItem('sf_goods_cart');
  window.dispatchEvent(new Event('cart_updated'));
}
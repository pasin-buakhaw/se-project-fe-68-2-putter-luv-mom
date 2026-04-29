// Full sample data used by E2E tests to mock API responses.
// All IDs are stable so test assertions can reference them by name.

export const MOCK_RESTAURANTS = [
  {
    _id: 'r1', name: 'Sushi Zen',
    address: '10 Sukhumvit Rd', province: 'Bangkok', district: 'Wattana',
    tel: '021111111', opentime: '11:00', closetime: '22:00',
    averageRating: '4.8', reviewCount: 45, category: 'Japanese',
    lat: 13.7400, lng: 100.5700,
  },
  {
    _id: 'r2', name: 'Thai Garden',
    address: '5 Nimman Rd', province: 'Chiang Mai', district: 'Mueang',
    tel: '052222222', opentime: '10:00', closetime: '21:00',
    averageRating: '4.5', reviewCount: 30, category: 'Thai',
    lat: 18.7900, lng: 98.9900,
  },
  {
    _id: 'r3', name: 'Pizza House',
    address: '22 Silom Rd', province: 'Bangkok', district: 'Bang Rak',
    tel: '023333333', opentime: '12:00', closetime: '23:00',
    averageRating: '4.2', reviewCount: 18, category: 'Italian',
    lat: 13.7200, lng: 100.5200,
  },
  {
    _id: 'r4', name: 'Noodle Palace',
    address: '8 Ratchadaphisek Rd', province: 'Bangkok', district: 'Chatuchak',
    tel: '024444444', opentime: '08:00', closetime: '20:00',
    averageRating: '3.2', reviewCount: 10, category: 'Thai',
    lat: 13.8000, lng: 100.5600,
  },
  {
    _id: 'r5', name: 'Burger Bros',
    address: '15 Ekkamai Rd', province: 'Bangkok', district: 'Watthana',
    tel: '025555555', opentime: '11:00', closetime: '22:00',
    averageRating: '3.8', reviewCount: 22, category: 'American',
    lat: 13.7150, lng: 100.5800,
  },
  {
    _id: 'r6', name: 'Green Curry House',
    address: '3 Charoen Krung Rd', province: 'Bangkok', district: 'Bang Rak',
    tel: '026666666', opentime: '09:00', closetime: '21:00',
    averageRating: '4.6', reviewCount: 52, category: 'Thai',
    lat: 13.7270, lng: 100.5130,
  },
]

export const MOCK_MENUS = [
  // Sushi Zen (r1)
  { _id: 'm1', name: 'Salmon Sashimi',     price: 350, category: 'Main',      venueId: 'r1', createdAt: '' },
  { _id: 'm2', name: 'Miso Soup',          price: 80,  category: 'Soup',      venueId: 'r1', createdAt: '' },
  { _id: 'm3', name: 'Edamame',            price: 60,  category: 'Appetizer', venueId: 'r1', createdAt: '' },
  { _id: 'm4', name: 'Tuna Roll',          price: 220, category: 'Main',      venueId: 'r1', createdAt: '' },
  { _id: 'm5', name: 'Matcha Ice Cream',   price: 95,  category: 'Dessert',   venueId: 'r1', createdAt: '' },

  // Thai Garden (r2)
  { _id: 'm6', name: 'Pad Thai',           price: 120, category: 'Main',      venueId: 'r2', createdAt: '' },
  { _id: 'm7', name: 'Tom Yum Kung',       price: 180, category: 'Soup',      venueId: 'r2', createdAt: '' },
  { _id: 'm8', name: 'Papaya Salad',       price: 90,  category: 'Salad',     venueId: 'r2', createdAt: '' },
  { _id: 'm9', name: 'Mango Sticky Rice',  price: 110, category: 'Dessert',   venueId: 'r2', createdAt: '' },

  // Pizza House (r3)
  { _id: 'm10', name: 'Margherita Pizza',  price: 280, category: 'Main',      venueId: 'r3', createdAt: '' },
  { _id: 'm11', name: 'Tiramisu',          price: 150, category: 'Dessert',   venueId: 'r3', createdAt: '' },
  { _id: 'm12', name: 'Caesar Salad',      price: 160, category: 'Salad',     venueId: 'r3', createdAt: '' },

  // Noodle Palace (r4)
  { _id: 'm13', name: 'Beef Ramen',        price: 200, category: 'Main',      venueId: 'r4', createdAt: '' },
  { _id: 'm14', name: 'Gyoza',             price: 120, category: 'Appetizer', venueId: 'r4', createdAt: '' },

  // Burger Bros (r5)
  { _id: 'm15', name: 'Classic Burger',    price: 250, category: 'Main',      venueId: 'r5', createdAt: '' },
  { _id: 'm16', name: 'Cheese Fries',      price: 120, category: 'Side',      venueId: 'r5', createdAt: '' },
  { _id: 'm17', name: 'Chocolate Shake',   price: 95,  category: 'Drink',     venueId: 'r5', createdAt: '' },

  // Green Curry House (r6)
  { _id: 'm18', name: 'Green Curry',       price: 160, category: 'Main',      venueId: 'r6', createdAt: '' },
  { _id: 'm19', name: 'Massaman Curry',    price: 170, category: 'Main',      venueId: 'r6', createdAt: '' },
  { _id: 'm20', name: 'Spring Rolls',      price: 80,  category: 'Appetizer', venueId: 'r6', createdAt: '' },
]

// Two confirmed preorders for testing order history
export const MOCK_PREORDERS = [
  {
    _id: 'p1',
    venueId: 'r1',
    items: [
      { menuId: 'm1', name: 'Salmon Sashimi',   price: 350, quantity: 2 },
      { menuId: 'm2', name: 'Miso Soup',         price: 80,  quantity: 1 },
    ],
    total: 780,
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    _id: 'p2',
    venueId: 'r2',
    items: [
      { menuId: 'm6', name: 'Pad Thai',          price: 120, quantity: 1 },
      { menuId: 'm7', name: 'Tom Yum Kung',       price: 180, quantity: 1 },
    ],
    total: 300,
    updatedAt: '2025-01-14T10:00:00Z',
  },
]

export function restaurantsResponse(list = MOCK_RESTAURANTS) {
  return { success: true, count: list.length, data: list }
}

export function menusResponse(venueId?: string) {
  const data = venueId ? MOCK_MENUS.filter(m => m.venueId === venueId) : MOCK_MENUS
  return { success: true, count: data.length, data }
}

export function preordersResponse(list = MOCK_PREORDERS) {
  return { success: true, count: list.length, data: list }
}

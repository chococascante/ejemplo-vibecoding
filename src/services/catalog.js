// src/services/catalog.js

export async function fetchProducts() {
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

// Catalog service - provides product data. Keep it simple and synchronous for tests.
export async function fetchProducts() {
  // In a real app this would call fetch()/axios etc. Here we return static data.
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

export default { fetchProducts };

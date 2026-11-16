/** The records of the examples of the route /data/grid-parts. Plain data, so a Server Component can give them to a Client Component. */

export type Product = {
  id: number;
  name: string;
  category: string;
  supplier: string | null;
  stock: number;
  price: number;
  active: boolean;
};

const names = [
  ["Pão de queijo", "Bakery"],
  ["Espresso coffee", "Drinks"],
  ["Orange juice", "Drinks"],
  ["Carrot cake", "Bakery"],
  ["Chicken pie", "Savory"],
] as const;
const suppliers = ["Minas Dairy", "Serra Coffee", null];

export const products: Product[] = Array.from({ length: 23 }, (_, index) => {
  const [name, category] = names[index % names.length] ?? names[0];
  return {
    id: index + 1,
    name: `${name} ${index + 1}`,
    category,
    supplier: suppliers[index % suppliers.length] ?? null,
    stock: (index * 37) % 120,
    price: 4.5 + index,
    active: index % 6 !== 4,
  };
});

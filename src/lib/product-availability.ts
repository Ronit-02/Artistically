export function isProductSold(stock: number | undefined): boolean {
  return stock !== undefined && stock <= 0;
}

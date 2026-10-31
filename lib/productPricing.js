export function getProductPrice(product) {
  const salePrice = Number(product?.sale_price ?? product?.salePrice);
  const regularPrice = Number(product?.price) || 0;
  return salePrice > 0 && salePrice < regularPrice ? salePrice : regularPrice;
}

export function getDiscountPercent(product) {
  const regularPrice = Number(product?.price) || 0;
  const currentPrice = getProductPrice(product);
  return currentPrice < regularPrice
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;
}

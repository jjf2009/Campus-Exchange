export function formatPrice(price: number): string {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "₹—";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `₹${Math.round(price)}`;
  }
}

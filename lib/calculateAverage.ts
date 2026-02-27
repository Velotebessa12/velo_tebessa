export function calculateAverage(oldPrice : number, newPrice : number) {
  if (typeof oldPrice !== "number" || typeof newPrice !== "number") {
    throw new Error("Both prices must be numbers");
  }

  return (oldPrice + newPrice) / 2;
}
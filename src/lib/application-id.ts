/**
 * Utility to generate a temporary frontend application ID.
 * This is decoupled from UI code to allow easy replacement by the backend API.
 */
export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `APC-${year}-${randomPart}`;
}

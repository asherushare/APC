export interface Booking {
  id: string;
  serviceId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  // Further details can be added later as needed
}

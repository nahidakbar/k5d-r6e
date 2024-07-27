import { Order, OrderStatus } from "./types";
import { v4 as uuidv4 } from "uuid";

export const DUMMY_ORDERS_DATA: Order[] = [
  {
    orderId: uuidv4(),
    customerId: uuidv4(),
    createdAt: new Date(),
    status: OrderStatus.PENDING,
  },
  {
    orderId: uuidv4(),
    customerId: uuidv4(),
    createdAt: new Date(),
    status: OrderStatus.DELIVERED,
  },
];

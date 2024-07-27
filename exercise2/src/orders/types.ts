import { z } from "zod";

export interface Order {
  orderId: string;
  customerId: string;
  createdAt: Date;
  status: OrderStatus;
}

export enum OrderStatus {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export const createOrderRequestSchema = z.object({
  customerId: z.string().uuid(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const orderCreatedResponseSchema = z.object({
  orderId: z.string().uuid(),
});

export type OrderCreatedResponse = z.infer<typeof orderCreatedResponseSchema>;

export const updateOrderRequestSchema = z.object({
  status: z.enum([OrderStatus.CANCELLED]),
});

export type UpdateOrderRequest = z.infer<typeof updateOrderRequestSchema>;

export const getOrderRequestSchema = z.object({
  orderId: z.string().uuid(),
});

export type GetOrderRequest = z.infer<typeof getOrderRequestSchema>;

export const getOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.date(),
});

export type GetOrderResponse = z.infer<typeof getOrderResponseSchema>;

export const orderUpdatedResponseSchema = getOrderResponseSchema;

export type OrderUpdatedResponse = z.infer<typeof orderUpdatedResponseSchema>;

export const searchOrderRequestSchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).default(10),
});

export type SearchOrderRequest = z.infer<typeof searchOrderRequestSchema>;

export const searchOrderResultSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.date(),
});

export const searchOrderResultsSchema = z.object({
  data: z.array(searchOrderResultSchema),
  total: z.number().int(),
  offset: z.number().int(),
  limit: z.number().int(),
});

export type SearchOrderResult = z.infer<typeof searchOrderResultSchema>;

export type SearchOrderResults = z.infer<typeof searchOrderResultsSchema>;

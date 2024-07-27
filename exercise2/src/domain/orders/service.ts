import { v4 as uuidv4 } from "uuid";

import { DUMMY_ORDERS_DATA } from "./dummy-data";

import {
  CreateOrderRequest,
  GetOrderResponse,
  Order,
  OrderCreatedResponse,
  OrderStatus,
  SearchOrderRequest,
  SearchOrderResult,
  SearchOrderResults,
  UpdateOrderRequest,
} from "./types";
import { BadRequestError, NotFoundError } from "../../lib/fastify";

export class DummyOrdersService {
  orders: Order[] = DUMMY_ORDERS_DATA.slice(0);

  async createOrder(
    options: CreateOrderRequest
  ): Promise<OrderCreatedResponse> {
    const orderId = uuidv4();
    this.orders.push({
      orderId,
      customerId: options.customerId,
      createdAt: new Date(),
      status: OrderStatus.PENDING,
    });
    return { orderId };
  }

  async getOrder(orderId: string): Promise<GetOrderResponse> {
    const order = this.orders.find((order) => order.orderId === orderId);
    if (!order) {
      throw new NotFoundError();
    }
    return makeOrderResponse(order);
  }

  async updateOrder(
    orderId: string,
    update: UpdateOrderRequest
  ): Promise<GetOrderResponse> {
    const orderIndex = this.orders.findIndex((order) => order.orderId === orderId);
    
    if (orderIndex === -1) {
      throw new NotFoundError();
    }
    
    const order = this.orders[orderIndex];
    
    const newOrder = { ...order };

    for (let key in update) {
      switch (key) {
        case "status": // change order status
          // can't cancel order unless it's pending
          if (order.status === "pending") {
            newOrder[key] = update[key];
          }
          break;
        default:
          throw new BadRequestError()
      }
    }

    this.orders[orderIndex] = newOrder;

    return makeOrderResponse(newOrder);
  }

  async searchOrders(search: SearchOrderRequest): Promise<SearchOrderResults> {
    const { customerId, status, offset, limit } = search;

    const results = this.orders.filter((order) => {
      if (customerId && order.customerId !== customerId) {
        return false;
      }
      if (status && order.status !== status) {
        return false;
      }
      return true;
    });

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      data: paginatedResults.map(makeOrderSearchResultResponse),
      total,
      offset,
      limit,
    };
  }
}

function makeOrderResponse(order: Order): GetOrderResponse {
  return {
    orderId: order.orderId,
    customerId: order.customerId,
    status: order.status,
    createdAt: order.createdAt,
  };
}

function makeOrderSearchResultResponse(order: Order): SearchOrderResult {
  return {
    orderId: order.orderId,
    customerId: order.customerId,
    status: order.status,
    createdAt: order.createdAt,
  };
}

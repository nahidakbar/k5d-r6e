import { v4 as uuidv4 } from "uuid";

import createFastifyServer, { FastifyServer, runServer } from "../lib/fastify";

import { type DummyOrdersService } from "../domain/orders/service";
import { OrderStatus } from "../domain/orders/types";
import ordersRouter from "./orders";

describe("orders router", () => {
  let server: FastifyServer;
  let address: string;
  const service = {
    createOrder: jest.fn(),
    searchOrders: jest.fn(),
    getOrder: jest.fn(),
    updateOrder: jest.fn(),
  };

  beforeAll(async () => {
    server = await createFastifyServer({
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test",
          version: "1.0.0",
        },
        paths: {},
      },
    });

    await server.register(ordersRouter, {
      orders: service as unknown as DummyOrdersService,
      prefix: "/orders",
    });

    address = await runServer(server, 0);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    service.createOrder.mockClear();
    service.searchOrders.mockClear();
    service.getOrder.mockClear();
    service.updateOrder.mockClear();
  });

  const orderId = uuidv4();
  const customerId = uuidv4();

  it("should be able to create an order", async () => {
    service.createOrder.mockResolvedValue({ orderId });

    const response = await fetch(`${address}/orders`, {
      method: "POST",
      body: JSON.stringify({
        customerId,
      }),
      headers: { "Content-Type": "application/json" },
    });

    expect(service.createOrder).toHaveBeenCalledWith({ customerId });
    expect(response.status).toEqual(201);
    await expect(response.json()).resolves.toEqual({ orderId });
  });

  it("should be able to search orders", async () => {
    const results = {
      total: 1,
      offset: 0,
      limit: 10,
      data: [
        {
          orderId,
          customerId,
          createdAt: new Date(),
          status: OrderStatus.SHIPPED,
        },
      ],
    };
    service.searchOrders.mockResolvedValue(results);

    const response = await fetch(`${address}/orders`);

    expect(service.searchOrders).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    expect(response.status).toEqual(200);
    const json = await response.json();
    json.data.forEach((order) => {
      // date gets serialised to string over the wire
      order.createdAt = new Date(order.createdAt);
    });
    expect(json).toEqual(results);
  });

  it("should be able to get an order by ID", async () => {
    const order = {
      orderId,
      customerId,
      createdAt: new Date(),
      status: OrderStatus.SHIPPED,
    };
    service.getOrder.mockResolvedValue(order);

    const response = await fetch(`${address}/orders/${orderId}`);

    expect(service.getOrder).toHaveBeenCalledWith(orderId);
    expect(response.status).toEqual(200);
    const json = await response.json();
    // date gets serialised to string over the wire
    json.createdAt = new Date(json.createdAt);
    expect(json).toEqual(order);
  });

  it("should be able to update an order", async () => {
    const order = {
      orderId,
      customerId,
      createdAt: new Date(),
      status: OrderStatus.PENDING,
    };
    service.updateOrder.mockResolvedValue(order);
    const update = {
        status: OrderStatus.CANCELLED
    }

    const response = await fetch(`${address}/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(update),
      headers: { "Content-Type": "application/json" },
    });

    expect(service.updateOrder).toHaveBeenCalledWith(orderId, update);
    expect(response.status).toEqual(200);
    const json = await response.json();
    // date gets serialised to string over the wire
    json.createdAt = new Date(json.createdAt);
    expect(json).toEqual(order);
  });
});

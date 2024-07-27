import { BadRequestError, NotFoundError } from "../../lib/fastify";
import { DUMMY_ORDERS_DATA } from "./dummy-data";
import { DummyOrdersService } from "./service";
import { OrderCreatedResponse, OrderStatus } from "./types";

describe("order management service", () => {
  let orderService: DummyOrdersService;

  beforeEach(() => {
    orderService = new DummyOrdersService();
  });

  describe("when initialised", () => {
    it("should have default dummy data", async () => {
      const returnedOrders = await orderService.searchOrders({
        limit: DUMMY_ORDERS_DATA.length,
        offset: 0,
      });

      expect(returnedOrders.total).toEqual(DUMMY_ORDERS_DATA.length);

      for (const order of returnedOrders.data) {
        const dummyOrder = DUMMY_ORDERS_DATA.find(
          (dummyOrder) => dummyOrder.orderId === order.orderId
        );

        expect(dummyOrder).toMatchObject(order);
      }
    });

    it("should be able to search orders by status", async () => {
      const searchResults = await orderService.searchOrders({
        status: OrderStatus.PENDING,
        limit: 100,
        offset: 0,
      });

      expect(DUMMY_ORDERS_DATA[0]).toMatchObject(searchResults.data[0]);
    });
  });

  describe("when orders are fetched", () => {
    it("should be able to get order by order id", async () => {
      const order = await orderService.getOrder(DUMMY_ORDERS_DATA[0].orderId);

      expect(DUMMY_ORDERS_DATA[0]).toMatchObject(order);
    });

    it("should not be able to fetch non-existant orders", async () => {
      await expect(orderService.getOrder("non-existant-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("when orders are updated", () => {
    it("should be able to update order by order id", async () => {
      const order = await orderService.updateOrder(
        DUMMY_ORDERS_DATA[0].orderId,
        {
          status: OrderStatus.CANCELLED,
        }
      );

      expect({
        ...DUMMY_ORDERS_DATA[0],
        status: OrderStatus.CANCELLED,
      }).toMatchObject(order);
    });

    it("should not be able to update order creation date", async () => {
      await expect(
        orderService.updateOrder(DUMMY_ORDERS_DATA[0].orderId, {
          createdAt: new Date(),
        } as any)
      ).rejects.toThrow(BadRequestError);
    });

    it("should not be able to update non-existing orders", async () => {
      await expect(
        orderService.updateOrder("non-existant-id", {
          status: OrderStatus.CANCELLED,
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("when new order is created", () => {
    let newOrder: OrderCreatedResponse;

    beforeEach(async () => {
      newOrder = await orderService.createOrder({
        customerId: "new-customer-id",
      });
    });

    it("should return new order id", async () => {
      expect(newOrder).toHaveProperty("orderId");
      expect(newOrder.orderId).toBeTruthy();
    });

    it("should be able to find the new order", async () => {
      const order = await orderService.getOrder(newOrder.orderId);
      expect(order).toMatchObject({
        orderId: newOrder.orderId,
        customerId: "new-customer-id",
        status: OrderStatus.PENDING,
      });
      expect(order.createdAt).toBeInstanceOf(Date);
    });

    it("should return new order in search results", async () => {
      const searchResults = await orderService.searchOrders({
        customerId: "new-customer-id",
        status: OrderStatus.PENDING,
        limit: 100,
        offset: 0,
      });

      expect(
        searchResults.data.find((order) => order.orderId === newOrder.orderId)
      ).toMatchObject({
        orderId: newOrder.orderId,
        customerId: "new-customer-id",
        status: OrderStatus.PENDING,
      });
    });
  });
});

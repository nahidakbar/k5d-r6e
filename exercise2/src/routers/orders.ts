import { FastifyPluginOptions } from "fastify";
import { FastifyServer, errorHandlerSchemas } from "../lib/fastify";
import { type DummyOrdersService } from "../domain/orders/service";
import {
  createOrderRequestSchema,
  orderCreatedResponseSchema,
  searchOrderRequestSchema,
  searchOrderResultsSchema,
  getOrderRequestSchema,
  getOrderResponseSchema,
  updateOrderRequestSchema,
} from "../domain/orders/types";

export default async function ordersRouter(
  server: FastifyServer,
  {
    orders,
  }: FastifyPluginOptions & {
    orders: DummyOrdersService;
  }
): Promise<void> {
  server.post(
    "",
    {
      schema: {
        summary: "Create a new order",
        operationId: "createOrder",
        description: "Use this endpoint to create new orders.",
        body: createOrderRequestSchema,
        response: {
          201: orderCreatedResponseSchema.describe("OK"),
          ...errorHandlerSchemas,
        },
        tags: ["orders"],
      },
    },
    async (request, reply) => {
      const order = await orders.createOrder(request.body);
      reply.status(201).send(order);
    }
  );

  server.get(
    "",
    {
      schema: {
        summary: "Search orders",
        operationId: "searchOrders",
        description: "Use this endpoint to search orders.",
        query: searchOrderRequestSchema,
        response: {
          200: searchOrderResultsSchema.describe("OK"),
          ...errorHandlerSchemas,
        },
        tags: ["orders"],
      },
    },
    async (request, reply) => {
      const results = await orders.searchOrders(
        searchOrderRequestSchema.parse(request.query)
      );
      reply.status(200).send(results);
    }
  );

  server.get(
    "/:orderId",
    {
      schema: {
        summary: "Get order by ID",
        operationId: "getOrderById",
        description: "Use this endpoint to get an order by its ID.",
        params: getOrderRequestSchema,
        response: {
          200: getOrderResponseSchema.describe("OK"),
          ...errorHandlerSchemas,
        },
        tags: ["orders"],
      },
    },
    async (request, reply) => {
      const order = await orders.getOrder(request.params.orderId);
      reply.status(200).send(order);
    }
  );

  server.put(
    "/:orderId",
    {
      schema: {
        summary: "Update an order by id",
        operationId: "updateOrderById",
        description: "Use this endpoint to update orders.",
        params: getOrderRequestSchema,
        body: updateOrderRequestSchema,
        response: {
          200: getOrderResponseSchema.describe("OK"),
          ...errorHandlerSchemas,
        },
        tags: ["orders"],
      },
    },
    async (request, reply) => {
      const order = await orders.updateOrder(
        request.params.orderId,
        request.body
      );
      reply.status(200).send(order);
    }
  );
}

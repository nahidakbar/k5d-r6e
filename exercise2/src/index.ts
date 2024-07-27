import { FastifyPluginOptions } from "fastify";
import createFastifyServer, {
  errorHandlerSchemas,
  FastifyServer,
  runServer,
  UnauthorizedError,
} from "./lib/fastify";
import { DummyOrdersService } from "./orders";
import {
  createOrderRequestSchema,
  getOrderRequestSchema,
  getOrderResponseSchema,
  orderCreatedResponseSchema,
  searchOrderRequestSchema,
  searchOrderResultsSchema,
  updateOrderRequestSchema,
} from "./orders/types";
import basicAuth from "@fastify/basic-auth";
import { port, basicAuthPassword, basicAuthUsername } from "./config";

const API_PREFIX = "/api/v0";

async function main() {
  const ordersImpl = new DummyOrdersService();

  const server = await createFastifyServer({
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Order Management System API",
        version: "1.0.0",
        description: "API design document for order management system.",
      },
      paths: {},
      components: {
        securitySchemes: {
          basicAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      },
      security: [
        {
          basicAuth: [],
        },
      ],
    },
  });

  // Basic Auth integration using @fastify/basic-auth
  if (basicAuthUsername && basicAuthPassword) {
    await server.register(basicAuth, {
      validate(username, password, req, reply, done) {
        if (username === basicAuthUsername && password === basicAuthPassword) {
          done();
        } else {
          done(new UnauthorizedError());
        }
      },
      authenticate: true,
    });
    server.addHook("onRequest", server.basicAuth);
  }
  // End basic auth integration

  await server.register(ordersRouter, {
    prefix: API_PREFIX + "/orders",
    orders: ordersImpl,
  });

  runServer(server, port);
}

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

main();

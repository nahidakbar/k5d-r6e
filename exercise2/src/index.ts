import createFastifyServer, {
  runServer,
  UnauthorizedError,
} from "./lib/fastify";
import { DummyOrdersService } from "./domain/orders/service";
import basicAuth from "@fastify/basic-auth";
import { port, basicAuthPassword, basicAuthUsername } from "./config";
import ordersRouter from "./routers/orders";

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

  await runServer(server, port).then(
    (address) => {
      console.log(`Server listening at ${address}`);
    },
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

main();

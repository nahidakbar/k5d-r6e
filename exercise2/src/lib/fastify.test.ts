import { z } from "zod";
import createFastifyServer, {
  FastifyServer,
  NotFoundError,
  runServer,
  UnauthorizedError,
} from "./fastify";

describe("Fastify", () => {
  let server: FastifyServer;
  let address: string;

  let implemenation = jest.fn(() => true);

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

    server.get("/test", async () => {
      return implemenation();
    });

    address = await runServer(server, 0);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    implemenation.mockClear();
  });

  it("should return 200 for health check", async () => {
    const response = await fetch(`${address}/healthz`);
    expect(response.status).toEqual(200);
  });

  it("should call implementation", async () => {
    const response = await fetch(`${address}/test`);
    expect(implemenation).toHaveBeenCalled();
  });

  it("should return 400 for not found errors", async () => {
    const response = await fetch(`${address}/not-found`);
    expect(response.status).toEqual(404);
  });

  it("should return 400 when implementation throws not found errors", async () => {
    implemenation.mockImplementation(() => {
      throw new NotFoundError();
    });

    const response = await fetch(`${address}/test`);
    expect(response.status).toEqual(404);
  });

  it("should return 500 when implementation throws unknown errors", async () => {
    implemenation.mockImplementation(() => {
      throw new Error();
    });

    const response = await fetch(`${address}/test`);
    expect(response.status).toEqual(500);
  });

  it("should return 400 when zod throws validation errors", async () => {
    implemenation.mockImplementation(() => {
      z.string().parse(true);
      return true;
    });

    const response = await fetch(`${address}/test`);
    expect(response.status).toEqual(400);
  });

  it("should return 401 for unauthorized errors", async () => {
    implemenation.mockImplementation(() => {
      throw new UnauthorizedError();
    });

    const response = await fetch(`${address}/test`);
    expect(response.status).toEqual(401);
  });

  it("should be able to access swagger api documentation", async () => {
    const response = await fetch(`${address}/api-docs/json`);
    expect(response.status).toEqual(200);
    await expect(response.json()).resolves.toMatchObject({
      openapi: "3.0.0",
      info: {
        title: "Test",
        version: "1.0.0",
      },
      paths: {
        "/test": {
          get: {
            responses: {},
          },
        },
      },
    });
  });

  it("should throw if runServer can't listen to a port", async () => {
    const alreadyUsedPort = parseInt(
      address.substring(address.indexOf(":") + 1)
    );
    await expect(runServer(server, alreadyUsedPort)).rejects.toThrow();
  });
});

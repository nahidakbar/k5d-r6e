import fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z, ZodError } from "zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { OpenAPIV3_1 } from "openapi-types";
import createError from "@fastify/error";

export type FastifyServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export default async function createFastifyServer(options: {
  openapi: OpenAPIV3_1.Document;
}): Promise<FastifyServer> {
  const server = fastify();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "Bad Request",
        issues: error.issues,
      });
    }

    if (error.statusCode && error.code) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }

    return new InternalError(error.message);
  });

  await server.register(fastifySwagger, {
    openapi: options.openapi,
    transform: jsonSchemaTransform,
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/api-docs",
    uiConfig: {
      docExpansion: "full",
    },
  });

  server.get(
    "/healthz",
    {
      schema: {
        hide: true,
      },
      logLevel: "silent",
    },
    (_req, res) => {
      return res.status(200).send();
    }
  );

  server.addHook("onReady", async function () {
    server.swagger();
  });

  return server.withTypeProvider<ZodTypeProvider>();
}

export function runServer(
  server: FastifyServer,
  port: number
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    server.listen({ port, host: "0.0.0.0" }, (err, address) => {
      if (err) {
        return reject(err);
      }

      resolve(address);
    });
  });
}

export const errorHandlerSchemas = {
  400: z
    .object({
      statusCode: z.number(),
      code: z.string(),
      message: z.string().optional(),
      issues: z.any().optional(),
    })
    .describe("Bad Request"),
  401: z
    .object({
      statusCode: z.number(),
      code: z.string(),
      message: z.string().optional(),
    })
    .describe("Unauthorized"),
  404: z
    .object({
      statusCode: z.number(),
      code: z.string(),
      message: z.string().optional(),
    })
    .describe("Not Found"),
  500: z
    .object({
      statusCode: z.number(),
      code: z.string(),
      message: z.string().optional(),
    })
    .describe("Internal Server Error"),
};

export const UnauthorizedError = createError(
  "UNAUTHORIZED",
  "Unauthorized",
  401
);

export const NotFoundError = createError("NOT_FOUND", "Not Found", 404);

export const BadRequestError = createError("BAD_REQUEST", "Bad Request", 400);

export const InternalError = createError(
  "INTERNAL_SERVER_ERROR",
  "Internal Server Error",
  500
);

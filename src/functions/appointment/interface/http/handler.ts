import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AppointmentHttpModule } from "./module";

let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(
    AppointmentHttpModule,
    new FastifyAdapter(),
    {
      logger: ["error", "warn", "log", "debug", "verbose"],
    }
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("Appointment API")
    .setDescription("API de agendamiento")
    .setVersion("1.0.0")
    .build();
  const enableSwagger = (process.env.ENABLE_SWAGGER ?? "true") !== "false";
  if (enableSwagger) {
    try {
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup("docs", app, document);
      const fastify = app.getHttpAdapter().getInstance();
      fastify.get("/openapi-json", async (_req: any, _reply: any) => document);
    } catch (e) {
      console.error("[Swagger] Disabled at runtime:", (e as Error)?.message);
    }
  }

  await app.init();
  return app;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  const server = cachedApp.getHttpAdapter().getInstance();

  const httpMethod =
    (event as any).httpMethod ||
    (event as any).requestContext?.http?.method ||
    "GET";
  const rawPath =
    (event as any).rawPath ||
    (event as any).path ||
    (event as any).requestContext?.http?.path ||
    "/";
  let rawQueryString: string | undefined = (event as any).rawQueryString;
  if (!rawQueryString) {
    const qsParams =
      (event as any).multiValueQueryStringParameters ||
      (event as any).queryStringParameters;
    if (qsParams) {
      const parts: string[] = [];
      const entries = (event as any).multiValueQueryStringParameters
        ? Object.entries(qsParams).flatMap(([k, vals]: [string, any]) =>
            (Array.isArray(vals) ? vals : [vals]).map(
              (v) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
            )
          )
        : Object.entries(qsParams).map(
            ([k, v]: [string, any]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`
          );
      parts.push(...entries);
      rawQueryString = parts.join("&");
    }
  }
  const fullUrl = rawQueryString ? `${rawPath}?${rawQueryString}` : rawPath;

  let bodyString = event.body as any;
  if (bodyString && (event as any).isBase64Encoded) {
    bodyString = Buffer.from(bodyString, "base64").toString();
  }
  const headers = { ...(event.headers as any) };
  if (headers["content-length"] || headers["Content-Length"]) {
    delete headers["content-length"];
    delete headers["Content-Length"];
  }

  const injectResult = await server.inject({
    method: httpMethod,
    url: fullUrl,
    payload: bodyString,
    headers,
  });

  return {
    statusCode: injectResult.statusCode,
    headers: injectResult.headers as any,
    body: injectResult.payload,
  };
};

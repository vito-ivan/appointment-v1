import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { AppointmentConfirmationModule } from "./module";
import { CompleteAppointmentUseCase } from "../../../appointment-confirmation/application/use-cases/complete-appointment.usecase";

let app: any;
async function bootstrap() {
  if (!app) {
    app = await NestFactory.createApplicationContext(
      AppointmentConfirmationModule,
      { logger: ["error", "warn", "log"] }
    );
  }
  return app;
}

export const handler = async (event: SQSEvent) => {
  const ctx = await bootstrap();
  const useCase = ctx.get(CompleteAppointmentUseCase);
  for (const record of event.Records || []) {
    try {
      const body = parse(record);
      // Unwrap EventBridge envelope if present
      const payload: any =
        body && typeof body === "object" && "detail" in body
          ? (body as any).detail
          : body;
      await useCase.execute(payload as any);
    } catch (e) {
      console.error("[SQS-Handler] error", e);
    }
  }
};

function parse(r: SQSRecord): any {
  try {
    return JSON.parse(r.body);
  } catch {
    return r.body;
  }
}

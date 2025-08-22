import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConsumerClModule } from "./module";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { ProcessAppointmentEventUseCase } from "../../application/use-cases/process-appointment-event.usecase";

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.createApplicationContext(ConsumerClModule, {
      logger: ["error", "warn", "log"],
    });
  }
  return app;
}

export const handler = async (event: SQSEvent) => {
  const ctx = await bootstrap();
  const useCase = ctx.get(ProcessAppointmentEventUseCase);
  for (const record of event.Records || []) {
    try {
      const body = parseRecordBody(record);
      await useCase.execute(body as any);
    } catch (e) {
      console.error("[SQS-CL] error", e);
    }
  }
};

function parseRecordBody(record: SQSRecord): any {
  const raw = safeJson(record.body);
  if (raw && raw.Message) {
    return safeJson(raw.Message) ?? raw.Message;
  }
  return raw ?? record.body;
}

function safeJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

import { Injectable, Logger } from "@nestjs/common";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const region = process.env.AWS_REGION || "us-east-1";
const busName = process.env.EVENT_BUS_NAME || "default";
const endpoint = process.env.EVENTBRIDGE_ENDPOINT;

const ebClient = new EventBridgeClient({
  region,
  endpoint: endpoint && endpoint.startsWith("http") ? endpoint : undefined,
});

@Injectable()
export class EventBridgePublisher {
  private readonly logger = new Logger(EventBridgePublisher.name);

  async publishConfirmation(detail: any): Promise<void> {
    const entry = {
      Source: "appointment.consumer.pe",
      DetailType: "AppointmentConfirmed",
      EventBusName: busName,
      Detail: JSON.stringify(detail),
    } as const;
    const out = await ebClient.send(new PutEventsCommand({ Entries: [entry] }));
    if (out.FailedEntryCount && out.FailedEntryCount > 0) {
      const err = out.Entries?.[0]?.ErrorMessage || "Unknown error";
      this.logger.error(`[EB] failed to publish: ${err}`);
      throw new Error(`EventBridge PutEvents failed: ${err}`);
    }
  }
}

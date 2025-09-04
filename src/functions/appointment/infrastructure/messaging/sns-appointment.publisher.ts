import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { AppointmentEventPublisher } from "../../application/use-cases/create-appointment.usecase";
import { Logger } from "@nestjs/common";

const region = process.env.AWS_REGION || "us-east-1";
const topicArn = process.env.SNS_TOPIC_ARN as string;

const client = new SNSClient({ region });

export class SnsAppointmentPublisher implements AppointmentEventPublisher {
  private readonly logger = new Logger(SnsAppointmentPublisher.name);

  async publishCreated(evt: any): Promise<void> {
    try {
      const payload = {
        appointmentId: evt.appointmentId,
        scheduleId: evt.scheduleId,
        insuredId: evt.insuredId,
        countryISO: String(evt.countryISO ?? "").toUpperCase() as "PE" | "CL",
        status: evt.status,
        createdAt: evt.createdAt ?? new Date().toISOString(),
      };

      const out = await client.send(
        new PublishCommand({
          TopicArn: topicArn,
          Message: JSON.stringify(payload),
          MessageAttributes: {
            eventType: {
              DataType: "String",
              StringValue: "APPOINTMENT_CREATED",
            },
          },
        })
      );
      this.logger.log("[SNS] published", { messageId: out.MessageId });
    } catch (e) {
      this.logger.error("[SNS] publish error", e as Error);
    }
  }
}

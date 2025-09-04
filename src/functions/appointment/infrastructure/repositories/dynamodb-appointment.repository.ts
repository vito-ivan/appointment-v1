import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { AppointmentRepository } from "../../domain/ports/appointment-repository.port";
import { Appointment } from "../../domain/entities/appointment.entity";

// Local endpoint/credentials removed for production usage

export class DynamoDbAppointmentRepository implements AppointmentRepository {
  private readonly doc: DynamoDBDocumentClient;
  private readonly table: string;

  constructor(options?: { endpoint?: string; tableName?: string }) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    this.doc = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
    this.table =
      options?.tableName ||
      process.env.TABLE_NAME ||
      "appointment-api-healthcare-dev";
  }

  private pk(scheduleId: number) {
    return `SCHEDULE#${scheduleId}`;
  }
  private sk(insuredId: string) {
    return `INSURED#${insuredId}`;
  }

  async save(appointment: Appointment): Promise<void> {
    await this.doc.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          PK: this.pk(appointment.scheduleId.toNumber()),
          SK: this.sk(appointment.insuredId.toString()),
          appointmentId: appointment.id,
          scheduleId: appointment.scheduleId.toNumber(),
          insuredId: appointment.insuredId.toString(),
          countryISO: appointment.countryISO,
          status: appointment.status,
          createdAt: appointment.createdAt.toISOString(),
        },
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      })
    );
  }

  async findByScheduleAndInsured(scheduleId: number, insuredId: string) {
    const res = await this.doc.send(
      new GetCommand({
        TableName: this.table,
        Key: { PK: this.pk(scheduleId), SK: this.sk(insuredId) },
      })
    );
    if (!res.Item) return null;
    return Appointment.fromPersistence({
      id: res.Item.appointmentId,
      scheduleId: res.Item.scheduleId,
      insuredId: res.Item.insuredId,
      countryISO: res.Item.countryISO,
      status: res.Item.status,
      createdAt: res.Item.createdAt,
    });
  }

  async findByInsured(insuredId: string) {
    try {
      const out = await this.doc.send(
        new QueryCommand({
          TableName: this.table,
          IndexName: "GSI1",
          KeyConditionExpression: "SK = :sk",
          ExpressionAttributeValues: { ":sk": `INSURED#${insuredId}` },
        })
      );
      const items = out.Items || [];
      return items.map((it) =>
        Appointment.fromPersistence({
          id: it.appointmentId,
          scheduleId: it.scheduleId,
          insuredId: it.insuredId,
          countryISO: it.countryISO,
          status: it.status,
          createdAt: it.createdAt,
        })
      );
    } catch {
      return [];
    }
  }
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AppointmentRepository } from "../../domain/ports/appointment-repository.port";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

  async markCompleted(scheduleId: number, insuredId: string): Promise<void> {
    const sidNum = Number(scheduleId);
    const iid = String(insuredId || "").trim();
    const key = { PK: this.pk(sidNum), SK: this.sk(iid) } as const;
    const now = new Date().toISOString();

    try {
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: key,
          UpdateExpression: "SET #s = :completed, updatedAt = :now",
          ExpressionAttributeNames: { "#s": "status" },
          ExpressionAttributeValues: { ":completed": "COMPLETED", ":now": now },
          ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
          ReturnValues: "ALL_NEW",
        })
      );
    } catch (err: any) {
      console.error("[DDB] markCompleted error details", err);
      throw err;
    }
  }
}

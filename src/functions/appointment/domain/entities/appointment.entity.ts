import { InsuredId } from "../value-objects/insured-id.vo";
import { ScheduleId } from "../value-objects/schedule-id.vo";

export interface AppointmentProps {
  id: string;
  scheduleId: ScheduleId;
  insuredId: InsuredId;
  countryISO: "PE" | "CL";
  createdAt: Date;
  status: "PENDING" | "COMPLETED";
}

export class Appointment {
  private constructor(private props: AppointmentProps) {}

  static create(
    id: string,
    scheduleId: ScheduleId,
    insuredId: InsuredId,
    countryISO: "PE" | "CL"
  ): Appointment {
    return new Appointment({
      id,
      scheduleId,
      insuredId,
      countryISO,
      createdAt: new Date(),
      status: "PENDING",
    });
  }

  // Rehydrate from persistence (DynamoDB record)
  static fromPersistence(data: {
    id: string;
    scheduleId: number;
    insuredId: string;
    countryISO: "PE" | "CL";
    status?: "PENDING" | "COMPLETED";
    createdAt?: string;
  }): Appointment {
    return new Appointment({
      id: data.id,
      scheduleId: ScheduleId.create(data.scheduleId),
      insuredId: InsuredId.create(data.insuredId),
      countryISO: data.countryISO,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      status: data.status ?? "PENDING",
    });
  }

  get id() {
    return this.props.id;
  }
  get scheduleId() {
    return this.props.scheduleId;
  }
  get insuredId() {
    return this.props.insuredId;
  }
  get countryISO() {
    return this.props.countryISO;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get status() {
    return this.props.status;
  }
}

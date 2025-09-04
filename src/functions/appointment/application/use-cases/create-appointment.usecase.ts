import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepository,
} from "../../domain/ports/appointment-repository.port";
import { InsuredId } from "../../domain/value-objects/insured-id.vo";
import { ScheduleId } from "../../domain/value-objects/schedule-id.vo";
import { Appointment } from "../../domain/entities/appointment.entity";
import { randomUUID } from "crypto";

export interface CreateAppointmentCommand {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}

export const APPOINTMENT_EVENT_PUBLISHER = Symbol(
  "APPOINTMENT_EVENT_PUBLISHER"
);
export interface AppointmentEventPublisher {
  publishCreated(evt: {
    appointmentId: string;
    scheduleId: number;
    insuredId: string;
    countryISO: "PE" | "CL";
    status: "PENDING" | "COMPLETED";
    createdAt: string;
  }): Promise<void>;
}

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly repo: AppointmentRepository,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly events: AppointmentEventPublisher
  ) {}

  async execute(cmd: CreateAppointmentCommand) {
    const insuredId = InsuredId.create(cmd.insuredId);
    const scheduleId = ScheduleId.create(cmd.scheduleId);
    const existing = await this.repo.findByScheduleAndInsured(
      scheduleId.toNumber(),
      insuredId.toString()
    );

    if (existing)
      throw new BadRequestException(
        "Appointment already exists for this insured and schedule"
      );
    const appointment = Appointment.create(
      randomUUID(),
      scheduleId,
      insuredId,
      cmd.countryISO as "PE" | "CL"
    );
    await this.repo.save(appointment);
    const response = {
      appointmentId: appointment.id,
      scheduleId: scheduleId.toNumber(),
      insuredId: insuredId.toString(),
      countryISO: appointment.countryISO,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
    };

    await this.events.publishCreated(response);
    return response;
  }
}

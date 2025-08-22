import { Inject, Injectable } from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepository,
} from "../../domain/ports/appointment-repository.port";

export interface CompletionMessage {
  appointmentId: string;
  scheduleId: number;
  insuredId: string;
  countryISO?: string;
  createdAt?: string;
}

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly repo: AppointmentRepository
  ) {}

  async execute(msg: CompletionMessage): Promise<void> {
    if (!msg?.scheduleId || !msg?.insuredId) return;
    await this.repo.markCompleted(msg.scheduleId, msg.insuredId);
  }
}

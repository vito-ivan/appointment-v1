import { Inject, Injectable } from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepository,
} from "../../domain/ports/appointment-repository.port";

@Injectable()
export class GetAppointmentsByInsuredUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly repo: AppointmentRepository
  ) {}

  async execute(insuredId: string) {
    const list = await this.repo.findByInsured(insuredId);
    return list.map((a) => ({
      appointmentId: a.id,
      scheduleId: a.scheduleId.toNumber(),
      insuredId: a.insuredId.toString(),
      countryISO: a.countryISO,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
    }));
  }
}

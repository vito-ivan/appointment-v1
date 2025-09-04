import { Appointment } from "../../domain/entities/appointment.entity";
import {
  AppointmentRepository,
} from "../../domain/ports/appointment-repository.port";

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private items: Appointment[] = [];

  async save(appointment: Appointment): Promise<void> {
    this.items.push(appointment);
  }

  async findByScheduleAndInsured(
    scheduleId: number,
    insuredId: string
  ): Promise<Appointment | null> {
    return (
      this.items.find(
        (a) => a.scheduleId.toNumber() === scheduleId && a.insuredId.toString() === insuredId
      ) || null
    );
  }

  async findByInsured(insuredId: string): Promise<Appointment[]> {
    return this.items.filter((a) => a.insuredId.toString() === insuredId);
  }

  async markCompleted(_scheduleId: number, _insuredId: string): Promise<void> {
    // Not needed for current tests; no-op
  }
}

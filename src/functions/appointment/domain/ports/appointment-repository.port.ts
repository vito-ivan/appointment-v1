import { Appointment } from "../entities/appointment.entity";

export const APPOINTMENT_REPOSITORY = Symbol("APPOINTMENT_REPOSITORY");

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findByScheduleAndInsured(
    scheduleId: number,
    insuredId: string
  ): Promise<Appointment | null>;
  findByInsured(insuredId: string): Promise<Appointment[]>;
}

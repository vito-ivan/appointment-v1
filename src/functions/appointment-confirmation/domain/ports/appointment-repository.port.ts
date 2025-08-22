export const APPOINTMENT_REPOSITORY = Symbol("APPOINTMENT_REPOSITORY");

export interface AppointmentRepository {
  markCompleted(scheduleId: number, insuredId: string): Promise<void>;
}

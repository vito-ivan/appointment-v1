import { AppointmentEvent } from "../entities/appointment-event.entity";

export interface AppointmentEventHandlerPort {
  handle(event: AppointmentEvent): Promise<void>;
}

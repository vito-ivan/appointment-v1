import { Injectable } from "@nestjs/common";
import { AppointmentEvent } from "../../domain/entities/appointment-event.entity";

@Injectable()
export class EventLogger {
  async log(event: AppointmentEvent): Promise<void> {
    console.log("[Infra][PE] EventLogger", event);
  }
}

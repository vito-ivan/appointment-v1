import { Module } from "@nestjs/common";
import { ProcessAppointmentEventUseCase } from "../../application/use-cases/process-appointment-event.usecase";
import { EventLogger } from "../../infrastructure/logging/event.logger";
import { MySqlConnection } from "../../infrastructure/db/mysql.connection";
import { AppointmentEventRepository } from "../../infrastructure/repositories/appointment-event.repository";
import { EventBridgePublisher } from "../../infrastructure/messaging/eventbridge.publisher";

@Module({
  providers: [
    MySqlConnection,
    AppointmentEventRepository,
    EventBridgePublisher,
    ProcessAppointmentEventUseCase,
    EventLogger,
  ],
  exports: [ProcessAppointmentEventUseCase],
})
export class ConsumerClModule {}

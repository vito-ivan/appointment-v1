import { Module } from "@nestjs/common";
import { AppointmentController } from "./appointments.controller";
import {
  CreateAppointmentUseCase,
  APPOINTMENT_EVENT_PUBLISHER,
} from "../../application/use-cases/create-appointment.usecase";
import { GetAppointmentsByInsuredUseCase } from "../../application/use-cases/get-appointments-by-insured.usecase";
import { APPOINTMENT_REPOSITORY } from "../../domain/ports/appointment-repository.port";
import { DynamoDbAppointmentRepository } from "../../infrastructure/repositories/dynamodb-appointment.repository";
import { SnsAppointmentPublisher } from "../../infrastructure/messaging/sns-appointment.publisher";

@Module({
  controllers: [AppointmentController],
  providers: [
    CreateAppointmentUseCase,
    GetAppointmentsByInsuredUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: DynamoDbAppointmentRepository,
    },
    { provide: APPOINTMENT_EVENT_PUBLISHER, useClass: SnsAppointmentPublisher },
  ],
})
export class AppointmentHttpModule {}

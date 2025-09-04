import { Module } from "@nestjs/common";
import { CompleteAppointmentUseCase } from "../../../appointment-confirmation/application/use-cases/complete-appointment.usecase";
import { APPOINTMENT_REPOSITORY } from "../../../appointment-confirmation/domain/ports/appointment-repository.port";
import { DynamoDbAppointmentRepository } from "../../../appointment-confirmation/infrastructure/repositories/dynamodb-appointment.repository";

@Module({
  providers: [
    CompleteAppointmentUseCase,
    DynamoDbAppointmentRepository,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: DynamoDbAppointmentRepository,
    },
  ],
  exports: [CompleteAppointmentUseCase],
})
export class AppointmentConfirmationModule {}

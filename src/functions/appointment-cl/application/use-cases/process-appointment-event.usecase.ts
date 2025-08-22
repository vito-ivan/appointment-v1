import { Injectable, Inject } from "@nestjs/common";
import { AppointmentEvent } from "../../domain/entities/appointment-event.entity";
import { AppointmentEventRepository } from "../../infrastructure/repositories/appointment-event.repository";
import { EventBridgePublisher } from "../../infrastructure/messaging/eventbridge.publisher";

@Injectable()
export class ProcessAppointmentEventUseCase {
  constructor(
    @Inject(AppointmentEventRepository)
    private readonly repo: AppointmentEventRepository,
    @Inject(EventBridgePublisher)
    private readonly publisher: EventBridgePublisher
  ) {}

  async execute(event: AppointmentEvent): Promise<void> {
    await this.repo.insert(event);
    await this.publisher.publishConfirmation(event);
  }
}

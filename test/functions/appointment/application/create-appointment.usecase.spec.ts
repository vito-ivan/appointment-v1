import { CreateAppointmentUseCase } from "../../../../src/functions/appointment/application/use-cases/create-appointment.usecase";
import { InMemoryAppointmentRepository } from "../../../../src/functions/appointment/infrastructure/repositories/inmemory-appointment.repository";

describe("CreateAppointmentUseCase", () => {
  it("creates an appointment", async () => {
    const repo = new InMemoryAppointmentRepository();
    const publisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new CreateAppointmentUseCase(repo as any, publisher as any);
    const result = await useCase.execute({
      insuredId: "01234",
      scheduleId: 1,
      countryISO: "PE",
    });
    expect(result).toHaveProperty("appointmentId");
    expect(result.insuredId).toBe("01234");
    expect(publisher.publishCreated).toHaveBeenCalledWith({
      appointmentId: expect.any(String),
      scheduleId: 1,
      insuredId: "01234",
      countryISO: "PE",
      status: "PENDING",
      createdAt: expect.any(String),
    });
    expect(result.countryISO).toBe("PE");
  });

  it("prevents duplicate appointment for same insured + schedule", async () => {
    const repo = new InMemoryAppointmentRepository();
    const publisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new CreateAppointmentUseCase(repo as any, publisher as any);
    await useCase.execute({
      insuredId: "01234",
      scheduleId: 1,
      countryISO: "PE",
    });
    await expect(
      useCase.execute({ insuredId: "01234", scheduleId: 1, countryISO: "PE" })
    ).rejects.toThrow(
      "Appointment already exists for this insured and schedule"
    );
  });
});

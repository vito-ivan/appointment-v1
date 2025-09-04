import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { CreateAppointmentUseCase } from "../../application/use-cases/create-appointment.usecase";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { GetAppointmentsByInsuredUseCase } from "../../application/use-cases/get-appointments-by-insured.usecase";

@ApiTags("appointments")
@Controller("appointments")
export class AppointmentController {
  constructor(
    @Inject(CreateAppointmentUseCase)
    private readonly createUseCase: CreateAppointmentUseCase,
    @Inject(GetAppointmentsByInsuredUseCase)
    private readonly getByInsured: GetAppointmentsByInsuredUseCase
  ) {}

  @Post()
  @ApiCreatedResponse({ description: "Cita creada" })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiQuery({
    name: "insuredId",
    required: true,
    description: "Código de asegurado (5 dígitos)",
  })
  @ApiOkResponse({ description: "Listado de citas del asegurado" })
  async findByInsured(@Query("insuredId") insuredId?: string) {
    if (!insuredId) throw new BadRequestException("insuredId es requerido");
    return this.getByInsured.execute(insuredId);
  }
}

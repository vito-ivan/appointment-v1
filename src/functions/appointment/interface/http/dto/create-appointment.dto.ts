import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, IsInt, Min } from "class-validator";

export class CreateAppointmentDto {
  @ApiProperty({ example: "00742", pattern: "^\\d{5}$" })
  @IsString()
  @Matches(/^\d{5}$/)
  insuredId!: string;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt()
  @Min(1)
  scheduleId!: number;

  @ApiProperty({ example: "PE", pattern: "^(PE|CL)$", enum: ["PE", "CL"] })
  @IsString()
  @Matches(/^(PE|CL)$/)
  countryISO!: string;
}

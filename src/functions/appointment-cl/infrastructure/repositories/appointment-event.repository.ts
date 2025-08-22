import { Injectable, Inject } from "@nestjs/common";
import { MySqlConnection } from "../db/mysql.connection";
import { AppointmentEvent } from "../../domain/entities/appointment-event.entity";

@Injectable()
export class AppointmentEventRepository {
  constructor(
    @Inject(MySqlConnection)
    private readonly conn: MySqlConnection
  ) {}

  async insert(event: AppointmentEvent): Promise<void> {
    const country = (event.countryISO || "").toUpperCase();

    const pool = await this.conn.getPool();
    await pool.query(`CREATE TABLE IF NOT EXISTS appointment_events_cl (
      id VARCHAR(100) PRIMARY KEY,
      scheduleId BIGINT,
      insuredId VARCHAR(100),
      countryISO VARCHAR(5),
      status VARCHAR(50),
      createdAt DATETIME(3),
      createdAtIso VARCHAR(40)
    )`);

    await pool.execute(
      `INSERT INTO appointment_events_cl (id, scheduleId, insuredId, countryISO, status, createdAt, createdAtIso)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), createdAt = VALUES(createdAt), createdAtIso = VALUES(createdAtIso)`,
      [
        event.appointmentId,
        event.scheduleId,
        event.insuredId,
        country,
        event.status,
        event.createdAt ? new Date(event.createdAt) : new Date(),
        event.createdAt ?? new Date().toISOString(),
      ]
    );
  }
}

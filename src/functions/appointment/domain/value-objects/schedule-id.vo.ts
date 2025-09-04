export class ScheduleId {
  private constructor(private readonly value: number) {}
  static create(raw: number): ScheduleId {
    if (!Number.isInteger(raw) || raw <= 0)
      throw new Error("Invalid scheduleId");
    return new ScheduleId(raw);
  }
  valueOf() {
    return this.value;
  }
  toNumber() {
    return this.value;
  }
}

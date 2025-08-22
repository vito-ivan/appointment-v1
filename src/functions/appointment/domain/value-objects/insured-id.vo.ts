export class InsuredId {
  private constructor(private readonly value: string) {}
  static create(raw: string): InsuredId {
    if (!/^\d{5}$/.test(raw)) throw new Error("Invalid insuredId");
    return new InsuredId(raw);
  }
  toString() {
    return this.value;
  }
}

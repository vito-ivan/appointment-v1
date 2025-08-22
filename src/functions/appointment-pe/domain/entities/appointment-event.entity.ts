export interface AppointmentEvent {
  appointmentId?: string;
  insuredId?: string;
  scheduleId?: string;
  countryISO?: string;
  createdAt?: string;
  // Allow extra properties without breaking the consumer while schema evolves
  [key: string]: any;
}

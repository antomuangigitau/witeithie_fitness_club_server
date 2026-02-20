// Registration input for creating new registrations (camelCase from frontend)
export interface RegistrationInput {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}
export interface RegistrationEvent extends Registration {
  title: string;
}
// Registration as stored in database (snake_case)
export interface Registration {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at?: Date;
}

// Convert database row to camelCase for API response
export const toCamelCase = (reg: Registration) => ({
  id: reg.id,
  eventId: reg.event_id,
  firstName: reg.first_name,
  lastName: reg.last_name,
  email: reg.email,
  phoneNumber: reg.phone_number,
  emergencyContact: reg.emergency_contact_name,
  emergencyPhone: reg.emergency_contact_phone,
  status: reg.status,
  createdAt: reg.created_at,
});
export const toCamelCaseTitle = (reg: RegistrationEvent) => ({
  ...toCamelCase(reg),
  title: reg.title,
});

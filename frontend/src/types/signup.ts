import type { Role } from "./auth";

export type DriverSignupDetails = {
  role: "driver";
  email: string;
  password: string;
  driver_name: string;
};

export type CustomerSignupDetails = {
  role: "customer";
  email: string;
  password: string;
  customer_name: string;
  billing_address?: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
};

export type SignupDetails = DriverSignupDetails | CustomerSignupDetails;

export type SignupRoleOption = Role;

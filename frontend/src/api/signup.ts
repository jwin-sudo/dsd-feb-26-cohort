import http from "./http";

type DriverSignupPayload = {
  driver_name: string;
};

type CustomerSignupPayload = {
  customer_name: string;
  billing_address?: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
};

export async function submitDriverSignup(payload: DriverSignupPayload): Promise<void> {
  await http.post("/drivers/signup", payload);
}

export async function submitCustomerSignup(
  payload: CustomerSignupPayload,
): Promise<void> {
  await http.post("/customers/signup", payload);
}

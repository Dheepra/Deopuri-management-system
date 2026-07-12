import { http } from "./http";


// GET PAYMENT HISTORY BY ORDER NUMBER
export async function getPaymentHistory(orderNumber) {
  const { data } = await http.get(
    `/deopuri/payments/order/${orderNumber}`
  );

  return data;
}


// ADD PAYMENT
export async function addPayment(orderNumber, paymentData) {

  const { data } = await http.post(
    `/deopuri/payments/${orderNumber}`,
    paymentData
  );

  return data;
}
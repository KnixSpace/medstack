import { sendEmail } from "../utils/email.js";

export const sendEmailVerification = async (to, data) =>
  await sendEmail(to, "Email verification", "emailVerification", data);

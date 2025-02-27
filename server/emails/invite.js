import { sendEmail } from "../utils/email.js";

export const sendClientInvitationEmail = async (to, data) =>
  await sendEmail(to, "Invitation to Medstack", "clientInvitation", data);

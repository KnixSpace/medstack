import { sendEmail } from "../utils/email.js";

export const sendInvitationEmail = async (to, data) =>
  await sendEmail(to, "Invitation to Medstack", "teamInvitation", data);

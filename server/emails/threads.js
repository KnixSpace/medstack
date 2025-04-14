import { sendEmail } from "../utils/email.js";

export const sendThreadPublishApproval = async (to, data) =>
  await sendEmail(to, "Thread approval", "threadPublishApproval", data);

export const sendThreadApprovedNotification = async (to, data) =>
  await sendEmail(to, "Thread Published!", "threadApprovedToPublish", data);

export const sendbackThreadForUpdate = async (to, data) =>
  await sendEmail(to, "Thread Needs Update", "threadSendbackForUpdate", data);

export const sendNewsletter = async (to, data) =>
  await sendEmail(to, `Newsletter: ${data.title}`, "newsletter", data);

import nodemailer from "nodemailer";
import pug from "pug";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
});

const renderTemplate = (templateName, data) => {
  const filePath = join(__dirname, "../views", `${templateName}.pug`);
  return pug.renderFile(filePath, data);
};

export const sendEmail = async (to, subject, template, data) =>
  await transporter.sendMail({
    from: process.env.APP_EMAIL,
    to,
    subject,
    html: renderTemplate(template, data),
  });

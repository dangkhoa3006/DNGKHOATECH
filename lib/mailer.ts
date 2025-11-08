import nodemailer from "nodemailer";

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_ENCRYPTION,
  MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME,
  // Fallback to old names for backward compatibility
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM,
} = process.env;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  
  // Use new variable names first, fallback to old names
  const host = MAIL_HOST || SMTP_HOST;
  const port = MAIL_PORT || SMTP_PORT;
  const user = MAIL_USERNAME || SMTP_USER;
  const pass = MAIL_PASSWORD || SMTP_PASS;
  const encryption = MAIL_ENCRYPTION || (SMTP_SECURE === "true" ? "ssl" : "tls");
  
  // For TLS: secure=false, port usually 587
  // For SSL: secure=true, port usually 465
  const secure = encryption === "ssl";
  
  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure,
      auth: {
        user,
        pass,
      },
      ...(encryption === "tls" && {
        requireTLS: true,
      }),
    });
    return transporter;
  }
  return null;
}

export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransporter();
  if (!t) {
    console.log("[DEV MAIL] No SMTP config found. Email would be sent to:", to);
    console.log("[DEV MAIL] Subject:", subject);
    console.log("[DEV MAIL] HTML:", html);
    return;
  }
  
  const fromAddress = MAIL_FROM_ADDRESS || MAIL_FROM || MAIL_USERNAME || SMTP_USER;
  const fromName = MAIL_FROM_NAME;
  const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;
  
  try {
    await t.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log("[MAIL] Email sent successfully to:", to);
  } catch (error) {
    console.error("[MAIL] Failed to send email:", error);
    throw error;
  }
}

export function buildOtpEmail(name: string | null | undefined, code: string) {
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <p>Xin chào ${name || "bạn"},</p>
      <p>Mã xác minh tài khoản của bạn là:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p>Mã có hiệu lực trong 10 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
      <p>Trân trọng,</p>
      <p>Hệ thống CMS</p>
    </div>
  `;
}


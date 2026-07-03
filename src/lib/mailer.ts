import nodemailer from "nodemailer";

// Konfiguracija Gmail SMTP servera za slanje emailova
// GMAIL_USER i GMAIL_APP_PASSWORD se citaju iz .env.local
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type ConfirmationEmailProps = {
  to: string;
  fullName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
};

// Salje email potvrdu korisniku nakon uspesnog zakazivanja termina
export async function sendConfirmationEmail({
  to,
  fullName,
  serviceName,
  employeeName,
  date,
  time,
}: ConfirmationEmailProps) {
  await transporter.sendMail({
    from: `"Bibi Salon" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Potvrda rezervacije - Bibi Salon",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #b5654a; font-family: Georgia, serif;">Bibi Salon</h2>
        <p>Zdravo <strong>${fullName}</strong>,</p>
        <p>Vaš termin je uspešno zakazan! ✅</p>
        <div style="background: #faf6f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b5654a;">
          <p style="margin: 6px 0;"><strong>Usluga:</strong> ${serviceName}</p>
          <p style="margin: 6px 0;"><strong>Frizer:</strong> ${employeeName}</p>
          <p style="margin: 6px 0;"><strong>Datum:</strong> ${date}</p>
          <p style="margin: 6px 0;"><strong>Vreme:</strong> ${time.slice(0, 5)}</p>
        </div>
        <p>Vidimo se u salonu!</p>
        <p style="color: #b5654a; margin-top: 30px;">
          <strong>Bibi Salon</strong><br/>
          Bulevar Kralja Aleksandra 45, Beograd<br/>
          Pon-Pet: 09-20h | Sub: 09-16h
        </p>
      </div>
    `,
  });
}

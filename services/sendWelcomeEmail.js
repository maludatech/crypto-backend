import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (newUser) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "CryptFX Plc",
    to: newUser.email,
    subject: "🎉 Welcome to CryptFX",
    html: `<div>Welcome ${newUser.username}!</div>`,
  };

  await transporter.sendMail(mailOptions);
};

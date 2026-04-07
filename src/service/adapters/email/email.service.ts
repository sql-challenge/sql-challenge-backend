import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
	await transporter.sendMail({
		from: `SQL Challenger <${process.env.EMAIL_USER}>`,
		to,
		subject,
		html,
	});
}

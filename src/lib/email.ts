import * as nodemailer from "nodemailer";

const emailTransport = nodemailer.createTransport({
	newline: "unix",
	sendmail: true,
});

export const sendValidationEmail = (email: string, username: string, validationCode: string) => {

	const validationUrl = `http://www.roll-cal.com/validate/${validationCode}`
	+ `||${encodeURIComponent(email.replace(/\./g, "%2E"))}`
	+ `||${encodeURIComponent(username.replace(/\./g, "%2E"))}`;

	return emailTransport.sendMail({
		from: "Roll-Cal.com <noreply@roll-cal.com>",
		html: `
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>Thanks for signing up to add events on Roll-Cal.com!  Your help creating a resource for the roller derby community is greatly appreciated.</p>
		<p>If you meant to sign up, click the link below to validate your email:</p>
		<p>http://www.roll-cal.com/validate/${validationUrl}</p>
		`,
		subject: "Validate your Roll-Cal account",
		to: `${username} <${email}>`,
	});

};

export const sendEmailChangeEmail = () => {};




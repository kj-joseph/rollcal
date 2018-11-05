import * as nodemailer from "nodemailer";

const mailConfig =
	process.env.TEST_EMAIL_HOST && process.env.TEST_EMAIL_USER && process.env.TEST_EMAIL_PASS ?
		{
		    auth: {
		        pass: process.env.TEST_EMAIL_PASS,
		        user: process.env.TEST_EMAIL_USER,
		    },
		    host: process.env.TEST_EMAIL_HOST,
		    port: 587,
		}
	:
		{
			newline: "unix",
			sendmail: true,
		};

const emailTransport = nodemailer.createTransport(mailConfig);


export const sendChangeRejectionEmail =
	(email: string, username: string, changeId: number, type: string, newItem: boolean, itemName: string, comment: string) => {

	let changeText = "";

	switch (type) {

		case "event":
			changeText = (newItem ? `new event you submitted` : "change you submitted to your event");
			break;

		case "venue":
			changeText = (newItem ? "new venue you submitted" : "change you submitted to your venue");
			break;

	}

	return emailTransport.sendMail({
		from: "Roll-Cal.com <feedback@roll-cal.com>",
		html: `
		<p>[change ${changeId}]</p>
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>We looked over the ${changeText}, ${itemName}.  Unfortunately, we were unable to approve your change.</p>
		${comment ?
			`<p>The person who reviewed your changed commented:</p>
			<p>${comment}</p>`
		: ""}
		<p>If you have any questions, please reply to this email and we will look into the issue.</p>
		`,
		subject: `${type.charAt(0).toUpperCase()}${type.slice(1)} Submission rejected`,
		to: `${username} <${email}>`,
	}, null);

};


export const sendEmailChangeEmail = (email: string, username: string, validationCode: string) => {

	const validationUrl = `http://www.roll-cal.com/validate/${validationCode}`
	+ `||${encodeURIComponent(email.replace(/\./g, "%2E"))}`
	+ `||${encodeURIComponent(username.replace(/\./g, "%2E"))}`;

	return emailTransport.sendMail({
		from: "Roll-Cal.com <feedback@roll-cal.com>",
		html: `
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>You recently changed your email address on Roll-Cal.com.  If you meant to do this, click the link below to validate your email:</p>
		<p>${validationUrl}</p>
		<p>If you didn't mean to do this, please reply to this email so we can look into the issue.</p>
		`,
		subject: "Validate your Roll-Cal account",
		to: `${username} <${email}>`,
	}, null);

};


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
		<p>${validationUrl}</p>
		`,
		subject: "Validate your Roll-Cal account",
		to: `${username} <${email}>`,
	}, null);

};


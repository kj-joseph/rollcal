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


export const sendChangeApprovalEmail =
	(email: string, username: string, changeId: number, type: string, newItem: boolean, itemName: string) => {

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
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>We looked over the ${changeText}, ${itemName}.  Everything looked good, so we made it live.
		Thanks again for helping the derby community!</p>
		<p>Thanks,<br />Roll-Cal</p>
		<p style="margin-top: 1em; font-size: .8em;">[change ${changeId}]</p>
		`,
		subject: `${type.charAt(0).toUpperCase()}${type.slice(1)} Submission approved`,
		to: `${username} <${email}>`,
	}, null);

};


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
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>We looked over the ${changeText}, ${itemName}.  Unfortunately, we were unable to approve your change.</p>
		${comment ?
			`<p>The person who reviewed your changed commented:</p>
			<p style="padding: 5px; border: 1px solid #999999;">${comment}</p>`
		: ""}
		<p>If you have any questions, please reply to this email and we will look into the issue.</p>
		<p>Thanks,<br />Roll-Cal</p>
		<p style="margin-top: 1em; font-size: .8em;">[change ${changeId}]</p>
		`,
		subject: `${type.charAt(0).toUpperCase()}${type.slice(1)} Submission rejected`,
		to: `${username} <${email}>`,
	}, null);

};


export const sendEmailChangeEmail = (email: string, username: string, validationCode: string) => {

	const validationUrl = `https://www.roll-cal.com/validate/${validationCode}`;

	return emailTransport.sendMail({
		from: "Roll-Cal.com <feedback@roll-cal.com>",
		html: `
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>You recently changed your email address on Roll-Cal.com.  If you meant to do this, <a href="${validationUrl}">click here to validate your email</a>.</p>
		If the link isn't working, copy and paste this URL into your browser:</p>
		<p>${validationUrl}</p>
		<p>If you didn't mean to do this, please reply to this email so we can look into the issue.</p>
		`,
		subject: "Validate your Roll-Cal account",
		to: `${username} <${email}>`,
	}, null);

};


export const sendValidationEmail = (email: string, username: string, validationCode: string) => {

	const validationUrl = `https://www.roll-cal.com/validate/${validationCode}`;

	return emailTransport.sendMail({
		from: "Roll-Cal.com <noreply@roll-cal.com>",
		html: `
		<p><img src="https://www.roll-cal.com/images/header-logo.png" alt="Roll-Cal.com" width="305" height="100" /></p>
		<p>Hey there, ${username}!</p>
		<p>Thanks for signing up to add events on Roll-Cal.com!  Your help creating a resource for the roller derby community is greatly appreciated.</p>
		<p>If you meant to sign up, <a href="${validationUrl}">click here to validate your email</a>.
		If the link isn't working, copy and paste this URL into your browser:</p>
		<p>${validationUrl}</p>
		`,
		subject: "Validate your Roll-Cal account",
		to: `${username} <${email}>`,
	}, null);

};

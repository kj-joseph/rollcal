import crypto from "crypto";

const secret = process.env.ROLLCAL_DEV_SECRET || process.env.ROLLCAL_STAGE_SECRET || process.env.ROLLCAL_PROD_SECRET;

export const decryptCode = (vcode: string) => {

	const decipher = crypto.createDecipher("aes192", secret);
	let decrypted = decipher.update(vcode, "hex", "utf8");
	decrypted += decipher.final("utf8");

	try {
		const vObj = JSON.parse(decrypted);
		return vObj;
	} catch {
		return {};
	}

};

export const generateValidation = (obj: {
	email: string,
	username: string,
}) => {
	let hash = 0;

	const cipher = crypto.createCipher("aes192", secret);
	const str = obj.username + obj.email + new Date().toString();

	for (let i = 0; i < str.length; i++) {
		const chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}

	hash = Math.abs(hash);

	let encrypted = cipher.update(JSON.stringify({
		email: obj.email,
		hash,
		username: obj.username,
	}), "utf8", "hex");
	encrypted += cipher.final("hex");

	return {
		encrypted,
		hash,
	};
};

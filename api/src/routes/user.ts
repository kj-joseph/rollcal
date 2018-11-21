import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import crypto from "crypto";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

import { sendEmailChangeEmail, sendForgotPasswordEmail, sendValidationEmail } from "lib/email";

const router = Router();
const upload = multer();

const secret = process.env.ROLLCAL_DEV_SECRET || process.env.ROLLCAL_STAGE_SECRET || process.env.ROLLCAL_PROD_SECRET;

const decryptCode = (vcode: string) => {

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

const generateValidation = (obj: {
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

router.get("/checkEmail", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call checkEmail(${res.locals.connection.escape(req.query.email)},
			${res.locals.connection.escape(req.query.id) || null})`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				res.status(200).json(!!results[0].map((row: {}) => ({...row}))[0].count);

			}

		});

});

router.post("/checkForgotPassword", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	if (vObj.hash) {

		res.locals.connection
			.query(`call checkForgotPassword(${res.locals.connection.escape(vObj.email)},
				${res.locals.connection.escape(vObj.hash)})`,
			(error: MysqlError, results: any) => {

				if (error) {
					console.error(error);
					res.status(500).send();

				} else {

					const userData = results[0].map((row: {}) => ({...row}))[0];

					if (userData) {

						res.status(200).json(userData);

					} else {

						res.status(403).send();

					}

				}

			});

	} else {

		res.status(403).send();

	}


});

router.get("/checkUsername", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call checkUsername(${res.locals.connection.escape(req.query.username)},
			${res.locals.connection.escape(req.query.id) || null})`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				res.status(200).json(!!results[0].map((row: {}) => ({...row}))[0].count);

			}

		});

});

router.post("/getSession", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.status(200).json({
		email: req.session.user.email,
		id: req.session.user.id,
		roles: req.session.user.roles,
		username: req.session.user.username,
	});

});

router.post("/login", upload.array(), (req: IRequestWithSession, res: Response) => {

	if (req.body.email && req.body.password) {

		res.locals.connection
			.query(`call login(${res.locals.connection.escape(req.body.email)},
				${res.locals.connection.escape(req.body.password)})`,
			(error: MysqlError, results: any) => {

				if (error) {
					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				} else if (results[0].length !== 1) {
					res.locals.connection.end();
					res.status(403).json(
						{
							error: "Username or password is incorrect",
							success: false,
							token: null,
						});

				} else {

					const loginResult = results[0].map((row: {}) => ({...row}))[0];

					req.session.user = {
						email: loginResult.user_email,
						id: loginResult.user_id,
						roles: loginResult.user_roles.split(","),
						username: loginResult.user_name,
					};

					res.status(200).json({
						email: loginResult.user_email,
						id: loginResult.user_id,
						roles: loginResult.user_roles.split(","),
						username: loginResult.user_name,
					});

				}

		});

	} else {
		res.locals.connection.end();
		res.status(401).send();
	}

});

router.get("/logout", (req: IRequestWithSession, res: Response) => {

	req.session.destroy(() => {
		res.cookie("rollCalAuthCookie", "", {
			path: "/",
		}).status(200).send();
	});

});

router.post("/register", upload.array(), (req: Request, res: Response) => {

	const validation = generateValidation({
		email: req.body.email,
		username: req.body.username,
	});

	res.locals.connection
		.query(`call registerUser
			(${res.locals.connection.escape(req.body.username)},
			${res.locals.connection.escape(req.body.email)},
			${res.locals.connection.escape(req.body.password)},
			${res.locals.connection.escape(validation.hash)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				sendValidationEmail(req.body.email, req.body.username, validation.encrypted)
					.then(() => {

						res.status(200).send();

					}).catch((emailError) => {

						console.error(emailError);
						res.status(500).send();

					});

			}

		});

});


router.post("/submitForgotPassword", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getUserDetailsFromEmail(${res.locals.connection.escape(req.body.email)})`,

			(detailError: MysqlError, detailResults: any) => {

				const userDetails = detailResults[0].map((row: {}) => ({...row}))[0];

				if (detailError || !userDetails) {

					res.status(403).json({
						errorCode: "notFound",
					});

				} else {

					const validation = generateValidation({
						email: req.body.email,
						username: userDetails.user_name,
					});

					res.locals.connection
						.query(`call insertForgotPassword(
							${res.locals.connection.escape(userDetails.user_id)},
							${res.locals.connection.escape(validation.hash)}
							)`,

							(insertError: MysqlError, insertResults: any) => {

								if (insertError) {
									console.error(insertError);
									res.status(500).json({
										errorCode: "insert",
									});

								} else {

									sendForgotPasswordEmail(req.body.email, userDetails.user_name, validation.encrypted)
										.then(() => {

											res.status(200).send();

										}).catch((emailError) => {

											console.error(emailError);
											res.status(500).json({
												errorCode: "email",
											});

										});

								}

							});

				}

			});


 });


router.post("/account/setNewPassword", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	if (req.body.id && req.body.password && vObj.hash) {

		res.locals.connection
			.query(`call setNewPassword(
				${res.locals.connection.escape(vObj.email)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(vObj.hash)},
				${res.locals.connection.escape(req.body.password)}
				)`,
			(error: MysqlError, results: any) => {

				if (error) {
					console.error(error);
					res.status(500).send();

				} else {

					if (results[0].map((row: {}) => ({...row}))[0].success) {

						res.status(200).send();

					} else {

						res.status(403).send();

					}


				}

			});

	} else {

		res.status(403).send();

	}

});

router.put("/account/update", checkSession("user"), upload.array(), (req: IRequestWithSession, res: Response) => {

	const changes = [] as string[];
	let error = false;
	let needAuth = false;
	let validation = {
		encrypted: null as string,
		hash: null as number,
	};

	if (req.body.username) {
		changes.push(`user_name = ${res.locals.connection.escape(req.body.username)}`);
	}

	if (req.body.email && req.body.email !== req.session.user.email) {
		if (!req.body.currentPassword) {
			error = true;
		} else {
			validation = generateValidation({
				email: req.body.email,
				username: req.body.username,
			});
			needAuth = true;
			changes.push(`user_email = ${res.locals.connection.escape(req.body.email)}`);
			changes.push(`user_status = ${res.locals.connection.escape("unvalidated")}`);
			changes.push(`user_validation_code = ${validation.hash}`);
		}
	}

	if (!!req.body.newPassword && req.body.currentPassword) {

		if (!req.body.currentPassword) {
			error = true;
		} else {
			needAuth = true;
			changes.push(`user_password = sha2(${res.locals.connection.escape(req.body.newPassword)}, 256)`);
		}
	}

	if (!error && changes.length && Number(req.body.id) === req.session.user.id) {

		res.locals.connection
			.query(`update users set ${changes.join(", ")}
				where user_id = ${res.locals.connection.escape(req.body.id)}
				${ needAuth ?
					`and user_password = sha2(${res.locals.connection.escape(req.body.currentPassword)}, 256)
						and user_status = ${res.locals.connection.escape("active")}`
					: "" }`,

			(saveError: MysqlError, results: any) => {

				if (saveError) {

					res.locals.connection.end();
					console.error(saveError);
					res.status(403).send();

				} else {

					if (validation.hash && validation.encrypted) {

						sendEmailChangeEmail(req.body.email, req.body.username || req.session.user.username, validation.encrypted)
							.then(() => {

								res.status(200).json({
									validationCode: validation.hash,
								});

							}).catch((mailError) => {

								console.error(mailError);
								res.status(500).send();

							});

					} else {

						req.session.user = {
							email: req.body.email || req.session.user.email,
							id: req.body.id,
							roles: req.session.user.roles,
							username: req.body.username || req.session.user.username,
						};

						res.status(200).json({
							email: req.body.email || req.session.user.email,
							id: req.body.id,
							roles: req.session.user.roles,
							username: req.body.username || req.session.user.username,
						});

					}

				}
			});

	} else {

		res.locals.connection.end();
		res.status(403).send();

	}
});

router.post("/account/validate", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	res.locals.connection
		.query(`call validateUser(${res.locals.connection.escape(vObj.email)},
			${res.locals.connection.escape(vObj.username)},
			${res.locals.connection.escape(vObj.hash)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				if (results[0].map((row: {}) => ({...row}))[0].validated) {

					res.status(200).json({
						validated: true,
					});

				} else {

					res.status(403).send();

				}

			}

		});

});

export default router;

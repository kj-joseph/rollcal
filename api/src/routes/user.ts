import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { decryptCode, generateValidation } from "lib/crypto";
import { dbObject } from "lib/db";
import { sendEmailChangeEmail, sendValidationEmail } from "lib/email";

import { IDBUserInfo } from "interfaces/user";

import { mapUser } from "mapping/userMaps";

const router = Router();
const upload = multer();


router.get("/", upload.array(), (req: Request, res: Response) => {

	let query = "";

	if (req.query.email) {

		query = `call checkEmail(${res.locals.connection.escape(req.query.email)},
			${res.locals.connection.escape(req.query.id) || null})`;

	} else if (req.query.username) {

		query = `call checkUsername(${res.locals.connection.escape(req.query.username)},
			${res.locals.connection.escape(req.query.id) || null})`;

	}

	if (query) {

		res.locals.connection
			.query(query,
			(error: MysqlError, response: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					const userCount: number = dbObject(response[0]).count;

					if (!userCount) {

						res.locals.connection.end();
						res.status(205).json();

					} else {

						res.locals.connection.end();
						res.status(200).json();

					}

				}

			});

	} else {

		res.status(400).send();

	}

});

router.post("/", upload.array(), (req: Request, res: Response) => {

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

		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				sendValidationEmail(req.body.email, req.body.username, validation.encrypted)
					.then(() => {

						res.locals.connection.end();
						res.status(200).send();

					}).catch((emailError) => {
						console.error(emailError);

						res.locals.connection.end();
						res.status(500).send();

					});

			}

		});

});


router.get("/:id", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getUserDetailsById(${req.params.id})`,

		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const userData: IDBUserInfo = dbObject(response[0]);

				if (!userData || !userData.user_id) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const userInfo = mapUser(userData);

					res.locals.connection.end();
					res.status(200).json(userInfo);

				}

			}

		});

});


router.put("/:id", checkSession("user"), upload.array(), (req: Request, res: Response) => {

	if (req.session.user.roles.indexOf("admin")) {

		res.locals.connection
			.query(`call updateUser(
				${res.locals.connection.escape(req.params.id)},
				${res.locals.connection.escape(req.body.name)},
				${res.locals.connection.escape(req.body.status)},
				${res.locals.connection.escape(req.body.email)},
				${res.locals.connection.escape(req.body.roles)}
				)`,

			(error: MysqlError, response: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					res.locals.connection.end();
					res.status(200).send();

				}

			});


	} else {

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

		if (!error && changes.length && Number(req.params.id) === req.session.user.id) {

			res.locals.connection
				.query(`update users set ${changes.join(", ")}
					where user_id = ${res.locals.connection.escape(req.params.id)}
					${ needAuth ?
						`and user_password = sha2(${res.locals.connection.escape(req.body.currentPassword)}, 256)
							and user_status = ${res.locals.connection.escape("active")}`
						: "" }`,

				(saveError: MysqlError, response: any) => {

					if (saveError) {
						console.error(saveError);

						res.locals.connection.end();
						res.status(403).send();

					} else {

						if (validation.hash && validation.encrypted) {

							sendEmailChangeEmail(req.body.email, req.body.username || req.session.user.username, validation.encrypted)
								.then(() => {

									res.locals.connection.end();
									res.status(200).json({
										validationCode: validation.hash,
									});

								}).catch((mailError) => {
									console.error(mailError);

									res.locals.connection.end();
									res.status(500).send();

								});

						} else {

							req.session.user = {
								email: req.body.email || req.session.user.email,
								id: req.params.id,
								roles: req.session.user.roles,
								username: req.body.username || req.session.user.username,
							};

							res.locals.connection.end();
							res.status(200).json({
								email: req.body.email || req.session.user.email,
								id: req.params.id,
								roles: req.session.user.roles,
								username: req.body.username || req.session.user.username,
							});

						}

					}
				});

		} else {

			res.status(403).send();

		}

	}

});


router.put("/", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	if (req.body.id && req.body.password && vObj.hash) {

		res.locals.connection
			.query(`call setNewPassword(
				${res.locals.connection.escape(vObj.email)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(vObj.hash)},
				${res.locals.connection.escape(req.body.password)}
				)`,
			(error: MysqlError, response: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					const successful = dbObject(response[0]).success;

					if (successful) {

						res.locals.connection.end();
						res.status(200).send();

					} else {

						res.locals.connection.end();
						res.status(403).send();

					}


				}

			});

	} else {

		res.status(403).send();

	}

});


export default router;

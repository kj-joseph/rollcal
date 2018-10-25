import { Request, Response, Router } from "express";
import multer from "multer";
import { FieldInfo, MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

import * as email from "lib/email";

const router = Router();
const upload = multer();

const generateHash = (str: string) => {
	let hash = 0;

	if (str.length === 0) {
		return hash;
	}

	for (let i = 0; i < str.length; i++) {
		const chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}

	return Math.abs(hash);
};

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
			.query(
				`select user_id, user_email, user_roles, user_name from users where user_email = ${res.locals.connection.escape(req.body.email)}`
				+ ` and user_password = sha2(${res.locals.connection.escape(req.body.password)}, 256) and user_validated = 1`,
			(error: MysqlError, results: any) => {

				if (error) {
					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				} else if (results.length !== 1) {
					res.locals.connection.end();
					res.status(403).json(
						{
							error: "Username or password is incorrect",
							success: false,
							token: null,
						});

				} else {

					req.session.user = {
						email: results[0].user_email,
						id: results[0].user_id,
						roles: results[0].user_roles.split(","),
						username: results[0].user_name,
					};

					res.status(200).json({
						response: {
							email: results[0].user_email,
							id: results[0].user_id,
							roles: results[0].user_roles.split(","),
							username: results[0].user_name,
						},
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

	const validationCode = generateHash(req.body.username + req.body.email + new Date()).toString();

	res.locals.connection.query(
		"insert into users (user_name, user_email, user_password, user_validation_code) values ("
		+ res.locals.connection.escape(req.body.username)
		+ `, ${res.locals.connection.escape(req.body.email)}`
		+ `, sha2(${res.locals.connection.escape(req.body.password)}, 256)`
		+ `, ${res.locals.connection.escape(validationCode)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				email.sendValidationEmail(req.body.email, req.body.username, validationCode)
					.then(() => {

						res.status(200).json({
							response: {
								validationCode,
							}});

					}).catch(() => {

						console.error(error);
						res.status(500).send();

					});

			}

		});

});

router.post("/register/checkEmail", upload.array(), (req: Request, res: Response) => {

	res.locals.connection.query(
		`select user_email from users where user_email = ${res.locals.connection.escape(req.body.email)}`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json({
					response: (!!results.length),
				});

			}

		});

});

router.put("/account/update", checkSession("user"), upload.array(), (req: IRequestWithSession, res: Response) => {

	const changes = [] as string[];
	let error = false;
	let needAuth = false;
	let validationCode = null as string;

	if (req.body.username) {
		changes.push(`user_name = ${res.locals.connection.escape(req.body.username)}`);
	}

	if (req.body.email && req.body.email !== req.session.user.email) {
		if (!req.body.currentPassword) {
			error = true;
		} else {
			validationCode = generateHash(req.body.username + req.body.email + new Date()).toString();
			needAuth = true;
			changes.push(`user_email = ${res.locals.connection.escape(req.body.email)}`);
			changes.push("user_validated = 0");
			changes.push(`user_validation_code = ${validationCode}`);
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

		res.locals.connection.query([
				"update users set",
				changes.join(", "),
				`where user_id = ${res.locals.connection.escape(req.body.id)}`,
				needAuth ? `and user_password = sha2(${res.locals.connection.escape(req.body.currentPassword)}, 256) and user_validated = 1` : "",
				].join(" "),

			(saveError: MysqlError, results: any) => {

				if (saveError) {

					res.locals.connection.end();
					console.error(saveError);
					res.status(403).send();

				} else {

					if (validationCode) {

						email.sendEmailChangeEmail(req.body.email, req.body.username || req.session.user.username, validationCode)
							.then(() => {

								res.status(200).json({
									response: {
										validationCode,
									}});

							}).catch(() => {

								console.error(error);
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
							response: {
								email: req.body.email || req.session.user.email,
								id: req.body.id,
								roles: req.session.user.roles,
								username: req.body.username || req.session.user.username,
							},
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

	res.locals.connection.query([
		"select user_id from users where",
		`user_name = ${res.locals.connection.escape(req.body.username)}`,
		`and user_email = ${res.locals.connection.escape(req.body.email)}`,
		`and user_validation_code = ${res.locals.connection.escape(req.body.validationCode)}`,
	].join(" "),

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				if (results.length === 1) {

					res.locals.connection.query(
						`update users set user_validation_code = NULL, user_validated = 1 where user_id = ${res.locals.connection.escape(results[0].user_id)}`,

						(updateError: MysqlError, updateResults: any) => {

							if (updateError) {
								console.error(updateError);
								res.status(500).send();

							} else {
								res.status(200).json({
									response: true,
								});
							}

						});

				} else {
					res.status(401).send();
				}

			}

		});

});

export default router;

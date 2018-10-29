import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

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

	const validationCode = generateHash(req.body.username + req.body.email + new Date()).toString();

	res.locals.connection
		.query(`call registerUser
			(${res.locals.connection.escape(req.body.username)},
			${res.locals.connection.escape(req.body.email)},
			${res.locals.connection.escape(req.body.password)},
			${res.locals.connection.escape(validationCode)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				email.sendValidationEmail(req.body.email, req.body.username, validationCode)
					.then(() => {

						res.status(200).send();

					}).catch(() => {

						console.error(error);
						res.status(500).send();

					});

			}

		});

});

router.get("/register/checkEmail", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call checkEmail(${res.locals.connection.escape(req.query.email)})`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {

				res.status(200).json(!!results[0].map((row: {}) => ({...row}))[0].count);

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
			changes.push(`user_stauts = ${res.locals.connection.escape("unvalidated")}`);
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

					if (validationCode) {

						email.sendEmailChangeEmail(req.body.email, req.body.username || req.session.user.username, validationCode)
							.then(() => {

								res.status(200).json({
									validationCode,
								});

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

	res.locals.connection
		.query(`call validateUser(${res.locals.connection.escape(req.body.email)},
			${res.locals.connection.escape(req.body.username)},
			${res.locals.connection.escape(req.body.validationCode)})`,

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

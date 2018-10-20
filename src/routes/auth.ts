import { Request, Response, Router } from "express";
import multer from "multer";
import { FieldInfo, MysqlError } from "mysql";

import { IRequestWithUser } from "interfaces";

import * as email from "lib/email";

import jperm from "express-jwt-permissions";
import jwt from "jsonwebtoken";

const guard = jperm({
	permissionsProperty: "permissions",
});

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

router.post("/checkToken", guard.check("user"), upload.array(), (req: IRequestWithUser, res: Response) => {

	if (Number(req.body.id) === req.user.id
		&& req.body.permissions.split(",").sort().join(",") === req.user.permissions.sort().join(",")
		&& req.body.username === req.user.username) {

		res.status(200).json({
			email: req.user.email,
			id: req.user.id,
			permissions: req.user.permissions.sort().join(","),
			success: true,
			username: req.user.username,
		});

	} else {

		res.status(401).json(
			{
				err: "User information invalid",
				success: false,
			});

	}

});


router.post("/login", upload.array(), (req: Request, res: Response) => {

	if (req.body.email && req.body.password) {

		res.locals.connection
			.query(
				`select user_id, user_email, user_perms, user_name from users where user_email = ${res.locals.connection.escape(req.body.email)}`
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
							err: "Username or password is incorrect",
							success: false,
							token: null,
						});

				} else {

					const token = jwt.sign({
						email: results[0].user_email,
						id: results[0].user_id,
						permissions: results[0].user_perms.split(",").sort(),
						username: results[0].user_name,
					},
					process.env.ROLLCAL_API_SECRET,
					{ expiresIn: 15 * 60 * 1000 });

					res.status(200).json({
						response: {
							email: results[0].user_email,
							id: results[0].user_id,
							permissions: results[0].user_perms.split(",").sort().join(","),
							token,
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

router.delete("/logout/:userId", (req: Request, res: Response) => {

	res.locals.connection.query(
		`delete from user_sessions where userId = ${res.locals.connection.escape(req.params.userId)}`,
		(error: MysqlError, results: any) => {
			if (error) {
				console.error(error);
				res.status(500).send();
			} else {
				res.status(200).send();
			}
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

router.put("/updateUserAccount", guard.check("user"), upload.array(), (req: IRequestWithUser, res: Response) => {

	const changes = [] as string[];
	let error = false;
	let needAuth = false;
	let validationCode = null as string;

	if (req.body.username) {
		changes.push(`user_name = ${res.locals.connection.escape(req.body.username)}`);
	}

	if (req.body.email && req.body.email !== req.user.email) {
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

	if (!error && changes.length && Number(req.body.id) === req.user.id) {

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

						email.sendEmailChangeEmail(req.body.email, req.body.username || req.user.username, validationCode)
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

						const token = jwt.sign({
							email: req.body.email || req.user.email,
							id: req.body.id,
							permissions: req.user.permissions.sort(),
							username: req.body.username || req.user.username,
						},
						process.env.ROLLCAL_API_SECRET,
						{ expiresIn: 15 * 60 * 1000 });

						res.status(200).json({
							response: {
								email: req.body.email || req.user.email,
								id: req.body.id,
								permissions: req.user.permissions.sort().join(","),
								token,
								username: req.body.username || req.user.username,
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

router.post("/validateAccount", upload.array(), (req: Request, res: Response) => {

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

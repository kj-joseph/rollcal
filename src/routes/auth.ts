import { Request, Response, Router } from "express";
import { FieldInfo, MysqlError } from "mysql";

import multer from "multer";
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

router.post("/login", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(
			`select user_id, user_isadmin, user_name from users where user_email ${res.locals.connection.escape(req.body.email)}`
			+ ` and user_password=sha2(${res.locals.connection.escape(req.body.password)}, 256) and user_validated = 1`,
		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else if (results.length !== 1) {
				res.locals.connection.end();
				res.status(401).send();

			} else {

				const now = new Date();
				const sessionId = generateHash(results[0].user_name + results[0].user_id + now.getTime());

				res.locals.connection.query(
					`insert into user_sessions values (${res.locals.connection.escape(sessionId)}, now(), now(), `
					+ `${res.locals.connection.escape(results[0].user_id)}, ${res.locals.connection.escape(results[0].user_isadmin)})`,
					(insertError: MysqlError, insertResults: any) => {

						if (insertError) {
							res.locals.connection.end();
							console.error(error);
							res.status(500).send();

						} else {

							res.locals.connection.end();
							res.status(200).send(JSON.stringify({
								response: {
									isAdmin: results[0].user_isadmin,
									sessionId,
									userId: results[0].user_id,
									userName: results[0].user_name,
								}}));

						}

					});

			}

	});

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

router.post("/checkSession", upload.array(), (req: Request, res: Response) => {

	if (!req.body.sessionId || !req.body.userId || !req.body.isAdmin) {
		console.error();
		res.status(500).send();

	} else {
		res.locals.connection.query("select sessionId from user_sessions"
			+ ` where userId = ${res.locals.connection.escape(req.body.userId)}`
			+ ` and sessionId = ${res.locals.connection.escape(req.body.sessionId)}`
			+ ` and isAdmin = ${res.locals.connection.escape(req.body.isAdmin)}`
			+ " and touched > date_sub(now(), interval 30 minute)",

			(error: MysqlError, results: any) => {

				if (error) {
					console.error(error);
					res.status(500).send();
				} else {
					if (results.length === 1) {

						res.locals.connection.query(
							`update user_sessions set touched = now() where sessionId = ${res.locals.connection.escape(req.body.sessionId)}`);

						res.status(200).send(JSON.stringify({
							response: true,
						}));

					} else {

						res.locals.connection.query(
							`delete from user_sessions where userId = ${res.locals.connection.escape(req.params.userId)}`,
							(deleteError: MysqlError, deleteResults: any) => {
								if (deleteError) {
									res.status(500).send();
								} else {
									res.status(200).send(JSON.stringify({
										response: false,
									}));
								}
							});

					}

				}

			});

	}

});


router.post("/register/checkEmail", upload.array(), (req: Request, res: Response) => {

	res.locals.connection.query(
		`select user_email from users where user_email = ${res.locals.connection.escape(req.body.email)}`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).send(JSON.stringify({
					response: (!!results.length),
				}));

			}

		});

});


router.post("/register", upload.array(), (req: Request, res: Response) => {

	const validationCode = generateHash(req.body.username + req.body.email);

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
				res.status(200).send(JSON.stringify({
					response: {
						validationCode,
					}}));

			}

		});

});


router.post("/validate", upload.array(), (req: Request, res: Response) => {

	res.locals.connection.query("select user_id from users where"
		+ ` user_name = ${res.locals.connection.escape(req.body.username)}`
		+ ` and user_email = ${res.locals.connection.escape(req.body.email)}`
		+ ` and user_validation_code = ${res.locals.connection.escape(req.body.validationCode)}`,

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
								res.status(200).send(JSON.stringify({
									response: true,
								}));
							}

						});

				} else {
					res.status(401).send();
				}

			}

		});

});

export default router;

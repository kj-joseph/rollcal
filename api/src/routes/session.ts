import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

const router = Router();
const upload = multer();


router.get("/", upload.array(), checkSession("user"), (req: Request, res: Response) => {

	res.status(200).json({
		user_email: req.session.user.email,
		user_id: req.session.user.id,
		user_name: req.session.user.username,
		user_roles: req.session.user.roles,
	});

});


router.post("/", upload.array(), (req: Request, res: Response) => {

	if (req.body.email && req.body.password) {

		res.locals.connection
			.query(`call login(${res.locals.connection.escape(req.body.email)},
				${res.locals.connection.escape(req.body.password)})`,
			(error: MysqlError, results: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
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
						roles: loginResult.user_roles ? loginResult.user_roles.split(",") : [],
						username: loginResult.user_name,
					};

					res.locals.connection.end();
					res.status(200).json({
						user_email: loginResult.user_email,
						user_id: loginResult.user_id,
						user_name: loginResult.user_name,
						user_roles: loginResult.user_roles ? loginResult.user_roles.split(",") : [],
					});

				}

		});

	} else {

		res.status(401).send();

	}

});


router.delete("/", (req: Request, res: Response) => {

	req.session.destroy(() => {
		res.cookie("rollCalAuthCookie", "", {
			path: "/",
		}).status(200).send();
	});

});


export default router;

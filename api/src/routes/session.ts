import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbObject } from "lib/db";

import { mapUser } from "mapping/userMaps";

import { IDBUserInfo } from "interfaces/user";

const router = Router();
const upload = multer();


router.get("/", checkSession("user"), (req: Request, res: Response) => {

	res.status(200).json(req.session.user);

});


router.post("/", upload.array(), (req: Request, res: Response) => {

	if (req.body.email && req.body.password) {

		res.locals.connection
			.query(`call login(${res.locals.connection.escape(req.body.email)},
				${res.locals.connection.escape(req.body.password)})`,
			(error: MysqlError, response: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else if (response[0].length !== 1) {

					res.locals.connection.end();
					res.status(403).json(
						{
							error: "Username and/or password is incorrect",
							success: false,
							token: null,
						});

				} else {

					const loginData: IDBUserInfo = dbObject(response[0]);

					const userInfo = mapUser(loginData);

					req.session.user = userInfo;

					res.locals.connection.end();
					res.status(200).json(userInfo);

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

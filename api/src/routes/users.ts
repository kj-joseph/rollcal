import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

import { IDBUserInfo, IUserInfo } from "interfaces/user";

const router = Router();


router.get("/", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call searchUsers(${res.locals.connection.escape(req.query.search)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const userData: IDBUserInfo[] = results[0].map((row: {}) => ({...row}));

				if (!userData || !userData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const userList: IUserInfo[] = userData
						.map((user) => ({
							email: user.user_email,
							id: user.user_id,
							name: user.user_name,
							roles: user.user_roles,
							status: user.user_status,
						}));

					res.locals.connection.end();
					res.status(200).json(userList);

				}

			}

		});

});


export default router;

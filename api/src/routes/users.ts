import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbArray } from "lib/db";

import { mapUser } from "mapping/userMaps";

import { IDBUserInfo, IUserInfo } from "interfaces/user";

const router = Router();


router.get("/", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call searchUsers(${res.locals.connection.escape(req.query.search)})`,

		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const userData: IDBUserInfo[] = dbArray(response[0]);

				if (!userData || !userData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const userList: IUserInfo[] = userData
						.map((user) =>
							mapUser(user));

					res.locals.connection.end();
					res.status(200).json(userList);

				}

			}

		});

});


export default router;

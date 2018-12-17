import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { mapRole } from "mapping/roleMaps";

import { IDBUserRole, IUserRole } from "interfaces/user";

const router = Router();


router.get("/", (req: Request, res: Response) => {

	res.locals.connection.query("call getRolesList()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const result: IDBUserRole[] = results[0];

				if (!result || !result.length) {

					res.locals.connection.end();
					res.status(205).json();

				} else {

					const roleList: IUserRole[] = result
						.map((row) => mapRole(row));

					res.locals.connection.end();
					res.status(200).json(roleList);

				}

			}
		});
});


export default router;

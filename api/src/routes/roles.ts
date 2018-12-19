import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray } from "lib/db";

import { mapRole } from "mapping/roleMaps";

import { IDBUserRole } from "interfaces/user";

const router = Router();


router.get("/", (req: Request, res: Response) => {

	res.locals.connection.query("call getRolesList()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const result: IDBUserRole[] = dbArray(results[0]);

				if (!result || !result.length) {

					res.locals.connection.end();
					res.status(205).json();

				} else {

					const roleList = result
						.map((row) => mapRole(row));

					res.locals.connection.end();
					res.status(200).json(roleList);

				}

			}
		});
});


export default router;

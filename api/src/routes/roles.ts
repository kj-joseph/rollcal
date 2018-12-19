import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray } from "lib/db";

import { mapRole } from "mapping/roleMaps";

import { IDBUserRole } from "interfaces/user";

const router = Router();


router.get("/", (req: Request, res: Response) => {

	res.locals.connection.query("call getRolesList()",
		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const rolesData: IDBUserRole[] = dbArray(response[0]);

				if (!rolesData || !rolesData.length) {

					res.locals.connection.end();
					res.status(205).json();

				} else {

					const roleList = rolesData
						.map((row) => mapRole(row));

					res.locals.connection.end();
					res.status(200).json(roleList);

				}

			}
		});
});


export default router;

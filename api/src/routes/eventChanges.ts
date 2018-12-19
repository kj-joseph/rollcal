import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbArray } from "lib/db";

import { IDBDerbyEventChange } from "interfaces/event";

import { mapEventChange } from "mapping/eventChangeMaps";

const router = Router();


router.get("/", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventChangeList(${res.locals.connection.escape(req.session.user.id)})`,

		(error: MysqlError, response: any) => {

			if (error) {

				console.error(error);
				res.locals.connection.end();
				res.status(500).send();

			} else {

				const eventChangeData: IDBDerbyEventChange[] = dbArray(response[0]);

				const eventChangeList = eventChangeData
					.map((change) =>
						mapEventChange(change));

				res.locals.connection.end();
				res.status(200).json(eventChangeList);

			}
		});

});


export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbArray } from "lib/db";

import { mapVenueChange } from "mapping/venueChangeMaps";

import { IDBDerbyVenueChange } from "interfaces/venue";

const router = Router();


router.get("/", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueChangeList(${res.locals.connection.escape(req.session.user.id)})`,

		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const changeData: IDBDerbyVenueChange[] = dbArray(response[0]);

				if (!changeData || !changeData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const changeList = changeData
						.map((change) =>
							mapVenueChange(change));

					res.locals.connection.end();
					res.status(200).json(changeList);

				}

			}
		});

});


export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { IDBTimeZone } from "interfaces/time";

import { dbArray } from "lib/db";

import { mapTimezone } from "mapping/timeMaps";

const router = Router();

router.get("/", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getTimeZones()",
		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const timezoneData: IDBTimeZone[] = dbArray(response[0]);

				if (!timezoneData || !timezoneData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const timezoneList = timezoneData
						.map((timezone) =>
							mapTimezone(timezone));

					res.locals.connection.end();
					res.status(200).json(timezoneList);

				}

			}
		});
});

export default router;

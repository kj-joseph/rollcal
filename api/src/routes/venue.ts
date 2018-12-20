import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbObject } from "lib/db";

import { mapVenue } from "mapping/venueMaps";

import { IDBDerbyVenue, IDerbyVenue } from "interfaces/venue";

const router = Router();

router.get("/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueDetails(${res.locals.connection.escape(req.params.id)})`,
		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const venueData: IDBDerbyVenue = dbObject(response[0]);

				if (!venueData) {

					res.locals.connection.end();
					res.status(404).json();

				} else {

					const venue: IDerbyVenue = mapVenue(venueData);

					res.locals.connection.end();
					res.status(200).json(venue);

				}



			}

		});
});


export default router;

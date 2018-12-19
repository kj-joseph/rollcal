import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { IDBDerbyVenue, IDerbyVenue } from "interfaces/venue";

import { mapVenue } from "mapping/venueMaps";

const router = Router();


router.get("/", (req: Request, res: Response) => {

	res.locals.connection
		.query(req.query.user ?
			`call getVenuesByUsder(${res.locals.connection.escape(req.query.user)})`
			: "call getAllVenues()",
		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const venueData: IDBDerbyVenue[] = response[0];

				if (!venueData || !venueData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const venueList: IDerbyVenue[] = venueData
						.map((venue) =>
							mapVenue(venue));

					res.locals.connection.end();
					res.status(200).json(venueList);


				}

			}

		});

});


export default router;

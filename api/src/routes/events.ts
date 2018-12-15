import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { IGeocode } from "interfaces/geo";

import { getGeocode } from "lib/googleMaps";

const router = Router();

router.get("/", (req: Request, res: Response) => {

	let lat: number = null;
	let lng: number = null;
	let geocodeError = false;

	const runSearchQuery = () => {

		// procedure parameters: user, start date, end date, derbytypes, sanctions, tracks, locations, latitude, longitute, distance limit, start, count
		res.locals.connection.query(
			`call searchEvents(
				${req.query.user ? res.locals.connection.escape(req.query.user) : null},
				${req.query.startDate ? res.locals.connection.escape(req.query.startDate) : null},
				${req.query.endDate ? res.locals.connection.escape(req.query.endDate) : null},
				${req.query.derbytypes ? res.locals.connection.escape(req.query.derbytypes) : null},
				${req.query.sanctions ? res.locals.connection.escape(req.query.sanctions) : null},
				${req.query.tracks ? res.locals.connection.escape(req.query.tracks) : null},
				${!req.query.address && req.query.locations ? res.locals.connection.escape(req.query.locations) : null},
				${lat && !geocodeError ? res.locals.connection.escape(lat) : null},
				${lng && !geocodeError ? res.locals.connection.escape(lng) : null},
				${lat && lng && !geocodeError && req.query.distance ? res.locals.connection.escape(req.query.distance) : null},
				${req.query.start ? res.locals.connection.escape(req.query.start) : null},
				${req.query.count ?
					(req.query.count === "all"
						? 65535 : res.locals.connection.escape(req.query.count))
					: null}
			)`, (eventError: MysqlError, eventResults: any) => {

				if (eventError) {
					res.locals.connection.end();
					console.error(eventError);
					res.status(500).send();

				} else {

					res.locals.connection.end();
					res.status(200).json({
						events: eventResults[0].map((row: {}) => ({...row})),
						total: eventResults[1].map((row: {}) => ({...row}))[0].eventCount,
					});

				}

		});
	};

	if (req.query.address && req.query.distance) {

		getGeocode(req.query.address, req.query.country)
			.then((geocode: IGeocode) => {

				if (geocode) {
					({lat, lng} = geocode);
				} else {
					geocodeError = true;
				}

				runSearchQuery();

			}).catch((error: Error) => {
				console.error(error);

				geocodeError = true;
				runSearchQuery();
			});

	} else {

		runSearchQuery();

	}

});

export default router;

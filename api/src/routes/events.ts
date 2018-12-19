import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray, dbObject } from "lib/db";
import { getGeocode } from "lib/googleMaps";

import { mapEvent } from "mapping/eventMaps";

import { IDBDerbyEvent } from "interfaces/event";
import { IGeocode } from "interfaces/geo";

const router = Router();

router.get("/", (req: Request, res: Response) => {

	let lat: number = null;
	let lng: number = null;
	let geocodeError = false;

	const runSearchQuery = () => {

		// procedure parameters: user, start date, end date, features, locations, latitude, longitute, distance limit, start, count
		const query =
			`call searchEvents(
				${req.query.user ?
					res.locals.connection.escape(req.query.user)
				: null},
				${req.query.startDate ?
					res.locals.connection.escape(req.query.startDate)
				: null},
				${req.query.endDate ?
					res.locals.connection.escape(req.query.endDate)
				: null},
				${req.query.features ?
					res.locals.connection.escape(req.query.features)
				: null},
				${!req.query.address && req.query.locations ?
					res.locals.connection.escape(req.query.locations)
					: null},
				${lat && !geocodeError ?
					res.locals.connection.escape(lat)
				: null},
				${lng && !geocodeError ?
					res.locals.connection.escape(lng)
				: null},
				${lat && lng && !geocodeError && req.query.distance ?
					res.locals.connection.escape(req.query.distance)
				: null},
				${req.query.start ?
					res.locals.connection.escape(req.query.start)
				: 0},
				${!req.query.count || req.query.count === "all"
					? 65535
				: res.locals.connection.escape(req.query.count)}
			)`;

		res.locals.connection.query(query,
			(eventError: MysqlError, response: any) => {

			if (eventError) {

				console.error(eventError);
				res.locals.connection.end();
				res.status(500).send();

			} else {

				const eventData: IDBDerbyEvent[] = dbArray(response[0]);
				const totalEvents: number = dbObject(response[1]).eventCount;

				if (!eventData || !eventData.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const eventList = eventData
						.map((event) =>
							mapEvent(event));

					res.locals.connection.end();
					res.status(200).json({
						events: eventList,
						total: totalEvents,
					});

				}

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

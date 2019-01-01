import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray, dbObject } from "lib/db";
import { getGeocode } from "lib/googleMaps";

import { mapDay, mapEvent } from "mapping/eventMaps";

import iCal from "ical-generator";
import moment from "moment";

import { IDBDerbyEvent, IDBDerbyEventDay } from "interfaces/event";
import { IGeocode } from "interfaces/geo";

const router = Router();

router.get("/:format?", (req: Request, res: Response) => {

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

					if (req.params.format === "ical") {

						const calendar = iCal({
							domain: "roll-cal.com",
							name: "Roll-Cal",
							prodId: {
								company: "Roll-Cal",
								language: "EN",
								product: "Roll-Cal.com",
							},
							ttl: 60 * 60 * 4, // 4 h
							url: `https://www.roll-cal.com/api${req.originalUrl}`,
						});


						const eventPromises: Array<Promise<void>> = eventList.map((event) =>

							new Promise((resolve, reject) => {

								res.locals.connection
									.query(`call getEventDays(${res.locals.connection.escape(event.id)})`,

									(daysError: MysqlError, daysResponse: any) => {

										if (daysError) {

											reject(daysError);

										} else {

											const daysData: IDBDerbyEventDay[] = dbArray(daysResponse[0]);

											event.days = daysData
												.map((dayData: IDBDerbyEventDay) =>
													mapDay(dayData));

											mapDay(daysResponse);

											const isMultiDay = event.days.length > 1;

											const venueLocation = `${event.venue.name
												}, ${event.venue.address1 ?
													`${event.venue.address1}, `
												: ""}${event.venue.address2 ?
													`${event.venue.address2}, `
												: ""}${event.venue.city}${event.venue.region && event.venue.region.name ?
													`, ${event.venue.region.name}`
												: ""}${event.venue.postcode ?
													` ${event.venue.postcode}`
												: ""}, ${event.venue.country.name}`;

											const eventSummary = event.name ?
													`${event.name} (hosted by ${event.host})`
												: event.host;

											let dayCounter = 0;

											event.days.forEach((day) => {

												dayCounter ++;

												calendar.createEvent({
													description:
														(isMultiDay ?
															`Day ${dayCounter} of ${event.days.length}\n`
														: "")
														+ `Start time: ${moment.utc(day.startTime, "h:mm:ss").format("h:mm a")}`
														+ (day.doorsTime ?
															`\nDoors open at ${moment.utc(day.doorsTime, "h:mm:ss").format("h:mm a")}`
														: "")
														+ (day.description ?
															`\n\n${day.description}`
														: "")
														+ (event.description ?
															`\n\n-----\n\n${event.description}`
														: ""),
													location: venueLocation,
													start: moment(event.days[0].startTimeUTC),
													summary: eventSummary,
													timestamp: event.updated,
													uid: `${event.id}${isMultiDay ?
															`.${dayCounter}` : ""}`,
													url: event.link || `https://roll-cal.com/event/${event.id}`,
												});

											});

											resolve();

										}

									});

							}));


						Promise.all(eventPromises)
							.then(() => {

								res.locals.connection.end();
								calendar.serve(res, null);

							})
							.catch((error) => {

								console.error(error);
								res.locals.connection.end();
								res.status(500).send();

							});

					} else {

						res.locals.connection.end();
						res.status(200).json({
							events: eventList,
							total: totalEvents,
						});

					}

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

import { Request, Response, Router } from "express";
import { FieldInfo, MysqlError } from "mysql";

const router = Router();

router.get("/getEventDetails/:eventId", (req: Request, res: Response) => {

	const timezone = req.query.timezone || "UTC";

	res.locals.connection.query("select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name"
		+ " from events e, countries c, users u, timezones tz,"
		+ " (select * from venues left outer join regions on region_id = venue_region) as vr"
		+ " where event_id = " + res.locals.connection.escape(req.params.eventId)
		+ " and event_approved = 1"
		+ " and venue_id = event_venue and country_code = venue_country"
		+ " and event_user = user_id and timezone_id = event_timezone",

		(error: MysqlError, results: any) => {
			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else if (!results.length) {
				res.locals.connection.end();
				res.status(200).send(JSON.stringify({
					response: null,
				}));

			} else {

				const eventResult = results[0];

				const query = "select *, " +
					" convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(eventResult.timezone_zone) + ") as eventday_start_venue," +
					" convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(eventResult.timezone_zone) + ") as eventday_end_venue," +
					" convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_start_user," +
					" convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_end_user" +
					" from eventdays where eventday_event = " + res.locals.connection.escape(req.params.eventId);

				res.locals.connection.query(query,
					(daysError: MysqlError, daysResults: any) => {
						if (daysError) {
							console.error(daysError);
							res.status(500).send();

						} else {

							eventResult.days = daysResults;

							res.locals.connection.query("select s.sanction_name, s.sanction_abbreviation"
								+ " from sanctions s, event_sanctions es"
								+ " where s.sanction_id = es.sanction"
								+ " and es.event = " + res.locals.connection.escape(req.params.eventId)
								+ " order by sanction_name",
								(sanctionError: MysqlError, sanctionResults: any) => {
									if (sanctionError) {
										res.locals.connection.end();
										console.error(sanctionError);
										res.status(500).send();

									} else {

										eventResult.sanctions = sanctionResults;

										res.locals.connection.query("select dt.derbytype_name, dt.derbytype_abbreviation"
											+ " from derbytypes dt, event_derbytypes ed"
											+ " where dt.derbytype_id = ed.derbytype"
											+ " and ed.event = " + res.locals.connection.escape(req.params.eventId)
											+ " order by derbytype_name",
											(typesError: MysqlError, typesResults: any) => {
												if (typesError) {
													console.error(typesError);
													res.status(500).send();

												} else {

													eventResult.derbytypes = typesResults;

													res.locals.connection.query("select t.track_name, t.track_abbreviation"
														+ " from tracks t, event_tracks et"
														+ " where t.track_id = et.track"
														+ " and et.event = " + res.locals.connection.escape(req.params.eventId)
														+ " order by track_name",
														(tracksError: MysqlError, tracksResults: any) => {
															if (tracksError) {
																console.error(tracksError);
																res.status(500).send();

															} else {

																eventResult.tracks = tracksResults;

																res.locals.connection.end();
																res.status(200).send(JSON.stringify({
																	response: [eventResult],
																}));

															}
														});

												}
											});

									}
								});

						}
					});

			}
		});

});


router.get("/search", (req: Request, res: Response) => {

	const timezone = req.query.timezone || "UTC";

	const query = {
		from: " from events e inner join eventdays"
			+ " on eventday_event = event_id,"
			+ " countries c, timezones tz, users u,"
			+ " (select * from venues left outer join regions on region_id = venue_region) vr",
		order: "",
		select: "select distinct e.*, c.*, vr.*, tz.timezone_zone, u.user_id, u.user_name",
		where: " where event_approved = 1"
			+ " and vr.venue_id = event_venue and country_code = vr.venue_country"
			+ " and event_user = user_id and timezone_id = event_timezone",
	};

	if (req.query.startDate) {
		query.where += ` and eventday_start >= convert_tz(${res.locals.connection.escape(req.query.startDate + "T00:00:00.000")},`
		+ `${res.locals.connection.escape(timezone)}, 'UTC')`;
	}

	if (req.query.endDate) {
		query.where += ` and eventday_start >= convert_tz(${res.locals.connection.escape(req.query.endDate + "T23:59:59.999")},`
		+ `${res.locals.connection.escape(timezone)}, 'UTC')`;
	}

	if (req.query.locations) {
		const locations = req.query.locations.split(";");
		query.from += ", venues v";
		query.where += " and event_venue = v.venue_id and (";
		for (let c = 0; c < locations.length; c++) {
			query.where += (c > 0 ? " or " : "");
			if (locations[c].match("-")) {
				const loc = locations[c].split("-");
				const reg = loc[1].split(",");
				query.where += "(v.venue_country = " + res.locals.connection.escape(loc[0]) + " and v.venue_region in (";
				for (let r = 0; r < reg.length; r ++) {
					query.where += (r > 0 ? "," : "") + res.locals.connection.escape(reg[r]);
				}

				query.where += ") )";
			} else {
				query.where += "v.venue_country = " + res.locals.connection.escape(locations[c]);
			}
		}
		query.where += ")";
	}

	if (req.query.derbytypes) {
		const derbytypes = req.query.derbytypes.split(",");
		query.from += ", event_derbytypes dt";
		query.where += " and dt.event = event_id and (";
		for (let t = 0; t < derbytypes.length; t++) {
			query.where += (t > 0 ? " or" : "") + " dt.derbytype = " + res.locals.connection.escape(derbytypes[t]);
		}
		query.where += ")";
	}

	if (req.query.sanctions) {
		const sanctions = req.query.sanctions.split(",");
		query.from += ", event_sanctions es";
		query.where += " and es.event = event_id and (";
		for (let t = 0; t < sanctions.length; t++) {
			query.where += (t > 0 ? " or" : "") + " es.sanction = " + res.locals.connection.escape(sanctions[t]);
		}
		query.where += ")";
	}

	if (req.query.tracks) {
		const tracks = req.query.tracks.split(",");
		query.from += ", event_tracks et";
		query.where += " and et.event = event_id and (";
		for (let t = 0; t < tracks.length; t++) {
			query.where += (t > 0 ? " or" : "") + " et.track = " + res.locals.connection.escape(tracks[t]);
		}
		query.where += ")";
	}

	res.locals.connection.query(
		"select *"
		+ " from (" + query.select + query.from + query.where + query.order + ") subquery"
		+ " join (select eventday_event, min(eventday_start) eds from eventdays group by eventday_event) ed"
		+ " on ed.eventday_event = subquery.event_id "
		+ " order by eds",
		(eventError: MysqlError, eventResults: any) => {
			if (eventError) {
				res.locals.connection.end();
				console.error(eventError);
				res.status(500).send();
			} else if (!eventResults.length) {
				res.locals.connection.end();

				res.status(200).send(JSON.stringify({
					response: [],
				}));

			} else {

				const promises = [];

				for (const i in eventResults) {
						if (eventResults.hasOwnProperty(i)) {

						promises.push(new Promise((resolve, reject) => {

							res.locals.connection.query("select *, "
								+ " convert_tz(eventday_start, 'UTC'," + res.locals.connection.escape(eventResults[i].timezone_zone) + ") as eventday_start_venue,"
								+ " convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(eventResults[i].timezone_zone) + ") as eventday_end_venue,"
								+ " convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_start_user,"
								+ " convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_end_user"
								+ " from eventdays where eventday_event = " + res.locals.connection.escape(eventResults[i].event_id),
								(error: MysqlError, results: any) => {
									if (error) {
										reject(error);
									} else {

										eventResults[i].days = results;

										res.locals.connection.query("select s.sanction_name, s.sanction_abbreviation"
											+ " from sanctions s, event_sanctions es"
											+ " where s.sanction_id = es.sanction"
											+ " and es.event = " + res.locals.connection.escape(eventResults[i].event_id)
											+ " order by sanction_name",
											(sanctionError: MysqlError, sanctionResults: any) => {
												if (sanctionError) {
													reject(sanctionError);
												} else {

													eventResults[i].sanctions = sanctionResults;

													res.locals.connection.query("select dt.derbytype_name, dt.derbytype_abbreviation"
														+ " from derbytypes dt, event_derbytypes ed"
														+ " where dt.derbytype_id = ed.derbytype"
														+ " and ed.event = " + res.locals.connection.escape(eventResults[i].event_id)
														+ " order by derbytype_name",
														(typesError: MysqlError, typesResults: any) => {
															if (typesError) {
																reject(typesError);
															} else {

																eventResults[i].derbytypes = typesResults;

																res.locals.connection.query("select t.track_name, t.track_abbreviation"
																	+ " from tracks t, event_tracks et"
																	+ " where t.track_id = et.track"
																	+ " and et.event = " + res.locals.connection.escape(eventResults[i].event_id)
																	+ " order by track_name",
																	(tracksError: MysqlError, tracksResults: any) => {

																		if (tracksError) {
																			reject(tracksError);
																		} else {
																			eventResults[i].tracks = tracksResults;

																			resolve(eventResults[i]);
																		}
																	});

															}
														});

												}
											});

									}
								});

						})); // end promise

					}
				}

				Promise.all(promises).then((results) => {

					res.locals.connection.end();
					res.status(200).send(JSON.stringify({
						response: results,
					}));

				}, (error) => {

					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				});

			}
		});
});

export default router;

const express = require("express");
const router = express.Router();

router.get("/getEventDetails/:eventId", (req, res, next) => {

	let timezone = req.query.timezone || "UTC";

	res.locals.connection.query("select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name"
		+ " from events e, countries c, users u, timezones tz,"
		+ " (select * from venues left outer join regions on region_id = venue_region) as vr"
		+ " where event_id = " + res.locals.connection.escape(req.params.eventId)
		+ " and event_approved = 1"
		+ " and venue_id = event_venue and country_code = venue_country"
		+ " and event_user = user_id and timezone_id = event_timezone",

		(error, results, fields) => {
			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.send(JSON.stringify({
					status: 500,
					response: "There was an error.  Please try again."
				}));
			} else if (!results.length) {
				res.locals.connection.end();
				res.send(JSON.stringify({
					status: 200,
					error: null,
					response: []
				}));
			} else {

				let eventResult = results[0];

				let query = "select *, " +
					" convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(eventResult.timezone_zone) + ") as eventday_start_venue," +
					" convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(eventResult.timezone_zone) + ") as eventday_end_venue," +
					" convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_start_user," +
					" convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_end_user" +
					" from eventdays where eventday_event = " + res.locals.connection.escape(req.params.eventId);

				res.locals.connection.query(query,
					(error, results, fields) => {
						if (error) {
							res.locals.connection.end();
							console.error(error);
							res.send(JSON.stringify({
								status: 500,
								response: "There was an error.  Please try again."
							}));
							next();
						} else {

							eventResult.days = results;

							res.locals.connection.query("select s.sanction_name, s.sanction_abbreviation"
								+ " from sanctions s, event_sanctions es"
								+ " where s.sanction_id = es.sanction"
								+ " and es.event = " + res.locals.connection.escape(req.params.eventId)
								+ " order by sanction_name",
								(error, results, fields) => {
									if (error) {
										res.locals.connection.end();
										console.error(error);
										res.send(JSON.stringify({
											status: 500,
											response: "There was an error.  Please try again."
										}));
									} else {

										eventResult.sanctions = results;

										res.locals.connection.query("select dt.derbytype_name, dt.derbytype_abbreviation"
											+ " from derbytypes dt, event_derbytypes ed"
											+ " where dt.derbytype_id = ed.derbytype"
											+ " and ed.event = " + res.locals.connection.escape(req.params.eventId)
											+ " order by derbytype_name",
											(error, results, fields) => {
												if (error) {
													res.locals.connection.end();
													console.error(error);
													res.send(JSON.stringify({
														status: 500,
														response: "There was an error.  Please try again."
													}));
												} else {

													eventResult.derbytypes = results;

													res.locals.connection.query("select t.track_name, t.track_abbreviation"
														+ " from tracks t, event_tracks et"
														+ " where t.track_id = et.track"
														+ " and et.event = " + res.locals.connection.escape(req.params.eventId)
														+ " order by track_name",
														(error, results, fields) => {
															if (error) {
																res.locals.connection.end();
																console.error(error);
																res.send(JSON.stringify({
																	status: 500,
																	response: "There was an error.  Please try again."
																}));
															} else {

																eventResult.tracks = results;

																res.locals.connection.end();
																res.send(JSON.stringify({
																	status: 200,
																	error: null,
																	response: [eventResult]
																}));

															}
														}
													);

												}
											}
										);

									}
								}
							);

						}
					}
				);

			}
		}
	);

});


router.get("/search", (req, res, next) => {

	let timezone = req.query.timezone || "UTC";

	let query = {
		select: "select distinct e.*, c.*, vr.*, tz.timezone_zone, u.user_id, u.user_name",
		from: " from events e inner join eventdays"
			+ " on eventday_event = event_id,"
			+ " countries c, timezones tz, users u,"
			+ " (select * from venues left outer join regions on region_id = venue_region) vr",
		where: " where event_approved = 1"
			+ " and vr.venue_id = event_venue and country_code = vr.venue_country"
			+ " and event_user = user_id and timezone_id = event_timezone",
		order: " order by eventday_start"
	}

	if (req.query.startDate) {
		query.where += " and eventday_start >= convert_tz(" + res.locals.connection.escape(req.query.startDate + "T00:00:00.000") + ", " + res.locals.connection.escape(timezone) + ", 'UTC')";
	}

	if (req.query.endDate) {
		query.where += " and eventday_start <= convert_tz(" + res.locals.connection.escape(req.query.endDate + "T23:59:59.999") + ", " + res.locals.connection.escape(timezone) + ", 'UTC')";
	}

	if (req.query.locations) {
		let locations = req.query.locations.split(";");
		query.from += ", venues v";
		query.where += " and event_venue = v.venue_id and (";
		for (let c = 0; c < locations.length; c++) {
			query.where += (c > 0 ? " or " : "");
			if (locations[c].match("-")) {
				let loc = locations[c].split("-");
				let reg = loc[1].split(",")
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
		let derbytypes = req.query.derbytypes.split(",");
		query.from += ", event_derbytypes dt";
		query.where += " and dt.event = event_id and (";
		for (let t = 0; t < derbytypes.length; t++) {
			query.where += (t > 0 ? " or" : "") + " dt.derbytype = " + res.locals.connection.escape(derbytypes[t]);
		}
		query.where += ")"
	}

	if (req.query.sanctions) {
		let sanctions = req.query.sanctions.split(",");
		query.from += ", event_sanctions es";
		query.where += " and es.event = event_id and (";
		for (let t = 0; t < sanctions.length; t++) {
			query.where += (t > 0 ? " or" : "") + " es.sanction = " + res.locals.connection.escape(sanctions[t]);
		}
		query.where += ")"
	}

	if (req.query.tracks) {
		let tracks = req.query.tracks.split(",");
		query.from += ", event_tracks et";
		query.where += " and et.event = event_id and (";
		for (let t = 0; t < tracks.length; t++) {
			query.where += (t > 0 ? " or" : "") + " et.track = " + res.locals.connection.escape(tracks[t]);
		}
		query.where += ")"
	}

//	console.log(query);
	res.locals.connection.query(query.select + query.from + query.where + query.order,
		(error, eventResults, fields) => {
			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.send(JSON.stringify({
					status: 500,
					response: "There was an error.  Please try again."
				}));
			} else if (!eventResults.length) {
				res.locals.connection.end();

				res.send(JSON.stringify({
					status: 200,
					error: null,
					response: []
				}));

			} else {

				let promises = [];

				for (let i in eventResults) {

					promises.push(new Promise((resolve, reject) => {

						res.locals.connection.query("select *, "
							+ " convert_tz(eventday_start, 'UTC'," + res.locals.connection.escape(eventResults[i].timezone_zone) + ") as eventday_start_venue,"
							+ " convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(eventResults[i].timezone_zone) + ") as eventday_end_venue,"
							+ " convert_tz(eventday_start, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_start_user,"
							+ " convert_tz(eventday_end, 'UTC', " + res.locals.connection.escape(timezone) + ") as eventday_end_user"
							+ " from eventdays where eventday_event = " + res.locals.connection.escape(eventResults[i].event_id),
							(error, results, fields) => {
								if (error) {
									reject(error);
								} else {

									eventResults[i].days = results;

									res.locals.connection.query("select s.sanction_name, s.sanction_abbreviation"
										+ " from sanctions s, event_sanctions es"
										+ " where s.sanction_id = es.sanction"
										+ " and es.event = " + res.locals.connection.escape(eventResults[i].event_id)
										+ " order by sanction_name",
										(error, results, fields) => {
											if (error) {
												reject(error);
											} else {

												eventResults[i].sanctions = results;

												res.locals.connection.query("select dt.derbytype_name, dt.derbytype_abbreviation"
													+ " from derbytypes dt, event_derbytypes ed"
													+ " where dt.derbytype_id = ed.derbytype"
													+ " and ed.event = " + res.locals.connection.escape(eventResults[i].event_id)
													+ " order by derbytype_name",
													(error, results, fields) => {
														if (error) {
															reject(error);
														} else {

															eventResults[i].derbytypes = results;

															res.locals.connection.query("select t.track_name, t.track_abbreviation"
																+ " from tracks t, event_tracks et"
																+ " where t.track_id = et.track"
																+ " and et.event = " + res.locals.connection.escape(eventResults[i].event_id)
																+ " order by track_name",
																(error, results, fields) => {

																	if (error) {
																		reject(error);
																	} else {
																		eventResults[i].tracks = results;

																		resolve(eventResults[i]);
																	}
																}
															);

														}
													}
												);

											}
										}
									);

								}
							}
						);

					})); // end promise

				}

				Promise.all(promises).then((results) => {

					res.locals.connection.end();
					res.send(JSON.stringify({
						status: 200,
						error: null,
						response: results
					}));

				}, (error) => {

					res.locals.connection.end();
					console.error(error);
					res.send(JSON.stringify({
						status: 500,
						response: "There was an error.  Please try again."
					}));

				});

			}
		}
	);
});

module.exports = router;

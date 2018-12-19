import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { IGeocode } from "interfaces/geo";
import { IDBVenueAddress } from "interfaces/venue";

import { checkSession } from "lib/checkSession";
import { dbObject } from "lib/db";
import { sendChangeApprovalEmail, sendChangeRejectionEmail } from "lib/email";
import { getGeocode } from "lib/googleMaps";

import { IDBDerbyVenueChange } from "interfaces/venue";

import { mapVenueChange } from "mapping/venueChangeMaps";

const router = Router();
const upload = multer();


router.post("/", upload.array(), checkSession("user"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call saveVenueChanges(
				${res.locals.connection.escape(req.session.user.id)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(req.body.changeObject)}
			)`,

			(error: MysqlError, results: any) => {
				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					res.locals.connection.end();
					res.status(200).send();

				}
			});

});


router.get("/:changeId", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const changeData: IDBDerbyVenueChange = dbObject(results[0]);

				if (!changeData || !changeData.change_id) {

					res.locals.connection.end();
					res.status(404).send();

				} else {

					const changeList = mapVenueChange(changeData);

					res.locals.connection.end();
					res.status(200).json(changeList);

				}


			}
		});

});


router.put("/:changeId/approval", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call approveVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const returnedData = results[0].map((row: {}) => ({...row}))[0];

				if (returnedData.error) {
					console.error(returnedData.error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					const venue: IDBVenueAddress = results[1].map((row: {}) => ({...row}))[0];

					getGeocode(
						`${venue.venue_address1}, ${venue.venue_city}${
							venue.region_abbreviation ? `, ${venue.region_abbreviation}` : ""
						}${
							venue.venue_postcode ? ` ${venue.venue_postcode}` : ""
						}`,
						venue.country_flag)
						.then((geocode: IGeocode) => {

							if (geocode) {

								res.locals.connection
									.query(`call saveVenueGeocode(
										${res.locals.connection.escape(returnedData.venue_id)},
										${res.locals.connection.escape(geocode.lat)},
										${res.locals.connection.escape(geocode.lng)}
										)`);

							}

						});

					sendChangeApprovalEmail
						(returnedData.email, returnedData.username, req.params.changeId, "venue", returnedData.isNew, returnedData.venue_name)
						.then(() => {

							res.locals.connection.end();
							res.status(200).send({
								success: true,
								venueId: returnedData.venue_id,
							});

						}).catch((mailError: ErrorEventHandler) => {
							console.error(mailError);

							res.locals.connection.end();
							res.status(500).send();

						});

				}
			}
		});

});


router.put("/:changeId/rejection", upload.array(), checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call rejectVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)},
			${res.locals.connection.escape(req.body.comment)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const returnedData = results[0].map((row: {}) => ({...row}))[0];

				if (returnedData.error) {
					console.error(returnedData.error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					sendChangeRejectionEmail
						(returnedData.email, returnedData.username, req.params.changeId, "venue", returnedData.isNew, returnedData.venue_name, req.body.comment)
						.then(() => {

							res.locals.connection.end();
							res.status(200).send({
								success: true,
								venueId: returnedData.venue_id,
							});

						}).catch((mailError: ErrorEventHandler) => {
							console.error(mailError);

							res.locals.connection.end();
							res.status(500).send();

						});

				}
			}
		});

});


export default router;

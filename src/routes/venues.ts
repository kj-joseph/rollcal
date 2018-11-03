import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

const router = Router();
const upload = multer();

router.get("/getAllVenues", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getAllVenues()",
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row})));
			}

		});
});

router.get("/getVenuesByUser/:userId", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenuesByUser(${res.locals.connection.escape(req.params.userId)})`,
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row})));
			}

		});
});


router.get("/getVenueDetails/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueDetails(${res.locals.connection.escape(req.params.id)})`,
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row}))[0]);
			}

		});
});

router.put("/saveChanges", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call saveVenueChanges(
				${res.locals.connection.escape(req.session.user.id)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(req.body.changeObject)}
			)`,

			(error: MysqlError, results: any) => {
				if (error) {
					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				} else {

					res.status(200).send();

				}
			});

});

export default router;

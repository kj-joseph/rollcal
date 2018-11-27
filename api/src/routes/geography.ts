import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/getAllCountries", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getAllCountries()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();
			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));
			}
		});
});

router.get("/getRegionsByCountry/:countryId", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getRegionsByCountry(${res.locals.connection.escape(req.params.countryId)})`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));

			}

		});
});

router.get("/getTimeZones", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getTimeZones()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));

			}
		});
});

export default router;

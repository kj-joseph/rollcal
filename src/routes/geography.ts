import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/getAllCountries", (req: Request, res: Response) => {

	res.locals.connection.query(
		"select * from countries order by country_name",
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();
			} else {
				res.status(200).json({
					response: results,
				});
			}
		});
});

router.get("/getRegionsByCountry/:countryId", (req: Request, res: Response) => {
	const query = `select * from regions where region_country = ${res.locals.connection.escape(req.params.countryId)} order by region_name`;

	res.locals.connection.query(query,
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json({
					response: results,
				});
			}

		});
});

export default router;

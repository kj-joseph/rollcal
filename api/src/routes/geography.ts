import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { IDBGeoCountry, IDBGeoRegion, IGeoCountry } from "interfaces/geo";

import { mapGeography } from "mapping/geoMaps";

const router = Router();

router.get("/countries", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getAllCountries();
			call getAllRegions();`,

		(error: MysqlError, response: any) => {

			if (error) {

				console.error(error);

				res.locals.connection.end();
				res.status(500).send(error);

			} else {

				const countries: IDBGeoCountry[] = response[0].map((row: {}) => ({...row}));
				const regions: IDBGeoRegion[] = response[2].map((row: {}) => ({...row}));

				if (!countries || !countries.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const countryList: IGeoCountry[] = mapGeography(countries, regions);

					res.locals.connection.end();
					res.status(200).json(countryList);

				}

			}

		});
});

export default router;

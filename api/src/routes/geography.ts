import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray } from "lib/db";

import { mapGeography } from "mapping/geoMaps";

import { IDBGeoCountry, IDBGeoRegion } from "interfaces/geo";

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

				const countries: IDBGeoCountry[] = dbArray(response[0]);
				const regions: IDBGeoRegion[] = dbArray(response[2]);

				if (!countries || !countries.length) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const countryList = mapGeography(countries, regions);

					res.locals.connection.end();
					res.status(200).json(countryList);

				}

			}

		});
});

export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { IDBGeoCountry, IDBGeoRegion, IGeoCountry } from "interfaces/geo";

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

					const countryList: IGeoCountry[] = countries
						.map((country): IGeoCountry => ({
							code: country.country_code,
							flag: country.country_flag,
							name: country.country_name,
							regionType: country.country_region_type,
							regions: country.country_region_type ?
								regions
									.filter((region) => region.region_country === country.country_code)
									.map((region) => ({
										abbreviation: region.region_abbreviation,
										country: region.region_country,
										id: region.region_id,
										name: region.region_name,
									}))
								: undefined,
						}));

					res.locals.connection.end();
					res.status(200).json(countryList);

				}

			}

		});
});

export default router;

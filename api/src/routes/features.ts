import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { dbArray } from "lib/db";

import { mapFeatureLists } from "mapping/featureMaps";

import { IDBDerbyFeature, IDBDerbyFeatureType } from "interfaces/feature";

const router = Router();

router.get("/", (req: Request, res: Response) => {

	res.locals.connection.query("call getFeatures()",
		(error: MysqlError, response: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const featureData: IDBDerbyFeature[] = dbArray(response[0]);
				const typeData: IDBDerbyFeatureType[] = dbArray(response[1]);

				if (!featureData || !featureData.length || !typeData || !typeData.length ) {

					res.locals.connection.end();
					res.status(205).send();

				} else {

					const featureTypes = mapFeatureLists(featureData, typeData);

					res.locals.connection.end();
					res.status(200).json(featureTypes);

				}

			}
		});
});

export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();


router.get("/", (req: Request, res: Response) => {

	res.locals.connection.query("call getRolesList()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {
					role_id: number,
					role_name: string,
					role_order: number,
				}) => ({
					id: row.role_id,
					name: row.role_name,
					order: row.role_order,
				})));

			}
		});
});


export default router;

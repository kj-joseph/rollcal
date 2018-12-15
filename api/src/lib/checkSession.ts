import { Request, Response } from "express";

export const checkSession = (role: string) => {

	return (req: Request, res: Response, next: any ) => {

		if (!req.session
			|| !req.session.user
			|| !req.session.user.roles
			|| req.session.user.roles.indexOf(role) === -1) {

				res.locals.connection.end();
				res.status(403).send({
					error: "Unauthorized",
				});

		} else {

			next();

		}


	};

};

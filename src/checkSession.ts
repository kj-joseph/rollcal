import express, { Request, Response, Router } from "express";

import { IRequestWithSession } from "interfaces";

export const checkSession = (role: string) => {

	return (req: IRequestWithSession, res: Response, next: any ) => {

		if (!req.session
			|| !req.session.user
			|| !req.session.user.roles
			|| req.session.user.roles.indexOf(role) === -1) {

				res.status(403).send({
					error: "Unauthorized",
				});

		} else {

			next();

		}


	};

};

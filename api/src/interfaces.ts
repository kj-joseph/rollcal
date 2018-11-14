import { Request } from "express";

export interface IRequestWithSession extends Request {
	session: {
		[key: string]: any;
	};
}

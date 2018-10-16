import { Request } from "express";

export interface IRequestWithUser extends Request {
	user: {
		exp: number,
		iat: number,
		id: number,
		permissions: string[],
		username: string,
	};
}

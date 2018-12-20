import { IDBDerbyEvent } from "interfaces/event";
import { IDBUserInfo, IUserInfo } from "interfaces/user";
import { IDBDerbyVenue } from "interfaces/venue";

export const mapUser = (
	data: IDBUserInfo | IDBDerbyEvent | IDBDerbyVenue,
): IUserInfo => ({
	email: data.user_email,
	id: data.user_id,
	name: data.user_name,
	roles: data.user_roles ? data.user_roles.split(",") : undefined,
	status: data.user_status,
});

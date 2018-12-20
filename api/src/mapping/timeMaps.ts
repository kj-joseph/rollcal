import { IDBDerbyEvent } from "interfaces/event";
import { IDBTimeZone, ITimeZone } from "interfaces/time";
import { IDBDerbyVenue } from "interfaces/venue";

export const mapTimezone = (
	data: IDBDerbyEvent | IDBDerbyVenue | IDBTimeZone,
): ITimeZone => ({
	id: data.timezone_id,
	name: data.timezone_name,
	zone: data.timezone_zone,
});

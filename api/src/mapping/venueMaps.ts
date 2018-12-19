import { IDBDerbyEvent } from "interfaces/event";
import { IDBDerbyVenue, IDerbyVenue } from "interfaces/venue";

import { mapCountry, mapRegion } from "mapping/geoMaps";
import { mapTimezone } from "mapping/timeMaps";
import { mapUser } from "mapping/userMaps";

export const mapVenue = (
	data: IDBDerbyEvent | IDBDerbyVenue,
): IDerbyVenue => ({
	address1: data.venue_address1,
	address2: data.venue_address2,
	city: data.venue_city,
	country: mapCountry(data),
	description: data.venue_description,
	distance: data.venue_distance,
	id: data.venue_id,
	link: data.venue_link,
	name: data.venue_name,
	postcode: data.venue_postcode,
	region: mapRegion(data),
	timezone: mapTimezone(data),
	user: mapUser(data),
});

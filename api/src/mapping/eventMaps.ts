import { IDBDerbyEvent, IDBDerbyEventChange, IDBDerbyEventDay, IDerbyEvent, IDerbyEventDay } from "interfaces/event";

import { mapUser } from "mapping/userMaps";
import { mapVenue } from "mapping/venueMaps";

import moment from "moment";

export const mapDay = (
	data: IDBDerbyEventDay,
): IDerbyEventDay => ({
	date: moment.utc(data.eventday_start_venue).format("MMM D"),
	dateObject: moment.utc(data.eventday_start_venue),
	description: data.eventday_description,
	doorsTime: data.eventday_doors_venue
		&& data.eventday_doors_venue < data.eventday_start_venue ?
			moment.utc(data.eventday_doors_venue).format("HH:mm:00")
		: undefined,
	doorsTimeUTC: data.eventday_doors,
	id: data.eventday_id,
	startTime: moment.utc(data.eventday_start_venue).format("HH:mm:00"),
	startTimeUTC: data.eventday_datetime,
});

export const mapEvent = (
	data: IDBDerbyEvent | IDBDerbyEventChange,
): IDerbyEvent => ({
	dates: {
			end: moment.utc(data.event_last_day).format("Y-MM-DD"),
			start: moment.utc(data.event_first_day).format("Y-MM-DD"),
		},
	days: data.days && data.days.length ?
		data.days
			.map((day) =>
				mapDay(day))
		: undefined,
	description: data.event_description,
	features: data.event_features ?
		data.event_features.split(",")
	: [],
	host: data.event_host,
	id: data.event_id,
	link: data.event_link,
	name: data.event_name,
	updated: moment.utc(data.event_updated),
	user: mapUser(data),
	venue: mapVenue(data),
});

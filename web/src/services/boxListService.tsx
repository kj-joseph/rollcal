import { IBoxListItem } from "interfaces/boxList";
import { IDerbyEvent } from "interfaces/event";
import { IDerbyVenue } from "interfaces/venue";

export const mapEventsToBoxList = (events: IDerbyEvent[]): IBoxListItem[] =>

	events.map((event): IBoxListItem => ({
		country: event.venue.country,
		dates: event.dates,
		distance: event.venue.distance,
		features: event.features,
		host: event.host,
		id: event.id,
		location: `${event.venue.city}${
				event.venue.region && event.venue.region.abbreviation ? ", " + event.venue.region.abbreviation : ""
			}, ${event.venue.country.code}`,
		name: event.name,
		user: event.user,
	}));

export const mapVenuesToBoxList = (venues: IDerbyVenue[]): IBoxListItem[] =>

	venues.map((venue): IBoxListItem => ({
		country: venue.country,
		id: venue.id,
		location: `${venue.city}${
				venue.region && venue.region.abbreviation ? ", " + venue.region.abbreviation : ""
			}, ${venue.country.code}`,
		name: venue.name,
		user: venue.user,
	}));

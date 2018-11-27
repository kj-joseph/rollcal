import { IDerbyIcons } from "interfaces/feature";
import { INewDerbyVenue } from "interfaces/venue";

import moment from "moment";

export interface IDBDerbyEvent {
	country_code: string;
	country_flag: string;
	country_name: string;
	country_region_type: string;
	days: IDerbyEventDay[];
	derbytypes: string;
	event_approved: number;
	event_description?: string;
	event_eventtype: number;
	event_first_day: string;
	event_host: string;
	event_id: number;
	event_last_day: string;
	event_link?: string;
	event_name?: string;
	event_timezone: number;
	event_user: number;
	event_venue: number;
	region_abbreviation: string;
	region_country: string;
	region_id: number;
	region_name: string;
	sanctions: string;
	timezone_id: number;
	timezone_name: string;
	tracks: string;
	user_id: number;
	user_name: string;
	venue_address1: string;
	venue_address2?: string;
	venue_city: string;
	venue_country: string;
	venue_description?: string;
	venue_id: number;
	venue_link?: string;
	venue_name: string;
	venue_postcode: string;
	venue_region: number;
	venue_user: number;
}

export interface IDBDerbyEventChange extends IDBDerbyEvent {
	change_id: number;
	change_object: string;
	change_submitted: string;
	change_user: number;
	change_user_name: string;
	changed_item_id: number;
}

export interface IDerbyDates {
	firstDay: moment.Moment;
	lastDay?: moment.Moment;
}

export interface IDerbyEvent {
	address1?: string;
	address2?: string;
	country?: string;
	datesVenue?: string;
	days?: IDerbyEventDayFormatted[];
	description?: string;
	link?: string;
	flag?: JSX.Element;
	host?: string;
	icons?: IDerbyIcons;
	id: number;
	location?: string;
	multiDay?: boolean;
	name: string;
	postcode?: string;
	user?: number;
	username?: string;
	venue?: number;
	venueDescription?: string;
	venueLink?: string;
	venueLocation?: string;
	venueName?: string;
}

export interface IDerbyEventChange extends IDerbyEvent {
	changeId: number;
	dayChanges: Array<{
		id: number,
		new?: {
			date?: string,
			description?: string,
			doors?: string,
			start?: string,
		},
		old?: {
			date?: string,
			description?: string,
			doors?: string,
			start?: string,
		},
		startDate: string,
		status: string,
	}>;
	features?: {
		derbytypes?: Array<{
			name: string,
			status: string,
		}>,
		sanctions?: Array<{
			name: string,
			status: string,
		}>,
		tracks?: Array<{
			name: string,
			status: string,
		}>,
	};
	newVenue?: INewDerbyVenue;
	submittedDuration: string;
	submittedTime: string;
	username: string;
	userId?: number;
}

export interface IDerbyEventChangeObject {
	data: Array<{
		field: string,
		value: any,
	}>;
	days: Array<{
		id: number,
		operation: string,
		value: {
			datetime?: string,
			description?: string,
			doors?: string,
		},
	}>;
	features: {
		add: string[],
		delete: string[],
	};
	newVenueData?: INewDerbyVenue;
}

export interface IDerbyEventDay {
	eventday_description?: string;
	eventday_event: number;
	eventday_games?: number;
	eventday_doors: string;
	eventday_doors_user?: string;
	eventday_doors_venue: string;
	eventday_id: number;
	eventday_start: string;
	eventday_start_user?: string;
	eventday_start_venue: string;
}

export interface IDerbyEventDayFormatted {
	date?: string;
	dateObject?: moment.Moment;
	doorsTime?: string;
	editing?: boolean;
	id?: number;
	sortValue?: string;
	startTime: string;
	description?: string;
}

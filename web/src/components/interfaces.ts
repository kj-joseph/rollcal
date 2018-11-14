import moment from "moment";

export interface IBoxListItem {
	address1: string;
	address2?: string;
	changeId?: number;
	countryCode?: string;
	countryFlag?: string;
	countryName?: string;
	datesVenue?: string;
	days?: moment.Moment[];
	host?: string;
	icons?: IDerbyIcons;
	id?: number;
	location: string;
	multiDay?: boolean;
	name: string;
	submittedDuration?: string;
	submittedTime?: string;
	user: string;
	username?: string;
}

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
	change_object: any;
	change_submitted: string;
	change_user: number;
	change_user_name: number;
	changed_item_id: number;
}

export interface IDBDerbyVenue {
	country_code?: string;
	country_name?: string;
	country_flag?: string;
	region_abbreviation?: string;
	region_name?: string;
	venue_id: number;
	venue_user: number;
	venue_name: string;
	venue_address1: string;
	venue_address2: string;
	venue_city: string;
	venue_link: string;
	venue_region: number;
	venue_postcode: string;
	venue_country: string;
	venue_description?: string;
	venue_timezone: number;
}

export interface IDBDerbyVenueChange extends IDBDerbyVenue {
	change_id: number;
	change_object: any;
	change_submitted: string;
	change_user: number;
	change_user_name: number;
	changed_item_id: number;
}

export interface IDerbyDates {
	firstDay: moment.Moment;
	lastDay?: moment.Moment;
}

export interface IDerbyEvent {
	address1: string;
	address2?: string;
	datesVenue: string;
	days?: moment.Moment[];
	event_description?: string;
	event_link?: string;
	flag?: JSX.Element;
	host?: string;
	icons?: IDerbyIcons;
	id: number;
	location: string;
	multiDay: boolean;
	name: string;
	user: string;
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
	date: string;
	dateObject?: moment.Moment;
	doorsTime?: string;
	editing?: boolean;
	id?: number;
	sortValue?: string;
	startTime: string;
	description?: string;
}

export interface IDerbyEventChange extends IDerbyEvent {
	changeId: number;
	changedItemId: number;
	submittedDuration: string;
	submittedTime: string;
	username: string;
	userId?: number;
}

export interface IDerbyFeatures {
	derbytypes: IDerbyType[];
	sanctions: IDerbySanction[];
	tracks: IDerbyTrack[];
}

export interface IDerbyIcon {
	filename: string;
	title: string;
}

export interface IDerbyIcons {
	derbytypes: IDerbyIcon[];
	sanctions: IDerbyIcon[];
	tracks: IDerbyIcon[];
}

export interface IDerbySanction {
	title: string;
	sanction_abbreviation: string;
	sanction_id: number;
	sanction_name: string;
}

export interface IDerbyTrack {
	title: string;
	track_abbreviation: string;
	track_id: number;
	track_name: string;
}

export interface IDerbyType {
	title: string;
	derbytype_abbreviation: string;
	derbytype_id: number;
	derbytype_name: string;
}

export interface IDerbyVenue {
	address1: string;
	address2: string;
	city: string;
	country: string;
	description?: string;
	id: number;
	link?: string;
	location?: string;
	name: string;
	postcode: string;
	region: string;
	user?: number;
}

export interface IDerbyVenueChange extends IDerbyEvent {
	changeId: number;
	changedItemId: number;
	submittedDuration: string;
	submittedTime: string;
	username: string;
	userId?: number;
}

export interface IGeoCountry {
	country_code: string;
	country_name: string;
	country_flag: string;
	country_region_type?: string;
	disabled?: boolean;
}

export interface IGeoData {
	countries: IGeoCountry[];
	regions: IGeoRegionList;
}

export interface IGeoRegion {
	disabled?: boolean;
	region_id: number;
	region_country: string;
	region_name: string;
	region_abbreviation: string;
}

export interface IGeoRegionList {
	[key: string]: IGeoRegion[];
}

export interface IReduxActionType {
	type: string;
	payload: any;
}

export interface ITimeZone {
	timezone_id: number;
	timezone_name: string;
	timezone_zone: string;
}

export interface IUserInfo {
	loggedIn: boolean;
	loggedInUserId: string;
}
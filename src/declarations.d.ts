declare module '*.svg';
declare module '.htaccess';


declare interface ActionType {
	type: string,
	payload: any,
}

declare interface DBDerbyEvent {
	country_code: string,
	country_flag: string,
	country_name: string,
	country_region_type: string,
	days: DerbyEventDays[],
	derbytypes: DerbyType[],
	event_approved: number,
	event_description?: string,
	event_eventtype: number,
	event_host: string,
	event_id: number,
	event_link?: string,
	event_name: string,
	event_timezone: number,
	event_user: number,
	event_venue: number,
	region_abbreviation: string,
	region_country: string,
	region_id: nubmer,
	region_name: string,
	sanctions: DerbySanction[],
	timezone_id: number,
	timezone_name: string,
	tracks: DerbyTrack[],
	user_id: number,
	user_name: string,
	venue_address1: string,
	venue_address2?: string,
	venue_city: string,
	venue_country: string,
	venue_description?: string,
	venue_id: number,
	venue_link?: string,
	venue_name: string,
	venue_postcode: string,
	venue_region: number,
	venue_user: number,
}

declare interface DerbyDate {
	end: string,
	start: string,
}


declare interface DerbyDates {
	firstDay: DerbyDate,
	lastDay: DerbyDate,
}

declare interface DerbyEvent {
	address1: string,
	address2?: string,
	dates_venue: string,
	days?: DerbyDay[],
	event_description?: string,
	event_link?: string,
	flag?: JSX.Element,
	host?: string,
	icons?: DerbyIcons,
	id: number,
	location: string,
	multiDay: boolean,
	name: string,
	user: string,
	venue_description?: string,
	venue_link?: string,
	venue_name: string,
}

declare interface DerbyEventDays {
	eventday_description?: string,
	eventday_end: string,
	eventday_end_user: string,
	eventday_end_venue: string,
	eventday_event: number,
	eventday_games?: number,
	eventday_id: number,
	eventday_start: string,
	eventday_start_user: string,
	eventday_start_venue: string,
}

declare interface DerbyIcon {
	filename: string,
	title: string,
}

declare interface DerbyIcons {
	derbytypes: DerbyIcon[],
	sanctions: DerbyIcon[],
	tracks: DerbyIcon[],
}

declare interface DerbySanction {
	sanction_abbreviation: string,
	sanction_name: string,
}

declare interface DerbyTrack {
	track_abbreviation: string,
	track_name: string,
}

declare interface DerbyType {
	derbytype_abbreviation: string,
	derbytype_name: string,
}

declare interface ReduxActions {
	[key: string]: function,
}

declare interface ReduxStore {
	page?: string,
	lastSearch?: string,
	apiLocation?: string,
	menuDrawerOpen?: boolean,
	loginBoxOpen?: boolean,
	loggedIn?: boolean,
	loggedInUserId?: string,
	loggedInUserAdmin?: string,
	[key: string]: function,
	match: any
}

declare interface UserInfo {
	loggedIn: boolean,
	loggedInUserId: string,
}

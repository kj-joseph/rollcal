import { IDBDerbyVenueChange, IDerbyVenueChange, IDerbyVenueChangeObject } from "interfaces/venue";

import { mapVenue } from "mapping/venueMaps";

import moment from "moment";

export const mapVenueChange = (
	data: IDBDerbyVenueChange,
): IDerbyVenueChange =>

	Object.assign(mapVenue(data), {
		changeId: data.change_id,
		changeObject: data.change_object ?
			parseChangeJson(data.change_object)
			: undefined as IDerbyVenueChangeObject,
		submittedDuration: moment.duration(moment(data.change_submitted).diff(moment())).humanize(),
		submittedTime: moment(data.change_submitted).format("MMM D, Y h:mm a"),
		submitter: {
			id: data.change_user,
			name: data.change_user_name,
		},
	});

const parseChangeJson = (
	jsonString: string,
): IDerbyVenueChangeObject => {

	try {

		return JSON.parse(jsonString);

	} catch {

		return undefined;

	}

};

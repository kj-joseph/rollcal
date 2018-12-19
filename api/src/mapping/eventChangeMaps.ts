import { IDBDerbyEventChange, IDerbyEventChange, IDerbyEventChangeObject } from "interfaces/event";

import { mapEvent } from "mapping/eventMaps";

import moment from "moment";

export const mapEventChange = (
	data: IDBDerbyEventChange,
): IDerbyEventChange =>

	Object.assign(mapEvent(data), {
		changeId: data.change_id,
		changeObject: data.change_object ?
			parseChangeJson(data.change_object)
			: undefined as IDerbyEventChangeObject,
		submittedDuration: moment.duration(moment(data.change_submitted).diff(moment())).humanize(),
		submittedTime: moment(data.change_submitted).format("MMM D, Y h:mm a"),
		submitter: {
			id: data.change_user,
			name: data.change_user_name,
		},
	});

const parseChangeJson = (
	jsonString: string,
): IDerbyEventChangeObject => {

	try {

		return JSON.parse(jsonString);

	} catch {

		return undefined;

	}

};

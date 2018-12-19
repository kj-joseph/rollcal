import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { ITimeZone } from "interfaces/time";

import moment from "moment";

export const formatDateRange = (
	dates: {
		start: moment.Moment;
		end?: moment.Moment;
	},
	monthFormat: "long" | "short" = "short",
): string => {

	const mo = monthFormat === "short" ? "MMM" : "MMMM";
	const ds = "Y-MM-DD";

	if (dates.end) {

		const multiDay = (dates.start.format(ds) !== dates.end.format(ds));
		const differentYear = (multiDay && dates.start.year() !== dates.end.year());
		const differentMonth = (differentYear || (multiDay && dates.start.month() !== dates.end.month()));

		return dates.start.format(mo)
			+ " " + dates.start.date()
			+ (differentYear ? `, ${dates.start.year()}` : "")
			+ (multiDay && !differentMonth ? ` – ${dates.end.date()}` : "")
			+ (differentMonth ? ` – ${dates.end.format(mo)} ${dates.end.date()}` : "")
			+  `, ${dates.end.year()}`;

	} else {

		return dates.start.format(`${mo} D, Y`);

	}

};

export const getTimeZones = ()
	: Promise<ITimeZone[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.timeZones && state.timeZones.length) {

			resolve(state.timeZones);

		} else {

			const apiCall = callApi(
				"get",
				"timezones",
			)
				.then((response) => {

					const timeZoneList: ITimeZone[] = response.data;

					store.dispatch(actions.saveTimeZones(timeZoneList));
					resolve(timeZoneList);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

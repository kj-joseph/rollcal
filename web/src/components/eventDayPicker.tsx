import React from "react";

import { DayPickerSingleDateController } from "react-dates";

import moment from "moment";

import { IDerbyEventDay } from "interfaces/event";

interface IEventDayPickerProps {
	day: IDerbyEventDay;
	focused: boolean;
	isOutsideRange?: (
		date: moment.Moment,
		id: number,
	) => any;
	onDateChange: (
		date: moment.Moment,
		id: number,
	) => any;
	onFocusChange: (
		(arg: {
			focused: boolean,
		},
	) => void);
}

export default class FeatureIcon extends React.Component<IEventDayPickerProps> {

	constructor(props: IEventDayPickerProps) {
		super(props);

		this.initialVisibleMonth = this.initialVisibleMonth.bind(this);
		this.isOutsideRange = this.isOutsideRange.bind(this);
		this.onDateChange = this.onDateChange.bind(this);
	}

	render() {

		return(

			<DayPickerSingleDateController
				date={this.props.day.dateObject}
				focused={this.props.focused}
				hideKeyboardShortcutsPanel={true}
				numberOfMonths={1}
				enableOutsideDays={false}
				initialVisibleMonth={this.initialVisibleMonth}
				isOutsideRange={this.isOutsideRange}
				keepOpenOnDateSelect={true}
				onDateChange={this.onDateChange}
				onFocusChange={this.props.onFocusChange}
				noBorder={true}
			/>

		);

	}

	initialVisibleMonth(): moment.Moment {

		return this.props.day.dateObject;

	}

	isOutsideRange(date: moment.Moment): boolean {

		return this.props.isOutsideRange(date, this.props.day.id);

	}

	onDateChange(date: moment.Moment): boolean {

		return this.props.onDateChange(date, this.props.day.id);

	}

}

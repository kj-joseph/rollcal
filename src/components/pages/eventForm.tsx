import React from "react";

import Modal from "react-modal";
Modal.setAppElement("#root");

import {
	IDerbyEvent, IDerbyIcon, IDerbyIcons, IDerbySanction, IDerbyTrack, IDerbyType,
	IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList,
} from "components/interfaces";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import moment from "moment";

import { formatDateRange } from "components/lib/dateTime";

import * as auth from "components/lib/auth";

export default class EventForm<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			eventData: [],
			loading: false,
			pageFunction: this.props.match.params.function === "add" ? "Add New Event" :
				this.props.match.params.function === "edit"
					&& this.props.match.params.id
					&& this.props.match.params.id.match(/[0-9]+/)
					? "Edit Event" : "Error",
			path: "",
		};

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

/*			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
			});
			this.loadData();
*/
		}
	}

	render() {

		return (

			<div>

				<h1>{this.state.pageFunction}</h1>

			</div>

		);

	}

	addEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/event/add`);

	}

	editEvent(event: React.MouseEvent<HTMLDivElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/event/${event.currentTarget.getAttribute("data-event-id")}/edit`);

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		const formId: string = (this.state.status === "login" ? "loginForm" : this.state.status === "register" ? "registerForm" : null);

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		});
	}

	loadData() {

		this.setState({
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}events/search/`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				const eventData = [];

				for (let e = 0; e < result.data.response.length; e ++) {

					const eventResult = result.data.response[e];

					eventData.push({
						dates_venue: formatDateRange({
								firstDay: moment.utc(eventResult.days[0].eventday_start_venue),
								lastDay: moment.utc(eventResult.days[eventResult.days.length - 1].eventday_start_venue),
							}, "short"),
						host: eventResult.event_host,
						id: eventResult.event_id,
						location: `${eventResult.venue_city} ${eventResult.region_abbreviation ? ", " + eventResult.region_abbreviation : ""}, ${eventResult.country_code}`,
						name: eventResult.event_name,
						venue_name: eventResult.venue_name,
					});
				}

				this.setState({
					eventData,
					loading: false,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
				});

			});

	}

	logout(event: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

	openAccountModal(event: React.MouseEvent<HTMLButtonElement>) {

		this.props.setAccountModalState(true);

	}

}

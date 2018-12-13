import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";

import { mapEventChangesToBoxList } from "services/boxListService";
import { getEventChangeList } from "services/changeService";
import { checkUserRole } from "services/userService";

import BoxList from "components/boxList";

interface IEventChangesState {
	dataError: boolean;
	eventChanges: [];
	loading: boolean;
	path: string;
	userId: number;
}

export default class EventChanges extends RCComponent<IProps> {

	state: IEventChangesState = {
		dataError: false,
		eventChanges: [],
		loading: true,
		path: null,
		userId: null,
	};

	constructor(props: IProps) {
		super(props);

		this.reviewChange = this.reviewChange.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Review Event Changes",
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (!checkUserRole("reviewer")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData();
			}

		}

	}

	render() {

		return (

			<React.Fragment>

				<p className="backToLink">
					<Link to="/dashboard">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div className="dashboard">

					{this.state.loading ?

						<div className="loader" />

					:

					<React.Fragment>

						<h1>Submitted Event Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.eventChanges.length ?

							<BoxList
								data={this.state.eventChanges}
								itemType="events"
								listType="review"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
								reviewFunction={this.reviewChange}
							/>

						:

							<p>There are currently no submitted changes to events.</p>

						}


					</React.Fragment>

					}

				</div>

			</React.Fragment>

		);

	}

	reviewChange(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/events/changes/${event.currentTarget.getAttribute("data-change-id")}`);

	}

	loadData() {

		const getList = this.addPromise(
			getEventChangeList());

		getList
			.then((changeList) =>

				Promise.all(mapEventChangesToBoxList(changeList)))

			.then((changeList) => {

				this.setState({
					eventChanges: changeList,
					loading: false,
				});

			})

			.catch((error) => {

				console.error(error);
				this.setState({
					dataError: true,
				});

			})
			.finally(getList.clear);

	}

}

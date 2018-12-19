import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IBoxListItem } from "interfaces/boxList";
import { IProps } from "interfaces/redux";
import { IDerbyVenueChange } from "interfaces/venue";

import { mapVenueChangesToBoxList } from "services/boxListService";
import { checkUserRole } from "services/userService";
import { getVenueChangeList } from "services/venueChangeService";

import BoxList from "components/boxList";

interface IVenueChangesState {
	loading: boolean;
	path: string;
	userId: number;
	venueChanges: IBoxListItem[];
}

export default class VenueChanges extends RCComponent<IProps> {

	state: IVenueChangesState = {
		loading: true,
		path: null,
		userId: null,
		venueChanges: [],
	};

	constructor(props: IProps) {
		super(props);

		this.reviewChange = this.reviewChange.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Review Venue Changes",
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (!checkUserRole("reviewer")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.user.id !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.user.id,
			});

			if (this.props.user.id) {
				this.loadData();
			}

		}

	}

	render() {

		return (

			<>

				<p className="backToLink">
					<Link to="/dashboard">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div className="dashboard">

					{this.state.loading ?

						<div className="loader" />

					:

					<>

						<h1>Submitted Venue Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.venueChanges.length ?

							<BoxList
								data={this.state.venueChanges}
								itemType="venues"
								listType="review"
								userId={this.props.user.id}
								noIcons={true}
								reviewFunction={this.reviewChange}
							/>

						:

							<p>There are currently no submitted changes to venues.</p>

						}


					</>

					}

				</div>

			</>

		);

	}

	reviewChange(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.props.history.push(`/dashboard/venues/changes/${event.currentTarget.getAttribute("data-change-id")}`);

	}

	loadData(): void {

		this.setState({
			loading: true,
		});

		const getList = this.addPromise(
			getVenueChangeList());

		getList
			.then((changeList: IDerbyVenueChange[]) => {

				this.setState({
					loading: false,
					venueChanges: changeList.length ?
						mapVenueChangesToBoxList(changeList)
						: [],
				});

			})
			.catch((error) => {

				console.error(error);
				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(getList.clear);

	}

}

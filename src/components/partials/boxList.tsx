import React from "react";
import { Link } from "react-router-dom";

import { IBoxListItem, IDerbyIcon } from "components/interfaces";

import EventIconImage from "components/partials/eventIconImage";
import MyEventIcon from "images/star.svg";
import ReactSVG from "react-svg";

export default class BoxList<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);
	}

	render() {

		return(

			<React.Fragment>

				<ul
					className={`boxList ${
						this.props.className ? this.props.className : ""} ${
							this.props.noIcons || this.props.itemType !== "events" ? "noIcons" : ""}`}
				>

					{this.props.data.map((item: IBoxListItem) => (
						<li
							key={item.changeId || item.id}
							className={this.props.listType === "display" && item.user === this.props.loggedInUserId ? "myEvent" : ""}
						>
							{this.props.listType === "display" && item.user === this.props.loggedInUserId ?
								<ReactSVG className="myEventIcon" src={MyEventIcon} title="You created this event" />
							: ""}

							{item.submittedDuration && item.submittedTime ?
								<React.Fragment>
									<p className="submittedTime">
										<strong>{item.id ? "Change" : "New venue"}</strong>
										<br />
										<span title={item.submittedTime}>{item.submittedDuration} ago</span>{" "}
										by <strong>{item.username}</strong>
									</p>
									{this.props.listType === "edit" ?
										<div className="buttonRow">
											{this.props.editFunction ?
												<button type="button" data-event-id={item.id} onClick={this.props.editFunction} className="smallButton">Edit</button>
											: ""}
											{this.props.deleteFunction ?
												<button type="button" data-event-id={item.id} onClick={this.props.deleteFunction} className="smallButton pinkButton">Delete</button>
											: ""}
										</div>
									: this.props.listType === "review" ?
										<div className="buttonRow">
											<button type="button" data-change-id={item.changeId} onClick={this.props.reviewFunction} className="smallButton">Review</button>
										</div>
									: ""}
								</React.Fragment>
							: ""}

							<p className="listDate"><strong>{item.datesVenue}</strong></p>
							{this.props.itemType === "events" ?
								<p className="listLocation">{item.location}
								{!this.props.noIcons && item.countryFlag ?
									<React.Fragment>
										{" "}
										<span title={item.countryName} className={`flag-icon flag-icon-${item.countryFlag}`} />
									</React.Fragment>
								: ""}</p>
							: ""}
							<h2><Link to={`/event/${item.id}`}>
								{item.name}
							</Link></h2>
							{this.props.itemType === "venues" ?
								<p className="listLocation">{item.location}</p>
							: ""}
							{(item.host) ?	<h3>Hosted by {item.host}</h3> : ""}

							{this.props.itemType === "events" && item.icons && !this.props.noIcons ?
								<div className="listIcons">
									{(item.icons.tracks.length ?
										<span className="listIconGroup eventIconTracks">
											{item.icons.tracks.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(item.icons.derbytypes.length ?
										<span className="listIconGroup eventIconDerbytypes">
											{item.icons.derbytypes.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(item.icons.sanctions.length ?
										<span className="listIconGroup eventIconSanctions">
											{item.icons.sanctions.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
											))}
										</span>
										: "" )}
								</div>
							: ""}

						</li>
					))}
				</ul>

				{this.props.paginate && this.props.totalItems && this.props.loadMoreFunction
				 && this.props.data.length < this.props.totalItems ?

				 	(this.props.loadingMore ?
						<div className="loader loadingMore" />
					:
						<div className="buttonRow center">
							<button className="largeButton" onClick={this.props.loadMoreFunction}>Load more</button>
							{this.props.loadAllFunction ?
								<button className="largeButton" onClick={this.props.loadAllFunction}>Load all</button>
							: ""}
						</div>
					)

				: ""}

			</React.Fragment>

		);

	}

}

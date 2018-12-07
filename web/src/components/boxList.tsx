import React from "react";
import { Link } from "react-router-dom";

import store from "redux/store";

import { IBoxListItem } from "interfaces/boxList";

import FeatureIconSet from "components/featureIconSet";

import MyEventIcon from "images/star.svg";
import ReactSVG from "react-svg";

interface IBoxListDefaultProps {
	distance: boolean;
	distanceUnits: "mi" | "km";
	noIcons: boolean;
	paginate: boolean;
}

interface IBoxListProps extends IBoxListDefaultProps {
	className?: string;
	data: IBoxListItem[];
	deleteFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	editFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	itemType: "events" | "venues";
	listType: "display" | "edit" | "review";
	loadingMore?: boolean;
	loadAllFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	loadMoreFunction?: (event?: React.MouseEvent<HTMLButtonElement>, loadAll?: boolean) => void;
	loggedInUserId?: number;
	reviewFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	totalItems?: number;
}

export default class BoxList extends React.Component<IBoxListProps> {

	static defaultProps: IBoxListDefaultProps = {
		distance: false,
		distanceUnits: "mi",
		noIcons: false,
		paginate: false,
	};

	state = store.getState();

	constructor(props: IBoxListProps) {
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
										<strong>{item.id ? "Change" : `New ${this.props.itemType.substring(0, this.props.itemType.length - 1)}`}</strong>
										<br />
										<span title={item.submittedTime}>{item.submittedDuration} ago</span>{" "}
										by <strong>{item.user.userName}</strong>
									</p>
								</React.Fragment>
							: ""}

							{this.props.listType === "edit" ?
								<div className="buttonRow">
									{this.props.editFunction ?
										<button type="button" data-item-id={item.id} onClick={this.props.editFunction} className="smallButton">Edit</button>
									: ""}
									{this.props.deleteFunction ?
										<button type="button" data-item-id={item.id} onClick={this.props.deleteFunction} className="smallButton pinkButton">Delete</button>
									: ""}
								</div>
							: this.props.listType === "review" ?
								<div className="buttonRow">
									<button type="button" data-change-id={item.changeId} onClick={this.props.reviewFunction} className="smallButton">Review</button>
								</div>
							: ""}

							<p className="listDate"><strong>{item.dates}</strong></p>
							{this.props.itemType === "events" ?
								<p className="listLocation">{item.location}
									{!this.props.noIcons && item.country ?
										<React.Fragment>
											{" "}
											<span title={item.country.name} className={`flag-icon flag-icon-${item.country.flag}`} />
										</React.Fragment>
									: ""}
									{this.props.distance && item.distance ?
										<span className="distance">({
											Math.round(item.distance *
												(this.props.distanceUnits === "km" ? this.state.kmConverter : 1 ))
												.toLocaleString()
										} {this.props.distanceUnits})</span>
									: ""}
								</p>
							: ""}

							<h2>
								{this.props.itemType === "events" ?
									<Link to={`/event/${item.id}`}>
										{item.name}
									</Link>
								:
									item.name
								}
							</h2>

							{this.props.itemType === "venues" ?
								<p className="listLocation">{item.location}</p>
							: ""}
							{(item.host) ?	<h3>Hosted by {item.host}</h3> : ""}

							{this.props.itemType === "events" && item.features && !this.props.noIcons ?

								<FeatureIconSet
									data={[
										{
											items: item.features.tracks,
											type: "track",
										},
										{
											items: item.features.derbytypes,
											type: "derbytype",
										},
										{
											items: item.features.sanctions,
											type: "sanction",
										},
									]}
								/>

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

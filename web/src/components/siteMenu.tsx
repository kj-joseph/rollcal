import { Location } from "history";
import React from "react";
import { match as Match, NavLink } from "react-router-dom";

import ReactSVG from "react-svg";

import ContactIcon from "images/menu/at-sign.svg";
import EventsIcon from "images/menu/calendar-alt.svg";
import FaqIcon from "images/menu/question.svg";
import SearchIcon from "images/menu/search.svg";
import LoginIconSolid from "images/menu/user-circle-solid.svg";
import LoginIconOutline from "images/menu/user-circle.svg";

import { IProps } from "interfaces/redux";

import Analytics from "react-ga";

export default class SiteMenu extends React.Component<IProps> {

	constructor(props: IProps) {
		super(props);

		this.openLoginModal = this.openLoginModal.bind(this);

	}

	render() {

		return (

			<>

				<div className="siteMenu">
					<ul>
						<li>
							<NavLink to="/" title="Upcoming Events" activeClassName="active" isActive={this.isEventsCurrentPage}>
								<ReactSVG
									className="mobileNavIcon"
									title="Events"
									src={EventsIcon}
								/>
								<span className="navLabel">Events</span>
							</NavLink>
						</li>
						<li>
							<NavLink to="/search" title="Search Events" activeClassName="active">
								<ReactSVG
									className="mobileNavIcon"
									title="Search"
									src={SearchIcon}
								/>
								<span className="navLabel">Search</span>
							</NavLink>
						</li>
						<li>
							<NavLink to="/faq" title="Frequently Asked Questions" activeClassName="active">
								<ReactSVG
									className="mobileNavIcon"
									title="FAQ"
									src={FaqIcon}
								/>
								<span className="navLabel">FAQ</span>
							</NavLink>
						</li>
						<li>
							<NavLink to="/contact" title="Contact Roll-Cal" activeClassName="active">
								<ReactSVG
									className="mobileNavIcon"
									title="Contact"
									src={ContactIcon}
								/>
								<span className="navLabel">Contact</span>
							</NavLink>
						</li>
						<li className="desktopOnly">
							{this.props.loggedIn ?
								<NavLink to="/dashboard" title="Dashboard" activeClassName="activeIcon">
									<ReactSVG
										className={this.props.sessionInitialized ? "" : "hidden"}
										src={LoginIconSolid}
									/>
								</NavLink>
							:
								<a href="" onClick={this.openLoginModal} title="Login / Register">
									<ReactSVG
										className={this.props.sessionInitialized ? "" : "hidden"}
										src={LoginIconOutline}
									/>
								</a>
							}
						</li>
					</ul>
				</div>

			</>
		);

	}

	openLoginModal(event?: React.MouseEvent<HTMLAnchorElement>): void {

		if (event) {
			event.preventDefault();
		}

		this.props.setLoginModalState(true);
		Analytics.modalview("Login");

	}

	isEventsCurrentPage(match: Match, location: Location): boolean {

		return location && location.pathname && !location.pathname.match(/\/(?:search|faq|contact|dashboard|validate|forgotPassword)/);

	}

}

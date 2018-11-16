import React from "react";
import { NavLink } from "react-router-dom";

import ReactSVG from "react-svg";

import ContactIcon from "images/menu/at-sign.svg";
import EventsIcon from "images/menu/calendar-alt.svg";
import FaqIcon from "images/menu/question.svg";
import SearchIcon from "images/menu/search.svg";
import LoginIconSolid from "images/menu/user-circle-solid.svg";
import LoginIconOutline from "images/menu/user-circle.svg";

import { IProps } from "interfaces/redux";

export default class SiteMenu extends React.Component<IProps> {

	constructor(props: IProps) {
		super(props);

		this.openLoginModal = this.openLoginModal.bind(this);

	}

	openLoginModal(event?: React.MouseEvent<HTMLAnchorElement>) {

		if (event) {
			event.preventDefault();
		}

		this.props.setLoginModalState(true);

	}

	isEventsCurrentPage(path: any, match: any, location: any) {

		return match && !match.pathname.match(/\/(?:search|faq|contact|dashboard|validate)/);
	}

	render() {

		return (

			<React.Fragment>

				<div className="siteMenu">
					<ul>
						<li>
							<NavLink to="/" title="Upcoming Events" activeClassName="active" isActive={this.isEventsCurrentPage.bind(this)}>
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

			</React.Fragment>
		);

	}

}

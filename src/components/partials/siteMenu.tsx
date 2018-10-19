import React from "react";
import { NavLink } from "react-router-dom";

import LoginIconSolid from "images/menu/user-circle-solid.svg";
import LoginIconOutline from "images/menu/user-circle.svg";
import ReactSVG from "react-svg";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export default class SiteMenu<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			errorMessage: "",
			formValid: false,
			loading: false,
			loginEmail: "",
			loginOpen: false,
			loginPassword: "",
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
			status: "login",
		};

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
								Events
							</NavLink>
						</li>
						<li>
							<NavLink to="/search" title="Search Events" activeClassName="active">
								Search
							</NavLink>
						</li>
						<li>
							<NavLink to="/faq" title="Frequently Asked Questions" activeClassName="active">
								FAQ
							</NavLink>
						</li>
						<li>
							<NavLink to="/contact" title="Contact Roll-Cal" activeClassName="active">
								Contact
							</NavLink>
						</li>
						<li className="desktopOnly">
							{this.props.loggedIn ?
								<NavLink to="/dashboard" title="Dashboard" activeClassName="activeIcon">
									<ReactSVG src={LoginIconSolid} />
								</NavLink>
							:
								<a href="" onClick={this.openLoginModal} title="Login / Register">
									<ReactSVG src={LoginIconOutline} />
								</a>
							}
						</li>
					</ul>
				</div>

			</React.Fragment>
		);

	}

}

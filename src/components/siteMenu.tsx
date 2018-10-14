import React from "react";
import ReactDOM from "react-dom";
import { NavLink } from "react-router-dom";

import MenuContact from "images/menu/contact.svg";
import MenuEdit from "images/menu/edit.svg";
import MenuFaq from "images/menu/faq.svg";
import MenuLogin from "images/menu/login.svg";
import MenuLogout from "images/menu/logout.svg";
import MenuProfile from "images/menu/profile.svg";
import MenuSearch from "images/menu/search.svg";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export default class SiteMenu<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.logout = this.logout.bind(this);
		this.openLoginBox = this.openLoginBox.bind(this);

		if (sessionStorage.rollCalUserId
			&& sessionStorage.rollCalUserName
			&& sessionStorage.rollCalUserIsAdmin
			&& sessionStorage.rollCalUserSessionId) {

			axios.post(this.props.apiLocation + "auth/checkSession", {
				isAdmin: sessionStorage.rollCalUserIsAdmin,
				sessionId: sessionStorage.rollCalUserSessionId,
				userId: sessionStorage.rollCalUserId,
			}).then((results: AxiosResponse) => {
				if (results.data.response) {
					this.props.setIUserInfo({
						loggedIn: true,
						loggedInUserAdmin: sessionStorage.rollCalUserIsAdmin,
						loggedInUserId: sessionStorage.rollCalUserId,
					});

				} else {
					this.logout();
				}
			});

		}

	}

	logout(event?: React.MouseEvent<HTMLAnchorElement>): void {

		if (event) {
			event.preventDefault();
		}

		axios.delete(this.props.apiLocation + "auth/logout/" + sessionStorage.rollCalUserId);

		sessionStorage.removeItem("rollCalUserId");
		sessionStorage.removeItem("rollCalUserName");
		sessionStorage.removeItem("rollCalUserIsAdmin");
		sessionStorage.removeItem("rollCalUserSessionId");

		this.props.setIUserInfo({
			loggedIn: false,
			loggedInUserAdmin: "",
			loggedInUserId: "",
		});
	}

	openLoginBox(event: React.MouseEvent<HTMLAnchorElement>): void {
		event.preventDefault();
		this.props.setLoginBoxState(true);
		this.props.setMenuState(false);
	}

	render() {

		return (
			<div className="siteMenu">
				<ul>
					<li>
						<NavLink to="/events/search" title="Search Events">
							<img src={MenuSearch} alt="" />
						</NavLink>
					</li>
					<li>
						<NavLink exact={true} to="/faq" title="Frequently Asked Questions">
							<img src={MenuFaq} alt="" />
						</NavLink>
					</li>
					<li>
						<NavLink exact={true} to="/contact" title="Contact">
							<img src={MenuContact} alt="" />
						</NavLink>
					</li>
					{ this.props.loggedIn ?
					<React.Fragment>
						<li>
							<a href="" onClick={this.logout} title="Log out">
								<img src={MenuLogout} alt="" />
							</a>
						</li>
						<li>
							<NavLink to="/profile" title="Profile">
								<img src={MenuProfile} alt="" />
							</NavLink>
						</li>
						<li>
							<NavLink to="/edit" title="Edit">
								<img src={MenuEdit} alt="" />
							</NavLink>
						</li>
					</React.Fragment>
					:
					<React.Fragment>
						<li>
							<a href="" onClick={this.openLoginBox} title="Login / Register">
								<img src={MenuLogin} alt="" />
							</a>
						</li>
					</React.Fragment>
					}
				</ul>
			</div>
		);

	}

}

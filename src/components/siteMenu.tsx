import React from "react";
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
			&& sessionStorage.rollCalUserPermissions
			&& sessionStorage.rollCalToken) {

			axios.post(this.props.apiLocation + "auth/checkToken",
				{
					id: sessionStorage.rollCalUserId,
					permissions: sessionStorage.rollCalUserPermissions,
					username: sessionStorage.rollCalUserName,
				},
				{
					headers: {
						Authorization: `Bearer ${sessionStorage.rollCalToken}`,
					},
			}).then((results: AxiosResponse) => {
				this.props.setUserInfo({
					loggedIn: true,
					loggedInUserId: sessionStorage.rollCalUserId,
					loggedInUserName: sessionStorage.rollCalUserName,
					loggedInUserPermissions: sessionStorage.rollCalUserPermissions.split(","),
				});

			}).catch((error: AxiosError) => {

				if (sessionStorage.rollCalUserId) {
					this.logout(null, sessionStorage.rollCalUserId);
				} else {
					this.logout();
				}

			});

		}

	}

	logout(event?: React.MouseEvent<HTMLAnchorElement>, id?: number): void {

		if (event) {
			event.preventDefault();
		}

		if (id) {
			axios.delete(this.props.apiLocation + "auth/logout/" + id);
		}

		sessionStorage.removeItem("rollCalUserId");
		sessionStorage.removeItem("rollCalUserName");
		sessionStorage.removeItem("rollCalUserPermissions");
		sessionStorage.removeItem("rollCalToken");

		this.props.setUserInfo({
			loggedIn: false,
			loggedInUserId: "",
			loggedInUserPermissions: "",
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
						<NavLink exact={true} to="/events" title="Upcoming Events">
							Events
						</NavLink>
					</li>
					<li>
						<NavLink to="/events/search" title="Search Events">
							Search
						</NavLink>
					</li>
					<li>
						<NavLink exact={true} to="/faq" title="Frequently Asked Questions">
							FAQ
						</NavLink>
					</li>
					<li>
						<NavLink exact={true} to="/contact" title="Contact Roll-Cal">
							Contact
						</NavLink>
					</li>
					{ 0 ? <React.Fragment>
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
		</React.Fragment> : "" }
				</ul>
			</div>
		);

	}

}

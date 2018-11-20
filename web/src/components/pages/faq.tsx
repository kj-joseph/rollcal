import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";

export default class Faq extends React.Component<IProps> {

	mounted = false;

	constructor(props: IProps) {
		super(props);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	render() {

		return (

			<div>
				<h1>Frequently Asked Stuff</h1>

				<p>Well, ok, maybe not "frequently", but here's some stuff we thought people might want to know.</p>

				<dl className="faq">

					<dt>What is this?</dt>
					<dd>
						<p>Welcome to Roll-Cal.com, a community-driven calendar site for roller derby around the globe.  Do you want to know what events are coming up near you?
							Interested in finding roller derby when you travel?  You're in the right place.</p>
					</dd>

					<dt>Neat.  So where's my league's event?  What gives?</dt>
					<dd>
						<p>That's where the "community-driven" portion of the program comes in!
							Anyone can create an account here and add events.
							So if you know about an event but don't see it here, you can add it and make sure everyone knows about it.</p>
					</dd>

					<dt>There's an event listed that has some wrong information.  What can I do about that?</dt>
					<dd>
						<p>Fill out the <Link to="/contact" title="Contact">contact form</Link> and let us know what's up.</p>
					</dd>

					<dt>There's a weird error showing up.  Fix it!</dt>
					<dd>
						<p>Fill out the <Link to="/contact" title="Contact">contact form</Link> and let us know what's up.</p>
						<p>(Yes, that's a repeat answer.)</p>
					</dd>

					<dt>Who's running the asylum?</dt>
					<dd>
						<p>The site was developed by Kevin Joseph, aka Killsbury Doughboy, a former skater with the Twin Cities Terrors and San Diego Aftershocks.
							Another skater's Facebook post about derby calendars sparked the idea, and here we are.
						</p>
						<p>If you're interested in hiring Kevin for a project,
							check out <a href="http://www.kjbranded.com/" target="_blank" rel="noopener noreferrer">KJ Branded</a>.</p>
					</dd>

					<dt>Can I help out?</dt>
					<dd>
						<p>There are a couple of ways you can help:</p>
						<p><strong>Content reviewers</strong><br />
							Every event submitted to the site gets a once-over before it gets posted,
							so that we can make sure people can get the information they want without the spam they don't.
							If you're interested in being part of the review staff, <Link to="/contact" title="Contact">drop us a line</Link>!
						</p>
						<p><strong>Developers</strong><br />
							Do you have web skills to pay the bills?  Roll-Cal is an open-source project.
							{" "}<a href="https://github.com/kj-joseph/rollcal" target="_blank" rel="noopener noreferrer">Roll on over to GitHub</a> to find out more.
						</p>
						<p></p>

					</dd>

				</dl>

			</div>
		);

	}

}

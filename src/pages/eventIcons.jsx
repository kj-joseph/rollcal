import React from "react";
import ReactDOM from "react-dom";

export default class EventIcons extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div className="eventIcons">
				{(this.props.icons.tracks.length ?
					<span className="eventIconGroup eventIconTracks">
						{(this.props.showLabels) ? 
							<span className="label">Track(s)</span>
						:
							""
						}
						{this.props.icons.tracks.map(icon => (
							<EventIconImage icon={icon} key={icon.filename} />
						))}
					</span>
					: "" )}
				{(this.props.icons.derbytypes.length ?
					<span className="eventIconGroup eventIconDerbytypes">
						{(this.props.showLabels) ? 
							<span className="label">Derby Types</span>
						:
							""
						}
						{this.props.icons.derbytypes.map(icon => (
							<EventIconImage icon={icon} key={icon.filename} />
						))}
					</span>
					: "" )}
				{(this.props.icons.sanctions.length ?
					<span className="eventIconGroup eventIconSanctions">
						{(this.props.showLabels) ? 
							<span className="label">Sanctions</span>
						:
							""
						}
						{this.props.icons.sanctions.map(icon => (
							<EventIconImage icon={icon} key={icon.filename} />
						))}
					</span>
					: "" )}
			</div>
			);

	}

}

class EventIconImage extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<img src={"/images/" + this.props.icon.filename + ".svg"} title={this.props.icon.title} alt={this.props.icon.title} />
		);

	}

}

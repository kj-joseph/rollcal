import React from "react";

import { IDerbyIcon, IDerbyIcons } from "interfaces/feature";

import EventIconImage from "components/eventIconImage";

interface IEventIconsProps {
	icons: IDerbyIcons;
	showLabels?: boolean;
}

export default class EventIcons extends React.Component<IEventIconsProps> {

	constructor(props: IEventIconsProps) {
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
						{this.props.icons.tracks.map((icon: IDerbyIcon) => (
							<EventIconImage icon={icon} key={icon.filename} />
						))}
					</span>
					: "" )}
				{(this.props.icons.derbytypes.length ?
					<span className="eventIconGroup eventIconDerbytypes">
						{(this.props.showLabels) ?
							<span className="label">Derby Type(s)</span>
						:
							""
						}
						{this.props.icons.derbytypes.map((icon: IDerbyIcon) => (
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
						{this.props.icons.sanctions.map((icon: IDerbyIcon) => (
							<EventIconImage icon={icon} key={icon.filename} />
						))}
					</span>
					: "" )}
			</div>
			);

	}

}

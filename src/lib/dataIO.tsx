import React from "react";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import { IDerbyType } from "interfaces";

export class DataIO<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);
	}

	async getDerbyTypes(): Promise<IDerbyType[]> {

		if (this.props.dataDerbyTypes.length) {

			return this.props.dataDerbyTypes;

		} else {

			axios.get(this.props.apiLocation + "eventFeatures/getDerbyTypes")
				.then((result: AxiosResponse) => {

					return result.data.response;

				}).catch((error: AxiosError) => {

					console.error(error);

				});

		}

	}

}

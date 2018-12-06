import React from "react";

import { IProps } from "interfaces/redux";

interface IPromiseListener<T> extends Promise<any> {
	clear: () => void;
}

export default class Component<P = {}> extends React.Component<IProps> {

	promiseListeners: Array<IPromiseListener<any>> = [];

	addListener(promise: Promise<any>): IPromiseListener<any> {

		const promiseListener: IPromiseListener<any> = Object.assign(promise, {
			clear: () => this.clearListener(promiseListener),
		});

		this.promiseListeners.push(promiseListener);

		return promiseListener;

	}

	cancelAllListeners() {

		this.promiseListeners.forEach((listener) => {
			listener.cancel();
		});

		this.promiseListeners = [];

	}

	clearListener(listener: IPromiseListener<any>) {

		if (listener.isPending()) {
			listener.cancel();
		}

		this.promiseListeners.splice(this.promiseListeners.indexOf(listener), 1);

	}

}

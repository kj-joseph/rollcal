import React from "react";

import { IProps } from "interfaces/redux";

interface IPromise<T> extends Promise<any> {
	clear: () => void;
}

export default class RCComponent<P = {}> extends React.Component<IProps> {

	storedPromises: Array<IPromise<any>> = [];

	addPromise(promise: Promise<any>): IPromise<any> {

		const storedPromise: IPromise<any> = Object.assign(promise, {
			clear: () => {
				if (storedPromise.isPending()) {
					storedPromise.cancel();
				}
				this.storedPromises.splice(this.storedPromises.indexOf(storedPromise), 1);
			},
		});

		this.storedPromises.push(storedPromise);

		return storedPromise;

	}

	cancelAllPromises() {

		this.storedPromises.forEach((listener) => {
			listener.cancel();
		});

		this.storedPromises = [];

	}

	componentWillUnmount() {
		this.cancelAllPromises();
	}

}

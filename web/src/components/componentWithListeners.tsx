import * as Promise from "bluebird";
import React from "react";

export default class ComponentWithListeners<P = {}, S = {}, SS = any> extends React.Component<any, any, any> {

	listeners: Array<Promise<any>> = [];

	addListener(promise: Promise<any>) {

		this.listeners.push(promise);

	}

	clearAllListeners() {

		this.listeners.forEach((listener: Promise<any>) => {
			this.clearListener(listener);
		});

	}

	clearListener(listener: Promise<any>) {

		listener.cancel();

	}

}

/*
import * as Promise from "bluebird";
import React from "react";

interface IPromiseListener {
	cancel: () => any;
	clear?: (ref: string) => any;
	ref: string;
	promise: Promise<any>;
}

export default class ComponentWithListeners<P = {}, S = {}, SS = any> extends React.Component<any, any, any> {

	promiseListeners: IPromiseListener[] = [];

	addListener(promise: Promise<any>) {

		const ref = Math.random().toString(36).substr(2, 16);

		this.promiseListeners.push({
			cancel: promise.cancel,
			clear: this.clearListener(ref),
			promise,
			ref,
		});

		// return promise;

	}

	cancelAllListeners() {

		this.promiseListeners.forEach((listener) => {
			this.cancelListener(listener);
		});

	}

	cancelListener(listener: IPromiseListener) {

		listener.cancel();

	}

	clearListener(ref: string) {
		// x
	};



}
*/

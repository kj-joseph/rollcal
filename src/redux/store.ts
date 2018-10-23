import { createStore } from "redux";
import rootReducer from "redux/reducers";

let store = createStore(rootReducer);

if (process.env.ENV === "local") {

	store = createStore(rootReducer,
		(window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

}

export default store;

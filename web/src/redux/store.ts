import { createStore } from "redux";
import rootReducer from "redux/reducers";

let store = createStore(rootReducer);

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {

	store = createStore(rootReducer,
		(window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

}

export default store;

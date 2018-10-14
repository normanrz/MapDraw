import { createStore } from "redux";
import * as actions from "./actions";

const initialState = [];

const reducer = (state, action) => {
  switch (action.type) {
    case actions.ADD_ROUTE:
      return state.concat([action.route]);
    case actions.REMOVE_ROUTE:
      return state
        .slice(0, Math.max(0, action.index - 1))
        .concat(state.slice(action.index));
    default:
      return state;
  }
};

const store = createStore(reducer, initialState);

export default store;

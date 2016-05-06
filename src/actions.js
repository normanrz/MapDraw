import { makeActionCreator } from './utils';

export const ADD_ROUTE = 'ADD_ROUTE';
export const REMOVE_ROUTE = 'REMOVE_ROUTE';

class ActionCreators {
  addRoute = makeActionCreator(ADD_ROUTE, 'route');
  removeRoute = makeActionCreator(REMOVE_ROUTE, 'index');
}

export default new ActionCreators();

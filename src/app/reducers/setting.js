import { Currencies } from '@common/data/Currencies';
import * as ActionTypes from '../actions/ActionTypes';

const defaultState = {
  isDarkMode: false,
  isOfflineMode: false,
  language: null,
  currency: Currencies[0],
};

export default function base(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.USER_CHANGE_LANG: {
      return {
        ...state,
        language: action.data,
      };
    }
    case ActionTypes.USER_TOGGLE_DARK_MODE: {
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      };
    }
    case ActionTypes.CONNECTION_INFO_CHANGE: {
      return {
        ...state,
        isOfflineMode: !action.isConnected
      };
    }
    case ActionTypes.USER_CHANGE_CURRENCY: {
      return {
        ...state,
        currency: action.data,
      };
    }

    default:
      return state;
  }
}

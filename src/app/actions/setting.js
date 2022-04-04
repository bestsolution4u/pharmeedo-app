import moment from 'moment';

import * as ActionTypes from './ActionTypes';
import I18n from '@common/I18n';

export const changeLanguage = (lang) => dispatch => {
  I18n.locale = lang.value;
  moment.locale(lang.value.substring(0, 2));
  dispatch({ type: ActionTypes.USER_CHANGE_LANG, data: lang });
}

export const changeCurrency = (currency) => dispatch => {
  dispatch({ type: ActionTypes.USER_CHANGE_CURRENCY, data: currency });
}

export const toggleDarkMode = () => {
  return dispatch => {
    dispatch({ type: ActionTypes.USER_TOGGLE_DARK_MODE });
  }
}

export const connectionInfoChange = (isConnected) => {
  return dispatch => {
    dispatch({ type: ActionTypes.CONNECTION_INFO_CHANGE, isConnected });
  }
}
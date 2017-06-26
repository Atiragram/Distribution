import {makeReducer, combineReducers} from '#/main/core/utilities/redux'

import {
  THEME_ADD,
  THEMES_REMOVE,
  THEME_SELECT
} from './actions'

const reducer = makeReducer({current: null, all: []}, {
  [THEME_SELECT]: (state, action) => {
    return Object.assign({}, state, {
      current: action.theme
    })
  },
  [THEME_ADD]: (state, action) => {
    return state
  },
  [THEMES_REMOVE]: (state, action) => {
    return state
  }
})

export {
  reducer
}

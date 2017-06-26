import {bootstrap} from '#/main/core/utilities/app/bootstrap'

import {reducer as apiReducer} from '#/main/core/api/reducer'
import {reducer as modalReducer} from '#/main/core/layout/modal/reducer'
import {makeListReducer} from '#/main/core/layout/list/reducer'
import {reducer as themesReducer} from '#/main/core/administration/theme/reducer'

import {Themes} from '#/main/core/administration/theme/components/themes.jsx'

bootstrap('.themes-container', Themes, {
  currentRequests: apiReducer,
  themes: themesReducer,
  list: makeListReducer(false), // disable filters
  modal: modalReducer
})

import React from 'React'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import MenuItem from 'react-bootstrap/lib/MenuItem'

import {t, trans} from '#/main/core/translation'

import {actions as modalActions} from '#/main/core/layout/modal/actions'
import {actions} from '#/main/core/administration/theme/actions'

import {select as modalSelect} from '#/main/core/layout/modal/selectors'
import {select} from '#/main/core/administration/theme/selectors'

import {Page, PageHeader, PageContent} from '#/main/core/layout/page/components/page.jsx'
import {
  PageGroupActions,
  PageActions,
  PageAction,
  MoreAction
} from '#/main/core/layout/page/components/page-actions.jsx'

const Theme = props =>
  <Page
    id="theme-form"
  >
    <PageHeader
      title={trans('theme_management', {}, 'theme')}
      subtitle={props.name}
    >
      <PageActions>
        <PageGroupActions>
          <PageAction
            id="theme-add"
            title={trans('save_theme', {}, 'theme')}
            icon="fa fa-floppy-o"
            primary={true}
            action="#"
          />

          <PageAction
            id="theme-import"
            title={trans('themes_list', {}, 'theme')}
            icon="fa fa-times"
            action="#"
          />
        </PageGroupActions>

        <PageGroupActions>
          <MoreAction id="resource-more">
            <MenuItem
              key="resource-group-type"
              header={true}
            >
              {t('more_actions')}
            </MenuItem>
            <MenuItem
              key="resource-rebuild"
              eventKey="resource-rebuild"
              href="#"
            >
              <span className="fa fa-fw fa-refresh" />
              {trans('rebuild_theme', {}, 'theme')}
            </MenuItem>
            <MenuItem
              key="resource-export"
              eventKey="resource-export"
              href="#"
            >
              <span className="fa fa-fw fa-upload" />
              {trans('export', {}, 'theme')}
            </MenuItem>
            <MenuItem
              key="resource-delete"
              eventKey="resource-delete"
              className="dropdown-link-danger"
              onClick={e => {
                {/*e.stopPropagation()
                props.showModal(MODAL_DELETE_CONFIRM, {
                  title: trans('delete', {}, 'theme'),
                  question: trans('delete_confirm_question', {}, 'theme'),
                  handleConfirm: () => true
                })*/}
              }}
            >
              <span className="fa fa-fw fa-trash" />
              {trans('delete', {}, 'theme')}
            </MenuItem>
          </MoreAction>
        </PageGroupActions>
      </PageActions>
    </PageHeader>

    <PageContent>

    </PageContent>
  </Page>

Theme.propTypes = {

}

function mapStateToProps(state, onwProps) {
  return {
    theme: select.themes(state).find(theme => onwProps.id === theme.id),
    modal: modalSelect.modal(state)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    copyTheme: () => {
      dispatch(actions.copyTheme())
    },

    rebuildThemes: (themes) => {
      dispatch(actions.rebuildThemes(themes))
    },

    removeThemes: (themes) => {
      dispatch(actions.removeThemes(themes))
    },

    // modals
    showModal(modalType, modalProps) {
      dispatch(modalActions.showModal(modalType, modalProps))
    },
    fadeModal() {
      dispatch(modalActions.fadeModal())
    },
    hideModal() {
      dispatch(modalActions.hideModal())
    }
  }
}

const ConnectedTheme = withRouter(connect(mapStateToProps, mapDispatchToProps)(Theme))

export {ConnectedTheme as Theme}

import React from 'React'
import {PropTypes as T} from 'prop-types'
import MenuItem from 'react-bootstrap/lib/MenuItem'

import {t, trans} from '#/main/core/translation'

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

export {
  Theme
}
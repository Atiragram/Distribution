import React from 'react'
import {mount} from 'enzyme'
import {spyConsole, renew, ensure} from '#/main/core/tests'
import {TooltipElement} from './tooltip-element.jsx'

describe('<TooltipElement/>', () => {
  beforeEach(() => {
    spyConsole.watch()
    renew(TooltipElement, 'TooltipElement')
  })
  afterEach(spyConsole.restore)

  it('renders an element with a tooltip', () => {
    const element = mount(
      React.createElement(TooltipElement, {
        id: 'ID',
        tip: 'TIP'
      }, React.createElement('span', {}, 'CONTENT'))
    )

    ensure.propTypesOk()
    ensure.equal(element.text(), 'CONTENT')
    // not sure if/how the tooltip itself should be tested
  })
})

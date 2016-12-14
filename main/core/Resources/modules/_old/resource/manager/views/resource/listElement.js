import _ from 'underscore'
import utilities from '#/main/core/_old/utilities'
import Backbone from 'backbone'

/* global Twig */
/* global Translator */
/* global ResourceDeleteConfirmMessage */
/* global ResourceManagerListElement */

export default Backbone.View.extend({
  className: 'resource-li list-group-item node',
  tagName: 'li',
  events: {
    'click a.node-menu-action': 'menuAction'
  },
  initialize: function(parameters, dispatcher, zoomValue) {
    this.parameters = parameters
    this.dispatcher = dispatcher
    this.zoomValue = zoomValue
  },
  menuAction: function(event) {
    event.preventDefault()
    var action = event.currentTarget.getAttribute('data-action')
    var nodeId = event.currentTarget.getAttribute('data-id')
    var isCustom = event.currentTarget.getAttribute('data-is-custom') === 'yes'
    var eventName = isCustom ? 'custom-action' : action
    var isForm = event.currentTarget.getAttribute('data-action-type') === 'display-form'
    var name = event.currentTarget.getAttribute('data-node-name')
    eventName = isCustom && isForm ? 'custom-action-form' : eventName

    // we want a confirmation for the delete
    if (action === 'delete') {
      var node = []
      node[3] = name
      var body = Twig.render(
        ResourceDeleteConfirmMessage,
        {'nodes': [node]}
      )
      this.dispatcher.trigger('confirm', {
        header: Translator.trans('delete', {}, 'platform'),
        body: body,
        callback: _.bind(function() {
          this.dispatcher.trigger('delete', {
            ids: [nodeId],
            view: this.parameters.viewName
          })
        }, this)
      })
    } else {
      this.dispatcher.trigger(eventName, {
        action: action,
        nodeId: nodeId,
        view: this.parameters.viewName,
        isCustomAction: isCustom
      })
    }
  },
  render: function(node, isSelectionAllowed) {
    this.el.id = node.id
    this.$el.addClass(this.zoomValue)
    node.displayableName = utilities.formatText(node.name, 20, 2)
    isSelectionAllowed = (node.type === 'directory' && !this.parameters.isDirectorySelectionAllowed) ? false : true
    var actions = this.parameters.resourceTypes.hasOwnProperty(node.type) ?
      this.parameters.resourceTypes[node.type].actions :
      []
    this.el.innerHTML = Twig.render(ResourceManagerListElement, {
      'node': node,
      'isSelectionAllowed': isSelectionAllowed,
      'hasMenu': true,
      'actions': actions,
      'webRoot': this.parameters.webPath,
      'viewName': this.parameters.viewName
    })
  }
})

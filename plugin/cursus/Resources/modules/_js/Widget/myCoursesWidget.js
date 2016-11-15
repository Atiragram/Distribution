import $ from 'jquery'
import moment from 'moment/min/moment-with-locales'
import 'fullcalendar/dist/fullcalendar'
import modal from '#/main/core/_old/modal'

/* global Routing */
/* global Translator */

const currentUserId = window.currentUserId
const widgetInstanceId = window.widgetInstanceId
let mode = window.mode

switch (mode) {
  case 0:
    mode = 'list'
    break
  case 1:
    mode = 'calendar'
    break
  case 2:
    mode = 'chronologic'
    break
}
let currentSearch = ''
let currentMax = 20
let currentOrderedBy = 'title'
let currentOrder = 'ASC'
const sessionsIdx = 'sessions_' + widgetInstanceId
const editableSessionsIdx = 'editable-sessions_' + widgetInstanceId
const workspacesIdx = 'workspaces_' + widgetInstanceId
const sessionEventUsersStatusIdx = 'session-event-users-status_' + widgetInstanceId
const widgetElement = $(`#my-courses-widget-${widgetInstanceId}`)
const listElement = $(`#courses-list-${widgetInstanceId}`)
let sessions = []
let events = []
let editableSessions = []
let sessionEventUsersStatus = []
let workspaces = {}
let selectedEventId = null
let selectedCommentId = null

function refreshCoursesList () {
  let url

  switch (mode) {
    case 'list':
      url = Routing.generate(
        'claro_cursus_my_courses_list_for_widget',
        {
          'widgetInstance': widgetInstanceId,
          'search': currentSearch,
          'max': currentMax,
          'orderedBy': currentOrderedBy,
          'order': currentOrder
        }
      )
      break
    case 'calendar':
      url = Routing.generate(
        'claro_cursus_my_courses_list_for_widget_calendar',
        {'widgetInstance': widgetInstanceId, 'search': currentSearch}
      )
      break
    case 'chronologic':
      url = Routing.generate(
        'claro_cursus_my_courses_list_for_widget_chronologic',
        {'widgetInstance': widgetInstanceId, 'search': currentSearch}
      )
      break
  }
  $.ajax({
    url: url,
    type: 'GET',
    success: function (datas) {
      listElement.html(datas)

      if (mode === 'calendar') {
        initializeCalendar()
      }
    }
  })
}

widgetElement.on('click', 'a', function (event) {
  if (!$(this).hasClass('standard-link')) {
    event.preventDefault()

    if ($(this).hasClass('chronologic-link')) {
      const sessionId = $(this).data('session-id')
      const url = Routing.generate('claro_courses_widget_session_informations', {widgetInstance: widgetInstanceId, session: sessionId, type: 1})
      modal.fromUrl(url)
    } else {
      const element = event.currentTarget
      const route = $(element).attr('href')

      $.ajax({
        url: route,
        type: 'GET',
        success: function (datas) {
          listElement.html(datas)
        }
      })
    }
  }
})

widgetElement.on('click', '#search-course-btn', function () {
  currentSearch = $('#search-course-input').val()
  refreshCoursesList()
})

widgetElement.on('keypress', '#search-course-input', function (e) {
  if (e.keyCode === 13) {
    e.preventDefault()
    currentSearch = $(this).val()
    refreshCoursesList()
  }
})

widgetElement.on('click', '#calendar-view-button', function () {
  const route = Routing.generate(
    'claro_cursus_my_courses_list_for_widget_calendar',
    {'widgetInstance': widgetInstanceId, 'search': currentSearch}
  )

  $.ajax({
    url: route,
    type: 'GET',
    success: function (datas) {
      listElement.html(datas)
      mode = 'calendar'
      initializeCalendar()
    }
  })
})

widgetElement.on('click', '#list-view-button', function () {
  const route = Routing.generate(
    'claro_cursus_my_courses_list_for_widget',
    {'widgetInstance': widgetInstanceId, 'search': currentSearch,'max': currentMax, 'orderedBy': currentOrderedBy, 'order': currentOrder}
  )

  $.ajax({
    url: route,
    type: 'GET',
    success: function (datas) {
      listElement.html(datas)
      mode = 'list'
    }
  })
})

widgetElement.on('click', '#chronologic-view-button', function () {
  const route = Routing.generate(
    'claro_cursus_my_courses_list_for_widget_chronologic',
    {'widgetInstance': widgetInstanceId, 'search': currentSearch}
  )

  $.ajax({
    url: route,
    type: 'GET',
    success: function (datas) {
      listElement.html(datas)
      mode = 'chronologic'
    }
  })
})

function registerComment (eventId, comment) {
  const index = events.findIndex(e => (e['id'] === eventId) && (e['type'] === 'session_event'))

  if (index > -1) {
    events[index]['comments'].push(comment)
  }
}

function updateComment (eventId, commentId, content) {
  const index = events.findIndex(e => (e['id'] === eventId) && (e['type'] === 'session_event'))

  if (index > -1) {
    const commentIndex = events[index]['comments'].findIndex(c => c['id'] === commentId)

    if (commentIndex > -1) {
      events[index]['comments'][commentIndex]['content'] = content
    }
  }
}

function removeComment (eventId, commentId) {
  const index = events.findIndex(e => (e['id'] === eventId) && (e['type'] === 'session_event'))

  if (index > -1) {
    const commentIndex = events[index]['comments'].findIndex(c => c['id'] === commentId)

    if (commentIndex > -1) {
      events[index]['comments'].splice(commentIndex, 1)
    }
  }
}

function getCommentContent (eventId, commentId) {
  const index = events.findIndex(e => (e['id'] === eventId) && (e['type'] === 'session_event'))

  if (index > -1) {
    const commentIndex = events[index]['comments'].findIndex(c => c['id'] === commentId)

    if (commentIndex > -1) {
      return events[index]['comments'][commentIndex]['content']
    }
  }

  return ''
}

function t (key) {
  if (typeof key === 'object') {
    let transWords = []

    for (let i = 0; i < key.length; i++) {
      transWords.push(Translator.trans(key[i], {}, 'agenda'))
    }
    return transWords
  }
  return Translator.trans(key, {}, 'agenda')
}

function computeEventColor (sessionId, tutors) {
  if (editableSessions[sessionId]) {
    const tutor = tutors.find(t => t['id'] === currentUserId)

    if (!tutor) {
      return '#777777'
    }
  }

  return '#337AB7'
}

function initializeEvents () {
  events = []
  sessions.forEach(s => {
    let sessionStartEvent = {}
    let sessionEndEvent = {}

    for (let key in s) {
      sessionStartEvent[key] = s[key]
      sessionEndEvent[key] = s[key]
    }
    sessionStartEvent['title'] = s['name']
    sessionStartEvent['start'] = s['startDate']
    sessionStartEvent['end'] = s['startDate']
    sessionStartEvent['editable'] = false
    sessionStartEvent['allDay'] = true
    sessionStartEvent['className'] = 'pointer-hand'
    sessionStartEvent['color'] = '#449D44'
    sessionStartEvent['type'] = 'session_start'

    sessionEndEvent['title'] = s['name']
    sessionEndEvent['start'] = s['endDate']
    sessionEndEvent['end'] = s['endDate']
    sessionEndEvent['editable'] = false
    sessionEndEvent['allDay'] = true
    sessionEndEvent['className'] = 'pointer-hand'
    sessionEndEvent['color'] = '#D9534F'
    sessionEndEvent['type'] = 'session_end'
    events.push(sessionStartEvent)
    events.push(sessionEndEvent)
    s['events'].forEach(e => {
      if (sessionEventUsersStatus[e['id']] === 0) {
        e['title'] = e['comments'].length > 0 ? `!!! ${e['name']}` : e['name']
        e['start'] = e['startDate']
        e['end'] = e['endDate']
        e['editable'] = false
        e['allDay'] = false
        e['className'] = 'pointer-hand'
        e['color'] = computeEventColor(s['id'], e['tutors'])
        e['type'] = 'session_event'
        e['sessionId'] = s['id']
        e['sessionName'] = s['name']
        e['sessionStartDate'] = s['startDate']
        e['sessionEndDate'] = s['endDate']
        e['sessionDescription'] = s['description']
        e['courseId'] = s['course']['id']
        e['courseTitle'] = s['course']['title']
        e['courseCode'] = s['course']['code']
        e['courseDescription'] = s['course']['description']
        events.push(e)
      }
    })
  })
}

function initializeCalendar () {
  sessions = (typeof window[sessionsIdx] === 'undefined') ? [] : JSON.parse(window[sessionsIdx])
  editableSessions = (typeof window[editableSessionsIdx] === 'undefined') ? [] : window[editableSessionsIdx]
  workspaces = (typeof window[workspacesIdx] === 'undefined') ? {} : window[workspacesIdx]
  sessionEventUsersStatus = (typeof window[sessionEventUsersStatusIdx] === 'undefined') ? [] : window[sessionEventUsersStatusIdx]
  initializeEvents()
  $('#courses-widget-calendar-' + widgetInstanceId).fullCalendar({
    header: {
      left: 'prev,next, today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    columnFormat: {
      month: 'ddd',
      week: 'ddd D/M',
      day: 'dddd D/M'
    },
    buttonText: {
      prev: t('prev'),
      next: t('next'),
      prevYear: t('prevYear'),
      nextYear: t('nextYear'),
      today: t('today'),
      month: t('month_'),
      week: t('week'),
      day: t('day_')
    },
    firstDay: 1,
    monthNames: t(['month.january', 'month.february', 'month.march', 'month.april', 'month.may', 'month.june', 'month.july', 'month.august', 'month.september', 'month.october', 'month.november', 'month.december']),
    monthNamesShort: t(['month.jan', 'month.feb', 'month.mar', 'month.apr', 'month.may', 'month.ju', 'month.jul', 'month.aug', 'month.sept', 'month.oct', 'month.nov', 'month.dec']),
    dayNames: t(['day.sunday', 'day.monday', 'day.tuesday', 'day.wednesday', 'day.thursday', 'day.friday', 'day.saturday']),
    dayNamesShort: t(['day.sun', 'day.mon', 'day.tue', 'day.wed', 'day.thu', 'day.fri', 'day.sat']),
    // This is the url which will get the events from ajax the 1st time the calendar is launched
    events: events,
    axisFormat: 'HH:mm',
    timeFormat: 'H:mm',
    agenda: 'h:mm{ - h:mm}',
    allDayText: t('isAllDay'),
    lazyFetching: false,
    fixedWeekCount: false,
    eventLimit: false,
    timezone: 'local',
    eventClick: onEventClick
  })
}

function onEventClick (event, jsEvent) {
  jsEvent.stopPropagation()
  jsEvent.preventDefault()
  let title = ''
  let body = ''

  switch (event['type']) {
    case 'session_start':
      title = Translator.trans('session_start_title', {sessionName: event['title']}, 'cursus')
      break
    case 'session_end':
      title = Translator.trans('session_end_title', {sessionName: event['title']}, 'cursus')
      break
    case 'session_event':
      title = Translator.trans('session_event_title', {eventName: event['title']}, 'cursus')
      break
  }

  let newCommentBtn
  let newCommentElement
  let editCommentElement
  let noCommentElement
  let commentsElement
  let workspaceLinkElement
  let noTutorElement
  let locationElement

  switch (event['type']) {
    case 'session_start':
    case 'session_end':
      body = `
          <div>
              <b>${Translator.trans('course', {}, 'cursus')} :</b>
              ${event['course']['title']} <small>[${event['course']['code']}]</small>
          </div>
          <hr>
          <div>
              <b>${Translator.trans('duration', {}, 'platform')} :</b>
              ${moment(event['startDate']).format('DD/MM/YYYY')}
              <i class="fa fa-long-arrow-right"></i>
              ${moment(event['endDate']).format('DD/MM/YYYY')}
          </div>
        `
      break
    case 'session_event': {
      newCommentBtn = `
              <button class="btn btn-default btn-sm" id="new-comment-creation-btn">
                  <i class="fa fa-plus-circle"></i>
                  ${Translator.trans('add_information', {}, 'cursus')}
              </button>
              <br>
            `

      newCommentElement = `
              <div id="comment-creation-box" class="hidden">
                  <b>${Translator.trans('add_information', {}, 'cursus')}</b>
                  <br>
                  <textarea id="new-comment-input" class="form-control" rows="3"></textarea>
                  <br>
                  <button id="new-comment-btn" data-event-id="${event['id']}" class="btn btn-primary btn-sm">
                      ${Translator.trans('add', {}, 'platform')}
                  </button>
                  <button id="new-comment-cancel-btn" class="btn btn-default btn-sm">
                      ${Translator.trans('cancel', {}, 'platform')}
                  </button>
              </div>
            `

      editCommentElement = `
              <div id="comment-edition-box" class="hidden">
                  <b>${Translator.trans('edit_information', {}, 'cursus')}</b>
                  <br>
                  <textarea id="comment-edition-input" class="form-control" rows="3"></textarea>
                  <br>
                  <button id="comment-edition-btn" class="btn btn-primary btn-sm">
                      ${Translator.trans('edit', {}, 'platform')}
                  </button>
                  <button id="comment-edition-cancel-btn" class="btn btn-default btn-sm">
                      ${Translator.trans('cancel', {}, 'platform')}
                  </button>
              </div>
            `

      noCommentElement = `
              <br>
              <div class="alert alert-warning">
                  ${Translator.trans('no_information', {}, 'cursus')}
              </div>
              `

      commentsElement = `
              <br>
              ${editableSessions[event['sessionId']] ? editCommentElement : ''}
              <br>
              <ul id="event-comments-list">
            `
      event['comments'].forEach(c => {
        commentsElement += `
                <li id="comment-${c['id']}">
                    <span class="comment-content">
                        ${c['content']}
                    </span>
                    ${
        c['user']['id'] === currentUserId ?
          '&nbsp;<i class="fa fa-edit pointer-hand edit-comment-btn" data-comment-id="' +
          c['id'] + '" data-event-id="' + event['id'] + '" style="color: #337EC4" data-toggle="tooltip" data-placement="top" title="' +
          Translator.trans('edit_information', {}, 'cursus') +
          '"></i>' :
          ''
        }
                    ${
        c['user']['id'] === currentUserId ?
          '&nbsp;<i class="fa fa-times-circle pointer-hand delete-comment-btn" data-comment-id="' +
          c['id'] + '" data-event-id="' + event['id'] + '" style="color: #D9534F" data-toggle="tooltip" data-placement="top" title="' +
          Translator.trans('delete_information', {}, 'cursus') +
          '"></i>' :
          ''
        }
                </li>
              `
      })
      commentsElement += `
              </ul>
              <br>
              ${editableSessions[event['sessionId']] ? newCommentBtn : ''}
              ${editableSessions[event['sessionId']] ? newCommentElement : ''}
            `

      workspaceLinkElement = workspaces[event['sessionId']] ?
        `
                <a href="${Routing.generate('claro_workspace_open_tool', {workspaceId: workspaces[event['sessionId']]['id'], toolName: 'home'})}">
                    <i class="fa fa-book"></i>
                    ${workspaces[event['sessionId']]['name']}
                </a>
                <hr>
              ` :
        ''

      noTutorElement = `
              <br>
              <div class="alert alert-warning">
                  ${Translator.trans('no_tutor', {}, 'cursus')}
              </div>
            `

      let tutorsElement = `
              <br>
              <div class="table-responsive">
                  <table class="table">
            `
      event['tutors'].forEach(t => {
        tutorsElement += `
                  <tr>
                      <td>${t['firstName']} ${t['lastName']}</td>
                      <td>
                          <a href="${Routing.generate('claro_message_form_for_user', {user: t['id']})}">
                              <i class="fa fa-envelope"></i>
                          </a>
                      </td>
                  </tr>
                `
      })
      tutorsElement += `
                  </table>
              </div>
            `

      locationElement = event['location'] ? `
              ${event['location']['street']}, ${event['location']['street_number']}
              <br>${event['location']['pc']} ${event['location']['town']}
              <br>${event['location']['country']}
            ` :
        ''

      body = `
              ${workspaceLinkElement}
              <ul class="nav nav-tabs" role="tablist">
                  <li role="presentation" class="${event['comments'].length === 0 ? 'active' : ''}">
                      <a href="#general-panel" role="tab" data-toggle="tab">
                          ${Translator.trans('general', {}, 'platform')}
                      </a>
                  </li>
                  <li role="presentation">
                      <a href="#tutors-panel" role="tab" data-toggle="tab">
                          ${Translator.trans('tutors', {}, 'cursus')}
                      </a>
                  </li>
                  <li role="presentation" class="${event['comments'].length > 0 ? 'active' : ''}">
                      <a href="#comments-panel" role="tab" data-toggle="tab">
                          ${Translator.trans('informations', {}, 'platform')}
                      </a>
                  </li>
              </ul>
              <div class="tab-content">
                  <div role="tabpanel" class="tab-pane ${event['comments'].length === 0 ? 'active' : ''}" id="general-panel">
                      <br>
                      <div class="panel-group" id="accordion-panel" role="tablist" aria-multiselectable="true">
                          <div class="panel panel-default">
                              <div class="panel-heading" role="tab">
                                  <h4 class="panel-title">
                                      <a role="button" data-toggle="collapse" data-parent="#accordion-panel" href="#collapse-course" aria-expanded="true">
                                          ${Translator.trans('course', {}, 'cursus')}
                                      </a>
                                  </h4>
                              </div>
                              <div id="collapse-course" class="panel-collapse collapse" role="tabpanel">
                                  <div class="panel-body">
                                      <b>${Translator.trans('title', {}, 'platform')} :</b>
                                      ${event['courseTitle']}
                                      <br>
                                      <b>${Translator.trans('code', {}, 'platform')} :</b>
                                      ${event['courseCode']}
                                      <br>
                                      ${event['courseDescription'] ? '<b>' + Translator.trans('description', {}, 'platform') + ' :</b>' : ''}
                                      ${event['courseDescription'] ? event['courseDescription'] : ''}
                                  </div>
                              </div>
                          </div>
                          <div class="panel panel-default">
                              <div class="panel-heading" role="tab">
                                  <h4 class="panel-title">
                                      <a role="button" data-toggle="collapse" data-parent="#accordion-panel" href="#collapse-session" aria-expanded="true">
                                          ${Translator.trans('session', {}, 'cursus')}
                                      </a>
                                  </h4>
                              </div>
                              <div id="collapse-session" class="panel-collapse collapse" role="tabpanel">
                                  <div class="panel-body">
                                      <b>${Translator.trans('name', {}, 'platform')} :</b>
                                      ${event['sessionName']}
                                      <br>
                                      <b>${Translator.trans('duration', {}, 'platform')} :</b>
                                      ${moment(event['sessionStartDate']).format('DD/MM/YYYY')}
                                      <i class="fa fa-long-arrow-right"></i>
                                      ${moment(event['sessionEndDate']).format('DD/MM/YYYY')}
                                      <br>
                                      ${event['sessionDescription'] ? '<b>' + Translator.trans('description', {}, 'platform') + ' :</b>' : ''}
                                      ${event['sessionDescription'] ? event['sessionDescription'] : ''}
                                  </div>
                              </div>
                          </div>
                          <div class="panel panel-default">
                              <div class="panel-heading" role="tab">
                                  <h4 class="panel-title">
                                      <a role="button" data-toggle="collapse" data-parent="#accordion-panel" href="#collapse-event" aria-expanded="true">
                                          ${Translator.trans('session_event', {}, 'cursus')}
                                      </a>
                                  </h4>
                              </div>
                              <div id="collapse-event" class="panel-collapse collapse in" role="tabpanel">
                                  <div class="panel-body">
                                      <b>${Translator.trans('duration', {}, 'platform')} :</b>
                                      ${moment(event['startDate']).format('DD/MM/YYYY HH:mm')}
                                      <i class="fa fa-long-arrow-right"></i>
                                      ${moment(event['endDate']).format('DD/MM/YYYY HH:mm')}
                                      <br>
                                      ${(event['location'] || event['locationExtra']) ? '<b>' + Translator.trans('location', {}, 'platform') + ' :</b>' : ''}
                                      ${event['location'] ? '<br>' + locationElement : ''}
                                      ${event['locationExtra'] ? '<br>' + event['locationExtra'] : ''}
                                      <br>
                                      ${event['description'] ? '<b>' + Translator.trans('description', {}, 'platform') + ' :</b>' : ''}
                                      ${event['description'] ? event['description'] : ''}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div role="tabpanel" class="tab-pane" id="tutors-panel">
                      ${event['tutors'].length > 0 ? tutorsElement : noTutorElement}
                  </div>
                  <div role="tabpanel" class="tab-pane ${event['comments'].length > 0 ? 'active' : ''}" id="comments-panel">
                      ${event['comments'].length > 0 || editableSessions[event['sessionId']] ? commentsElement : noCommentElement}
                  </div>
              </div>
            `
      break
    }
  }
  modal.simpleContainer(title, body)
}

$('body').on('click', '#new-comment-btn', function () {
  const comment = $('#new-comment-input').val()
  const eventId = parseInt($(this).data('event-id'))
  const route = Routing.generate('api_post_session_event_comment', {sessionEvent: eventId})

  $.ajax({
    url: route,
    type: 'POST',
    data: {comment: comment},
    success: function (datas) {
      const createdComment = JSON.parse(datas)
      const toAppend = `
          <li id="comment-${createdComment['id']}">
              <span class="comment-content">
                  ${createdComment['content']}
              </span>
              &nbsp
              <i class="fa fa-edit pointer-hand edit-comment-btn"
                 data-comment-id="${createdComment['id']}"
                 data-event-id="${eventId}"
                 data-toggle="tooltip"
                 data-placement="top"
                 title="${Translator.trans('edit_information', {}, 'cursus')}"
                 style="color: #337EC4"
              >
              </i>
              &nbsp
              <i class="fa fa-times-circle pointer-hand delete-comment-btn"
                 data-comment-id="${createdComment['id']}"
                 data-event-id="${eventId}"
                 data-toggle="tooltip"
                 data-placement="top"
                 title="${Translator.trans('delete_information', {}, 'cursus')}"
                 style="color: #D9534F"
              >
              </i>
          </li>
        `
      $('#comment-creation-box').hide('slow')
      $('#new-comment-input').val('')
      $('#new-comment-creation-btn').show('slow')
      $('#event-comments-list').append(toAppend)
      registerComment(eventId, createdComment)
    }
  })
})

$('body').on('click', '.edit-comment-btn', function () {
  selectedCommentId = parseInt($(this).data('comment-id'))
  selectedEventId = parseInt($(this).data('event-id'))
  $('#comment-edition-input').val(getCommentContent(selectedEventId, selectedCommentId))
  $('#comment-edition-box').show('slow')
  $('#comment-edition-box').removeClass('hidden')
})

$('body').on('click', '#comment-edition-btn', function () {
  const comment = $('#comment-edition-input').val()

  if (comment) {
    const url = Routing.generate('api_put_session_event_comment_edit', {sessionEventComment: selectedCommentId})
    $.ajax({
      url: url,
      type: 'PUT',
      data: {comment: comment},
      success: function (d) {
        const datas = JSON.parse(d)
        $('#comment-edition-box').hide('slow')
        $('#comment-edition-input').val('')
        $(`#comment-${selectedCommentId}`).find('.comment-content').html(datas['content'])
        updateComment(selectedEventId, selectedCommentId, datas['content'])
        selectedEventId = null
        selectedCommentId = null
      }
    })
  }
})

$('body').on('click', '#comment-edition-cancel-btn', function () {
  $('#comment-edition-box').hide('slow')
  $('#comment-edition-input').val('')
  selectedEventId = null
  selectedCommentId = null
})

$('body').on('click', '#new-comment-creation-btn', function () {
  $('#new-comment-creation-btn').hide('slow')
  $('#comment-creation-box').show('slow')
  $('#comment-creation-box').removeClass('hidden')
})

$('body').on('click', '#new-comment-cancel-btn', function () {
  $('#comment-creation-box').hide('slow')
  $('#new-comment-input').val('')
  $('#new-comment-creation-btn').show('slow')
})

$('body').on('click', '.delete-comment-btn', function () {
  const commentId = parseInt($(this).data('comment-id'))
  const eventId = parseInt($(this).data('event-id'))
  const route = Routing.generate('api_delete_session_event_comment', {sessionEventComment: commentId})

  $.ajax({
    url: route,
    type: 'DELETE',
    success: function (datas) {
      if (datas === 'success') {
        $(`#comment-${commentId}`).remove()
        removeComment(eventId, commentId)
      }
    }
  })
})

initializeCalendar()

$.ajaxSetup cache: true 

window.CURRENT_ROUTE = '/'

window.SORT_TYPE = 'alpha'
window.SORT_ORDER = 'desc'

window.RemoteFile = Backbone.Model.extend()

window.RemoteFiles = Backbone.Collection.extend
  model: RemoteFile,
  url: () ->
    route = escape window.CURRENT_ROUTE
    console.log "window.CURRENT_ROUTE: ", window.CURRENT_ROUTE
    window.BASE_URL + '?format=json&callback=?&path=' + route
  
  directories: () ->
    models = @.select (file) ->
      return false if (file.get 'name').match /^\./
      file.get 'directory?'
    _.map models, (model) ->
      model.toJSON()
  
  files: () ->
    models = @.select (file) ->
      return false if (file.get 'name').match /^\./
      !file.get 'directory?'
    _.map models, (model) ->
      model.toJSON()
      
  comparator: (file) ->
    if window.SORT_TYPE == 'date'
      criteria = Date.parse (file.get 'mtime')

      if window.SORT_ORDER == 'desc'
        criteria = -criteria

    if window.SORT_TYPE == 'alpha'
      criteria = (file.get 'name').toLowerCase()  
      
    
    return criteria
    

window.RemoteFilesView = Backbone.View.extend
  template: _.template $('#remote_files-template').html()

  initialize: () ->
    _.bindAll this, 'render'
    @collection.bind 'reset', @render
    @collection.fetch()
    
  render: () ->
    console.log 'RENDERING...'
    
    $(@el).html @template
      directories: @collection.directories()
      files: @collection.files()

    update_ui()
    
    return this

window.FilesClient = Backbone.Router.extend
  routes:
    '*path': 'default'

  default: (params) ->
    params = '/' if params.length <= 0
    window.CURRENT_ROUTE = params

    window.currentFiles = new RemoteFiles()
    window.currentView = new RemoteFilesView
      collection: window.currentFiles
      
    @remoteFilesView = window.currentView

    
    $('#listings').empty()
    $('#listings').append @remoteFilesView.render().el

  blank: () ->
    $('#main').empty()
    $('#main').text('blank')
    
init_soundmanager = ->
  soundManager.useFlashBlock = true
  soundManager.url = '/swf/'
  
  soundManager.onready ->
    window.pagePlayer = new PagePlayer()
    window.pagePlayer.init()
  
update_ui = ->
  $('#current_route').html(window.CURRENT_ROUTE)

  buttons = $('.file a, .directory a')
  buttons.button()
  buttons.width('100%')

  $('.file.mp3 a').click ->
    el = $(@)
    link = el
    href = link.attr('href')
    text = link.text()
    $('.playlist').append "<li><a href=\"#{href}\">#{text}</a></li>"
    return false

  $('.directory_up').button
    icons:
      primary: 'ui-icon-arrowreturnthick-1-n'
  
  $('.directory_up').click ->
    route_chunks = window.CURRENT_ROUTE.split '/'
    up_route = route_chunks.slice(0, route_chunks.length-1).join('/')
    window.App.navigate("##{up_route}", true)

  $('.clear_playlist').button
    icons:
      primary: 'ui-icon-closethick'
      
  $('.clear_playlist').click ->
    $('.playlist').empty()
    window.pagePlayer.stopSound(window.pagePlayer.lastSound)

  $('.queue_all').button
    icons:
      primary: 'ui-icon-transferthick-e-w'
  
  $('.sort').button()
  $('.sort').click ->
    if window.SORT_TYPE == 'alpha'
      $('.sort').text('Sort:Date')
      window.SORT_TYPE = 'date'
    else
      $('.sort').text('Sort:Alpha')
      window.SORT_TYPE = 'alpha'
    
    window.currentFiles.sort()

  $('.reverse').button()
  $('.reverse').click ->
    if window.SORT_ORDER == 'desc'
      window.SORT_ORDER = 'asc'
    else
      window.SORT_ORDER = 'desc'
  
    window.currentFiles.sort()
  
  $('.queue_all').click ->
    links = $('.file.mp3 a')
    links.each (i, ele) ->
      link = $(ele)
      href = link.attr('href')
      text = link.text()
      $('.playlist').append "<li><a href=\"#{href}\">#{text}</a></li>"
    return false
  
  $('.file span, .directory span').css('overflow', 'hidden')
  $('.file span, .directory span').hover ->
    $(this).attr('title', $(this).text())


$(document).ready ->
  init_soundmanager()
  
  window.App = new FilesClient()
  Backbone.history.start
    pushState: false

  update_ui()

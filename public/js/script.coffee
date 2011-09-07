# window.BASE_URL = 'http://url'
window.BASE_URL = 'http://localhost:3000'

window.CURRENT_ROUTE = '/'

window.RemoteFile = Backbone.Model.extend()

window.RemoteFiles = Backbone.Collection.extend
  model: RemoteFile,
  url: () ->
    console.log "window.CURRENT_ROUTE: ", window.CURRENT_ROUTE
    window.BASE_URL + '?format=json&callback=?&path=' + window.CURRENT_ROUTE
  
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

window.RemoteFilesView = Backbone.View.extend
  # tagName: 'section'
  # className: 'directories'
  template: _.template $('#remote_files-template').html()
  initialize: () ->
    _.bindAll this, 'render'
    @collection.bind 'reset', @render
    @collection.fetch()
    
  render: () ->
    
    $(@el).html @template
      directories: @collection.directories()
      files: @collection.files()

    init_ui()
    return this

window.FilesClient = Backbone.Router.extend
    routes:
      '*path': 'default'

    default: (params) ->
      console.log "params: ", params
      window.CURRENT_ROUTE = params

      @remoteFilesView = new RemoteFilesView
        collection: new RemoteFiles()
      
      $('#main').empty()
      $('#main').append @remoteFilesView.render().el

    blank: () ->
      $('#main').empty()
      $('#main').text('blank')
    
init_soundmanager = ->
  soundManager.useFlashBlock = true
  soundManager.url = '/swf/'
  
init_ui = ->
  $('.file a, .directory a').button().width('100%')
  
$(document).ready ->
  init_soundmanager()
  
  window.App = new FilesClient()
  Backbone.history.start
    pushState: false

  init_ui()

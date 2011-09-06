BASE_URL = 'http://url'

class Directory
  constructor: (@path) ->
    opts = 
      dataType: 'jsonp'
      data:
        path: @path
        format: 'json'
      success: (data) ->
        console.log "data: ", data            
      
    $.ajax BASE_URL, opts

window.FilesClient = Backbone.Router.extend
    routes:
      '*path': 'default'

    initialize: () ->
      # this.playlistView = new PlaylistView
      #     collection: window.player.playlist
      #     player: window.player
      #     library: window.library

      # this.libraryView = new LibraryView
      #     collection: window.library

    default: (params) ->
      $('#main').empty()
      $('#main').append(params)
      # $("#container").append(this.playlistView.render().el);
      # $("#container").append(this.libraryView.render().el);

    blank: () ->
      $('#main').empty()
      $('#main').text('blank')
    
init_soundmanager = ->
  soundManager.useFlashBlock = true
  soundManager.url = '/swf/'
  
$(document).ready ->

  window.App = new FilesClient()
  Backbone.history.start
    pushState: true
    
  init_soundmanager()

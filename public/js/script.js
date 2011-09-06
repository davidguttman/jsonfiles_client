(function() {
  var init_soundmanager;
  window.BASE_URL = 'http://url';
  window.CURRENT_ROUTE = '/';
  window.RemoteFile = Backbone.Model.extend();
  window.RemoteFiles = Backbone.Collection.extend({
    model: RemoteFile,
    url: function() {
      return BASE_URL + '?format=json&callback=?&path=' + CURRENT_ROUTE;
    }
  });
  window.FilesClient = Backbone.Router.extend({
    routes: {
      '*path': 'default'
    },
    initialize: function() {},
    "default": function(params) {
      var CURRENT_ROUTE;
      CURRENT_ROUTE = params;
      $('#main').empty();
      return $('#main').append(params);
    },
    blank: function() {
      $('#main').empty();
      return $('#main').text('blank');
    }
  });
  init_soundmanager = function() {
    soundManager.useFlashBlock = true;
    return soundManager.url = '/swf/';
  };
  $(document).ready(function() {
    window.App = new FilesClient();
    Backbone.history.start({
      pushState: true
    });
    return init_soundmanager();
  });
}).call(this);

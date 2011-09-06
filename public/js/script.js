(function() {
  var BASE_URL, Directory, init_soundmanager;
  BASE_URL = 'http://url';
  Directory = (function() {
    function Directory(path) {
      var opts;
      this.path = path;
      opts = {
        dataType: 'jsonp',
        data: {
          path: this.path,
          format: 'json'
        },
        success: function(data) {
          return console.log("data: ", data);
        }
      };
      $.ajax(BASE_URL, opts);
    }
    return Directory;
  })();
  window.FilesClient = Backbone.Router.extend({
    routes: {
      '*path': 'default'
    },
    initialize: function() {},
    "default": function(params) {
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

(function() {
  var init_soundmanager, init_ui;
  window.BASE_URL = 'http://localhost:3000';
  window.CURRENT_ROUTE = '/';
  window.RemoteFile = Backbone.Model.extend();
  window.RemoteFiles = Backbone.Collection.extend({
    model: RemoteFile,
    url: function() {
      console.log("window.CURRENT_ROUTE: ", window.CURRENT_ROUTE);
      return window.BASE_URL + '?format=json&callback=?&path=' + window.CURRENT_ROUTE;
    },
    directories: function() {
      var models;
      models = this.select(function(file) {
        if ((file.get('name')).match(/^\./)) {
          return false;
        }
        return file.get('directory?');
      });
      return _.map(models, function(model) {
        return model.toJSON();
      });
    },
    files: function() {
      var models;
      models = this.select(function(file) {
        if ((file.get('name')).match(/^\./)) {
          return false;
        }
        return !file.get('directory?');
      });
      return _.map(models, function(model) {
        return model.toJSON();
      });
    }
  });
  window.RemoteFilesView = Backbone.View.extend({
    template: _.template($('#remote_files-template').html()),
    initialize: function() {
      _.bindAll(this, 'render');
      this.collection.bind('reset', this.render);
      return this.collection.fetch();
    },
    render: function() {
      $(this.el).html(this.template({
        directories: this.collection.directories(),
        files: this.collection.files()
      }));
      $('#current_route').html(window.CURRENT_ROUTE);
      init_ui();
      return this;
    }
  });
  window.FilesClient = Backbone.Router.extend({
    routes: {
      '*path': 'default'
    },
    "default": function(params) {
      console.log("params: ", params);
      window.CURRENT_ROUTE = params;
      this.remoteFilesView = new RemoteFilesView({
        collection: new RemoteFiles()
      });
      $('#listings').empty();
      return $('#listings').append(this.remoteFilesView.render().el);
    },
    blank: function() {
      $('#main').empty();
      return $('#main').text('blank');
    }
  });
  init_soundmanager = function() {
    soundManager.useFlashBlock = true;
    soundManager.url = '/swf/';
    return soundManager.onready(function() {
      window.pagePlayer = new PagePlayer();
      return window.pagePlayer.init();
    });
  };
  init_ui = function() {
    var buttons;
    buttons = $('.file a, .directory a');
    buttons.button();
    buttons.width('100%');
    return $('.file a').click(function() {
      var el, href, link, text;
      el = $(this);
      link = el;
      href = link.attr('href');
      text = link.text();
      $('.playlist').append("<li><a href=\"" + href + "\">" + text + "</a></li>");
      return false;
    });
  };
  $(document).ready(function() {
    init_soundmanager();
    window.App = new FilesClient();
    Backbone.history.start({
      pushState: false
    });
    return init_ui();
  });
}).call(this);

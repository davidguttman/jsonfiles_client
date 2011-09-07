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
      $('#main').empty();
      return $('#main').append(this.remoteFilesView.render().el);
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
  init_ui = function() {
    return $('.file a, .directory a').button().width('100%');
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

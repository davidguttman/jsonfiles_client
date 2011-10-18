(function() {
  var init_soundmanager, update_ui;
  $.ajaxSetup({
    cache: true
  });
  window.BASE_URL = 'http://url';
  window.CURRENT_ROUTE = '/';
  window.SORT_TYPE = 'alpha';
  window.SORT_ORDER = 'desc';
  window.RemoteFile = Backbone.Model.extend();
  window.RemoteFiles = Backbone.Collection.extend({
    model: RemoteFile,
    url: function() {
      var route;
      route = escape(window.CURRENT_ROUTE);
      console.log("window.CURRENT_ROUTE: ", window.CURRENT_ROUTE);
      return window.BASE_URL + '?format=json&callback=?&path=' + route;
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
    },
    comparator: function(file) {
      var criteria;
      if (window.SORT_TYPE === 'date') {
        criteria = Date.parse(file.get('mtime'));
        if (window.SORT_ORDER === 'desc') {
          criteria = -criteria;
        }
      }
      if (window.SORT_TYPE === 'alpha') {
        criteria = (file.get('name')).toLowerCase();
      }
      return criteria;
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
      console.log('RENDERING...');
      $(this.el).html(this.template({
        directories: this.collection.directories(),
        files: this.collection.files()
      }));
      update_ui();
      return this;
    }
  });
  window.FilesClient = Backbone.Router.extend({
    routes: {
      '*path': 'default'
    },
    "default": function(params) {
      if (params.length <= 0) {
        params = '/';
      }
      window.CURRENT_ROUTE = params;
      window.currentFiles = new RemoteFiles();
      window.currentView = new RemoteFilesView({
        collection: window.currentFiles
      });
      this.remoteFilesView = window.currentView;
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
  update_ui = function() {
    var buttons;
    $('#current_route').html(window.CURRENT_ROUTE);
    buttons = $('.file a, .directory a');
    buttons.button();
    buttons.width('100%');
    $('.file.mp3 a').click(function() {
      var el, href, link, text;
      el = $(this);
      link = el;
      href = link.attr('href');
      text = link.text();
      $('.playlist').append("<li><a href=\"" + href + "\">" + text + "</a></li>");
      return false;
    });
    $('.directory_up').button({
      icons: {
        primary: 'ui-icon-arrowreturnthick-1-n'
      }
    });
    $('.directory_up').click(function() {
      var route_chunks, up_route;
      route_chunks = window.CURRENT_ROUTE.split('/');
      up_route = route_chunks.slice(0, route_chunks.length - 1).join('/');
      return window.App.navigate("#" + up_route, true);
    });
    $('.clear_playlist').button({
      icons: {
        primary: 'ui-icon-closethick'
      }
    });
    $('.clear_playlist').click(function() {
      $('.playlist').empty();
      return window.pagePlayer.stopSound(window.pagePlayer.lastSound);
    });
    $('.queue_all').button({
      icons: {
        primary: 'ui-icon-transferthick-e-w'
      }
    });
    $('.sort').button();
    $('.sort').click(function() {
      if (window.SORT_TYPE === 'alpha') {
        $('.sort').text('Sort:Date');
        window.SORT_TYPE = 'date';
      } else {
        $('.sort').text('Sort:Alpha');
        window.SORT_TYPE = 'alpha';
      }
      return window.currentFiles.sort();
    });
    $('.reverse').button();
    $('.reverse').click(function() {
      if (window.SORT_ORDER === 'desc') {
        window.SORT_ORDER = 'asc';
      } else {
        window.SORT_ORDER = 'desc';
      }
      return window.currentFiles.sort();
    });
    $('.queue_all').click(function() {
      var links;
      links = $('.file.mp3 a');
      links.each(function(i, ele) {
        var href, link, text;
        link = $(ele);
        href = link.attr('href');
        text = link.text();
        return $('.playlist').append("<li><a href=\"" + href + "\">" + text + "</a></li>");
      });
      return false;
    });
    $('.file span, .directory span').css('overflow', 'hidden');
    return $('.file span, .directory span').hover(function() {
      return $(this).attr('title', $(this).text());
    });
  };
  $(document).ready(function() {
    init_soundmanager();
    window.App = new FilesClient();
    Backbone.history.start({
      pushState: false
    });
    return update_ui();
  });
}).call(this);

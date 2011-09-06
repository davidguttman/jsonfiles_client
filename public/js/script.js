var CurrentURL = null;
var pagePlayer = null;
var Plays = store.get('plays') || {};

var RPlayer = {
  clear_history: function() {
    Plays = {};
    store.set('plays', Plays);
  }
}

function url_to_playlist_name (url) {
  url_components = url.split('/');
  name = url_components[url_components.length-1];
  return name.replace(/\+/g, " ");
}

function update_history_box () {
  var history_box = $('#playlist_history');
  $('.previous_playlist').remove();
  $('.clear_history').remove();
  
  _.each(Plays, function(stats, url) {
    Plays[url].url = url;
  });

  var sorted_plays = _.sortBy(Plays, function(playlist) {
    return playlist.last_played_at;
  });

  _.each(sorted_plays, function(stats, i) {
    var url = stats.url;
    var name = url_to_playlist_name(url);
    var history_item = $('<div class="previous_playlist">'+name+'</div>');
    history_box.prepend(history_item);
    history_item.click(function() {
      load_remote_playlist(url);
      history_box.fadeOut();
    });
  });
  
  var clear_history = $('<div class="clear_history">Clear History</div>');
  if ($('.previous_playlist').length > 0) {
    clear_history.click(function() {
      var really = confirm("Clear playlist history?");
      if (really) {
        RPlayer.clear_history();
        update_history_box();
        console.log("Playlist Cleared!");
      }
    });
    history_box.append(clear_history);
  }
}

function add_to_plays (remote_url) {
  if (Plays[remote_url]) {
  
  } else {
    Plays[remote_url] = {};
  }
  playlist = Plays[remote_url];
  playlist.count = playlist.count || 0;
  playlist.count += 1;
  playlist.last_played_at = new Date().getTime();
  
  store.set('plays', Plays);
  
  update_history_box();
  set_new_title(remote_url);
}

function set_new_title (url) {
  document.title = url_to_playlist_name(url);
}

function create_playlist (playlist) {
  $('#playlist_location').fadeOut();
  var playlist_e = $('#playlist');
  playlist_e.empty();

  var title = $('<h1>'+url_to_playlist_name(CurrentURL)+'</h1>').appendTo(playlist_e);

  var ul = $('<ul class="playlist"></ul>').appendTo(playlist_e);
  _.each(playlist, function(item) {
    var link = '<li><a href="'+item.mp3+'">'+item.name+'</a></li>';
    ul.append(link);
  })
  pagePlayer.init();
}

function load_remote_playlist (url) {
  location.hash = '#/' + url;
  var remote_url = unescape(url);
  var playlist_url = '/playlist?url='+url;
  $.getJSON(playlist_url, function(data) {
    CurrentURL = remote_url;
    create_playlist(data);
    add_to_plays(remote_url);
  });
}

function init_sound_manager () {
  soundManager.useFlashBlock = true;
  soundManager.url = '/swf/';
  create_page_player();
}

function create_page_player () {
  soundManager.onready(function() {
    pagePlayer = new PagePlayer();
    pagePlayer.init(typeof PP_CONFIG !== 'undefined' ? PP_CONFIG : null);
  });
}

$(document).ready(function() {
  $('#toggle_history').click(function() {
    $('#playlist_history').toggle();
  })
  
  var playlist_hash = location.hash.replace(/^#\//, "");
  $('#playlist_url').val(playlist_hash);

  if (playlist_hash.length > 0) {
    load_remote_playlist(playlist_hash);
  }
  
  $('#load_playlist').click(function() {
    var url = $('#playlist_url').val();
    load_remote_playlist(url);
  })
  update_history_box();

  init_sound_manager();
})


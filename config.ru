require 'rubygems'
require 'open-uri'
require 'sinatra'
require 'cgi'
require 'json'

set :public, File.dirname(__FILE__) + '/public'

get '/' do
  open(File.dirname(__FILE__) + '/public/index.html').read
end

get '/b' do
  open(params[:url]).read
end

get '/playlist' do
  playlist_url = request.query_string.gsub(/^url=/, "")
  playlist = open(playlist_url).read
  raw_tracks = playlist.split("#EXTINF:-1,")
  raw_tracks[1..-1].join("<br/>")
  playlist = raw_tracks[1..-1].map do |raw_track|
    name, path = raw_track.split("\n")
    {"name" => name, "mp3" => path, "free" => true}
  end
  playlist.to_json
end

run Sinatra::Application

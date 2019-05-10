const {
	addonBuilder
} = require("stremio-addon-sdk")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.StremioPodcust",
	"version": "0.0.1",
	"catalogs": [{
		"type": "Podcasts",
		"id": "poducsts",
		genres: ["a", "b", "c"],
		extraSupported: ['genre', 'search', 'skip']
	}],
	"resources": [
		"catalog",
		"stream",
		"meta"
	],
	"types": [
		"series"
	],
	"name": "top",
	"description": "Listen to amazing podcust of all types and all languages "
}
const builder = new addonBuilder(manifest)
var podcustAsMeta
var podcustAsMetaById = {};
builder.defineCatalogHandler(({
	type,
	id,
	extra
}) => {
	console.log("request for catalogs: " + type + " " + id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md

	getPodcust(extra.search)
	if (originalPodcustsList) {

		podcustAsMeta = [];
		originalPodcustsList.forEach(podcust => {
			var poducuatAsMeta = podcustToMeta(podcust);
			podcustAsMetaById[podcust.id] = poducuatAsMeta;
			podcustAsMeta.push(poducuatAsMeta);
		});
		return Promise.resolve({
			metas: podcustAsMeta
		})
	} else {


		return Promise.resolve({
			metas: [{
				id: "tt1254207",
				type: "movie",
				name: "The Big Buck Bunny",
				poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg"
			}]
		})
	}
})

var currentPoducastId;
builder.defineMetaHandler(({
	type,
	id
}) => {
	currentPoducastId = id;
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
	return Promise.resolve({
		meta: podcustAsMetaById[id]
	})
})

builder.defineStreamHandler(({
	id,
	type
}) => {
	console.log("request for streams: " + currentPoducastId)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	// serve one stream to big buck bunny
	const stream = {
		url: podcustAsMetaById[currentPoducastId].videosById[id].streams[0].url
	}
	return Promise.resolve({
		streams: [stream]
	})

	// otherwise return no streams
	/* 	return Promise.resolve({
			streams: []
		}) */
})

const axios = require('axios');
const unirest = require('unirest');
const date_time = require('date-time');
var genres;
var originalPodcustsList = [];

function getPodcust(searchQ) {

	var q = "star%20wars&";
	if (searchQ) {

		unirest.get('https://listen-api.listennotes.com/api/v2/search?q=' + searchQ + '&sort_by_date=0&type=podcust&offset=0&len_min=0&len_max=10&genre_ids=&published_before=&published_after=&only_in=title%2Cdescription&language=&ocid=&ncid=&safe_mode=1')
			.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b')
			.end(function (response) {
				var originalPodcustsList2 = response.body.results;
				console.log(response.body);
	
				originalPodcustsList2.forEach(function (podcust) {
	
					var pid = podcust.id
					unirest.get('https://listen-api.listennotes.com/api/v2/podcasts/' + pid + '?next_episode_pub_date=&sort=recent_first')
						.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b')
						.end(function (response) {
							originalPodcustsList.push(response.body);
						});
				});
			});
	}
	else {
	unirest.get('https://listen-api.listennotes.com/api/v2/best_podcasts?genre_id=125&page=2&region=fr&safe_mode=1')
		.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b')
		.end(function (response) {
			var originalPodcustsList2 = response.body.podcasts;
			console.log(response.body);

			originalPodcustsList2.forEach(function (podcust) {

				var pid = podcust.id
				unirest.get('https://listen-api.listennotes.com/api/v2/podcasts/' + pid + '?next_episode_pub_date=&sort=recent_first')
					.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b')
					.end(function (response) {
						originalPodcustsList.push(response.body);
					});
			});
		});}
}

/* function getPodcustGenres() {

	unirest.get('https://listen-api.listennotes.com/api/v2/genres')
		.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b')
		.end(function (response) {
			genres = response.body.genres;
		});
} */
//getPodcustGenres();

/* function getPodcustGenreById(genreId) {
	return (unirest.get('https://listen-api.listennotes.com/api/v2/genres?id=' + genreId)
		.header('X-ListenAPI-Key', '64dd1a7158b84dd7a60c7eda1028fa0b'))
} */

function podcustToMeta(podcust) {

	var awards = "Explicit Content: X | ";
	if (podcust.explicit_content) {
		awards = "Explicit Content: V | "
	}
	if (podcust.is_claimed) {
		awards += "Claimed: V"
	} else {
		awards += "Claimed: X"
	}

	var videos = createVideosMeta(podcust.episodes, podcust.extra.youtube_url)
	//getPodcustGenreById(podcust.genres)
	var meta = {
		id: podcust.id,
		type: "series",
		//name: podcust.title_original,
		name: podcust.title,
		poster: podcust.thumbnail,
		genres: ["tocomplete"],
		posterShape: "landscape",
		background: podcust.image,
		logo: "https://cdn3.iconfinder.com/data/icons/pyconic-icons-1-2/512/podcast-2-512.png",
		description: podcust.description,
		//releaseInfo: "",
		director: podcust.publisher,
		imdbRating: 9.9,
		//dvdRelease: "",
		//released: "",
		inTheaters: true,
		videos: videos.episodes,
		videosById: videos.byId,
		//certification: "",
		//runtime: podcust.audio_length_sec / 60,
		language: podcust.language,
		country: podcust.country,
		awards: awards,
		website: podcust.website,
		//audio: podcust.audio
	}


	return (meta);
}

function createVideosMeta(episodes, trailer) {
	var episodesAsMeta = [];
	var episodesById = {};

	episodes.forEach(function (episode, idx) {

		var video = {
			id: episode.id,
			title: episode.title,
			released: new Date(episode.pub_date_ms),
			thumbnail: episode.thumbnail,
			streams: [{
				url: episode.audio
			}],
			available: true,
			episode: idx + 1,
			season: 1,
			trailer: trailer,
			overview: episode.description
		}
		episodesById[video.id] = video;
		episodesAsMeta.push(video)
	});

	return {
		episodes: episodesAsMeta,
		byId: episodesById
	};


}

getPodcust();

module.exports = builder.getInterface()
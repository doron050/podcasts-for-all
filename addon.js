// External dependencies
const {
	addonBuilder
} = require("stremio-addon-sdk");

const axios = require('axios');
const date_time = require('date-time');

// Dependencie which read from the env variables
const dotenv = require('dotenv');
dotenv.config();

// Internal dependencies
const constants = require('./useful/const');
const logger = require("./useful/logger.js");
const convertors = require("./podcasts/convertors");
const podcastsData = require("./podcasts/podcastsData");
const genres = require("./podcasts/genres");
const genresData = require("./podcasts/genresData");

logger.info(constants.LOG_MESSAGES.START_ADDON);

// Init genrs objectk
genres.genresById = genresData.createPodcastGenresById(genres.genres);

// Define the addon
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	id: "community.StremioPodcust",
	version: "0.0.1",
	sorts: [{
		prop: "bla",
		name: "Twitch.tv",
		types: ["tv"]
	}],
	filter: {
		"query.twitch_id": {
			"$exists": true
		},
		"query.type": {
			"$in": ["tv"]
		}
	},
	catalogs: [{
		type: "Podcasts",
		id: "poducsts",
		genres: genresData.getGenresFromArray(genres.genres),
		//genrea: ["a","b","c"],
		extraSupported: ['genre', 'search', 'skip']
	}],
	resources: [
		"catalog",
		"stream",
		"meta"
	],
	types: [
		"series"
	],
	name: "top",
	description: "Listen to amazing podcust of all types and all languages "
}
const builder = new addonBuilder(manifest);

// Addon handlers
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(({
	type,
	id,
	extra
}) => {

	logger.debug(constants.LOG_MESSAGES.START_CATALOG_HANDLER + "type: " + type + " & id: " + id);

	let genre = "";
	if (extra.genre) genre = extra.genre;

	// If there is active search using search api instead of best podcasts api
	if (extra.search) {
		logger.debug(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search);

		return (

			podcastsData.searchPodcastsWithEpisodes(extra.search).then(function (podcasts) {

				let finalPodcasts = convertors.podcastsToSerieses(podcasts).asArray

				return {
					metas: finalPodcasts
				}
			})
		)
	} else {
		return (

			podcastsData.getBestPodcastsWithEpisodes(0, convertors.getGenreId(genre)).then(function (podcasts) {

				let finalPodcasts = convertors.podcastsToSerieses(podcasts).asArray

				return {
					metas: finalPodcasts
				}
			})
		)
	}
})

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
builder.defineMetaHandler(({
	type,
	id
}) => {

	logger.debug(constants.LOG_MESSAGES.START_META_HANDLER + "type: " + type + " & id: " + id);

	//currentPoducastId = id;
	return (podcastsData.getPodcastById(id).then(function (podcast) {

		return ({
			meta: convertors.podcastToSeries(podcast)
		});
	}));
})

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
builder.defineStreamHandler(({
	id,
	type
}) => {

	logger.debug(constants.LOG_MESSAGES.START_STREAM_HANDLER + "type: " + type + " & id: " + id);

	// serve one stream to big buck bunny

	//console.log("request for streams: " + currentPoducastId)
	return (podcastsData.getEpisodeById(id).then(function (episode) {

		return ({
			streams: [{
				url: episode.audio
			}]
		})
	}));
})

module.exports = builder.getInterface()
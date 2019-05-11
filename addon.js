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
		genres: genresData.getGenresIdsFromArray(genres.genres),
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
};
const builder = new addonBuilder(manifest);

// Addon handlers
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(async ({
	type,
	id,
	extra
}) => {

	logger.debug(constants.LOG_MESSAGES.START_CATALOG_HANDLER + "type: " + type + " & id: " + id);

	let genre = 0;
	if (extra.genre){
		genre = extra.genre;
		genre = genresData.findGenreId(genre)
	} 

	// If there is active search using search api instead of best podcasts api
	if (extra.search) {
		logger.debug(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search);
		const podcasts = await podcastsData.searchPodcasts(extra.search);
		let finalPodcasts = await convertors.podcastsToSerieses(podcasts).asArray;

		return {
			metas: finalPodcasts
		};
	}
	else {
		const podcasts = await podcastsData.getBestPodcasts(extra.skip ? extra.skip :  0, genre);
		const serieses = await convertors.podcastsToSerieses(podcasts);
		let finalPodcasts =	serieses.asArray;
		return {
			metas: finalPodcasts
		};
	}
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
builder.defineMetaHandler(async ({
	type,
	id
}) => {

	logger.debug(constants.LOG_MESSAGES.START_META_HANDLER + "type: " + type + " & id: " + id);

	//currentPoducastId = id;
	const podcast = await podcastsData.getPodcastById(id);
	return ({
		meta: await convertors.podcastToSeries(podcast),
		video: convertors.podcastToSeriesVideo(podcast)
	});
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
builder.defineStreamHandler(({
	id,
	type
}) => {

	logger.debug(constants.LOG_MESSAGES.START_STREAM_HANDLER + "type: " + type + " & id: " + id);

	return (podcastsData.getEpisodeById(id).then(function (episode) {

		let streams = [{
			url: episode.audio,
			title: constants.API_CONSTANTS.STREAMS_TITLES.DEFAULT_STREAM_TITLE
		},
		{
			externalUrl: episode.listennotes_url,
			title: constants.API_CONSTANTS.STREAMS_TITLES.LISTEN_NOTES_STREAM_TITLE
		}];

		if (episode.podcast.website) streams.push({
			externalUrl: episode.podcast.website,
			title: constants.API_CONSTANTS.STREAMS_TITLES.WEBSITE_STREAM_TITLE
		});

		if (episode.podcast.rss) streams.push({
			externalUrl: episode.podcast.rss,
			title: constants.API_CONSTANTS.STREAMS_TITLES.RSS_STREAM_TITLE
		});

		if (episode.podcast.extra.youtube_url) streams.push({
			ytid: episode.podcast.extra.youtube_url.split("?v=")[1],
			title: constants.API_CONSTANTS.STREAMS_TITLES.YOUTUBE_STREAM_TITLE
		});

		if (episode.podcast.extra.spotify_url) streams.push({
			externalUrl: episode.podcast.extra.spotify_url,
			title: constants.API_CONSTANTS.STREAMS_TITLES.SPOTIFY_STREAM_TITLE
		});

		return ({streams: streams})
	}));
});

module.exports = builder.getInterface();
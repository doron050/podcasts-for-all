// External dependencies
const {
	addonBuilder
} = require("stremio-addon-sdk");

// Dependencie which read from the env variables
require('dotenv').config();

// Internal dependencies
const constants = require('./common/const');
const logger = require("./common/logger.js");
const convertors = require("./podcasts/convertors");
const podcastsData = require("./podcasts/podcastsData");
const genresData = require("./podcasts/genresData");
const countriesData = require("./podcasts/countriesData");
const manifest = require('./manifest');

logger.info(constants.LOG_MESSAGES.START_ADDON + " Version: " + process.env.VERSION);

// Usibility counters
let usibilityCounters = {
	catalogRequests: 0,
	metaRequests: 0,
	streamRequests: 0,
	subtitleRequests: 0
};

const builder = new addonBuilder(manifest);

// Addon handlers
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(async ({
	type,
	id,
	extra
}) => {
	usibilityCounters.catalogRequests++;

	logger.info(constants.LOG_MESSAGES.START_CATALOG_HANDLER + "(type: " + type + " & id: " + id + ") Catalog Counter: " + usibilityCounters.catalogRequests, constants.HANDLERS.CATALOG, id);

	let genre = 0;
	let country = constants.API_CONSTANTS.DEFAULT_REGION;

	if (extra.genre && id === constants.CATALOGS.BY_GENRE.ID) {
		logger.info(constants.CATALOGS.BY_GENRE.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_GENRE.NAME, extra.genre);

		genre = extra.genre;
		genre = genresData.findGenreId(genre)
	} else if (extra.genre && id === constants.CATALOGS.BY_COUNTRY.ID) {
		logger.info(constants.CATALOGS.BY_COUNTRY.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_COUNTRY.NAME, extra.genre);

		country = extra.genre;
		country = countriesData.findCountryId(country);
	} else if (extra.genre && id === constants.CATALOGS.FEELING_LUCKY.ID) {
		logger.info(constants.CATALOGS.FEELING_LUCKY.NAME + ": Try his luck", constants.HANDLERS.CATALOG, constants.CATALOGS.FEELING_LUCKY.NAME);

		const podcast = await podcastsData.getFeelingLucky();
		const serieses = await convertors.podcastsToSerieses([convertors.luckyPodcastToPodcast(podcast)]);

		return {
			metas: serieses.asArray
		};
	}

	// If there is active search using search api instead of best podcasts api
	if (extra.search) {

		let Serieses = [];
		if (id === constants.CATALOGS.BY_GENRE.ID){

			logger.info(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search, constants.HANDLERS.CATALOG, constants.CATALOGS.SEARCH.NAME, extra.search.toLowerCase(), null, extra.search.toLowerCase());

			const podcasts = await podcastsData.searchPodcasts(extra.search);
			Serieses = await convertors.podcastsToSerieses(podcasts);
		}

		return {
			metas: Serieses.asArray
		};
	} else {
		const podcasts = await podcastsData.getBestPodcasts(extra.skip ? extra.skip : 0, genre, country);
		const serieses = await convertors.podcastsToSerieses(podcasts);
		let finalPodcasts = serieses.asArray;
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

	usibilityCounters.metaRequests++;

	logger.info(constants.LOG_MESSAGES.START_META_HANDLER + "(type: " + type + " & id: " + id + ") Meta Counter: " + usibilityCounters.metaRequests, constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST);
	id = id.replace(constants.ID_PREFIX, "");

	const podcast = await podcastsData.getPodcastById(id);

	logger.info("Podcast: " + podcast.title + " | " + podcast.country + " | " + podcast.language, constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, podcast);

	return {
		meta: await convertors.podcastToSeries(podcast),
		video: convertors.podcastToSeriesVideo(podcast)
	};
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
builder.defineStreamHandler(async ({
	id,
	type
}) => {

	usibilityCounters.streamRequests++;
	logger.info(constants.LOG_MESSAGES.START_STREAM_HANDLER + "(type: " + type + " & id: " + id + ") Stream Counter: " + usibilityCounters.streamRequests, constants.HANDLERS.STREAM, constants.API_CONSTANTS.TYPES.EPISODE, null, 1, id);

	id = id.replace(constants.ID_PREFIX, "");

	const episode = await podcastsData.getEpisodeById(id);
	return {
		streams: convertors.getStreamsFromEpisode(episode)
	};
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
builder.defineSubtitlesHandler(async function (args) {

	logger.info(constants.LOG_MESSAGES.START_SUBTITLE_HANDLER + "(type: " + args.type + " & id: " + args.id + ") Subtitle Counter: " + usibilityCounters.subtitleRequests, constants.HANDLERS.SUBTITLE, constants.API_CONSTANTS.TYPES.EPISODE, null, 1, args.id);

	return {
		subtitles: []
	};
});

module.exports = builder.getInterface();
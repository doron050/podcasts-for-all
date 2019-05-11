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
const countries = require("./podcasts/countries");
const genresData = require("./podcasts/genresData");
const countriesData = require("./podcasts/countriesData");

logger.info(constants.LOG_MESSAGES.START_ADDON);

// Init genrs objectk
genres.genresById = genresData.createPodcastGenresById(genres.genres);

// Define the addon
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	id: "community.StremioPodcust",
	version: process.env.VERSION,
	catalogs: [{
			type: constants.CATALOGS.TYPE,
			id: constants.CATALOGS.BY_GENRE.ID,
			name: constants.CATALOGS.BY_GENRE.NAME,
			genres: genresData.getGenresIdsFromArray(genres.genres),
			extraSupported: ['genre', 'search', 'skip']
		},
		{
			type: constants.CATALOGS.TYPE,
			id: constants.CATALOGS.BY_COUNTRY.ID,
			name: constants.CATALOGS.BY_COUNTRY.NAME,
			genres: countriesData.getCountriesStringsArray(countries),
			extraSupported: ['genre', 'search', 'skip']
		},
		{
			type: constants.CATALOGS.TYPE,
			id: constants.CATALOGS.FEELING_LUCKY.ID,
			name: constants.CATALOGS.FEELING_LUCKY.NAME,
			genres: constants.CATALOGS.FEELING_LUCKY.GENRES,
			extraSupported: ['genre', 'search', 'skip']
		}
	],
	resources: [
		"catalog",
		{
			name: 'stream',
			types: ['series'],
			idPrefixes: [constants.ID_PREFIX]
		},
		{
			name: 'meta',
			types: ['series'],
			idPrefixes: [constants.ID_PREFIX]
		}
	],
	types: [
		"series"
	],
	name: "Podcasts For All",
	contactEmail: constants.CONTACT_EMAIL,
	logo: constants.ADDON_LOGO,
	background: constants.ADDON_BACKGROUND,
	description: "Stream the best and most verstile HQ Podcasts- It will be a great listening experience! (Powered by LISTEN NOTES)"
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
	let country = constants.API_CONSTANTS.DEFAULT_REGION;

	if (extra.genre && id === constants.CATALOGS.BY_GENRE.ID) {
		genre = extra.genre;
		genre = genresData.findGenreId(genre)
	}
	else if (extra.genre && id === constants.CATALOGS.BY_COUNTRY.ID){
		country = extra.genre;
		country = countriesData.findCountryId(country);
	}
	else if (extra.genre && id === constants.CATALOGS.FEELING_LUCKY.ID){
		return (podcastsData.getFeelingLucky()).then(function(podcast){
			return (convertors.podcastsToSerieses([convertors.luckyPodcastToPodcast(podcast)]).then(function(serieses){

				return {
					metas: serieses.asArray
				};
			}))
		});
	}

	// If there is active search using search api instead of best podcasts api
	if (extra.search) {
		logger.debug(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search);
		const podcasts = await podcastsData.searchPodcasts(extra.search);
		const Serieses = await convertors.podcastsToSerieses(podcasts);

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


	logger.debug(constants.LOG_MESSAGES.START_META_HANDLER + "type: " + type + " & id: " + id);
	id = id.replace(constants.ID_PREFIX, "");

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
	id = id.replace(constants.ID_PREFIX, "");

	return (podcastsData.getEpisodeById(id).then(function (episode) {

		return ({
			streams: convertors.getStreamsFromEpisode(episode)
		})
	}));
});

module.exports = builder.getInterface();
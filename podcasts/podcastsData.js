const logger = require("../common/logger");
const constants = require("../common/const");

async function getBestPodcasts(skip, genreId, region) {

    logger.trace(constants.LOG_MESSAGES.START_GET_BEST_PODCASTS);
    const podcastPerRequest = 20;

    // For genre filter
    let genre = constants.API_CONSTANTS.DEFAULT_GENRE;
    if (genreId) genre = genreId;

    let regionFilter = constants.API_CONSTANTS.DEFAULT_REGION;
    if (region) regionFilter = region;

    let podcasts = [];
    let canKeepPulling = true;
    let internalPage = skip/podcastPerRequest + 1;

    do {
        const result = await constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.BEST_PODCASTS, {
            params: {
                page: internalPage,
                genre_id: genre,
                region: regionFilter
            }
        });

        podcasts.push(...result.data.podcasts);
        canKeepPulling = result.data.has_next;
        internalPage++;

    } while (podcasts.length < 40 && canKeepPulling);

    logger.trace(constants.LOG_MESSAGES.SUCCESS_GET_BEST_PODCASTS + podcasts.length);
    return podcasts;
}

async function searchPodcasts(searchTerm, genreIds, offsetForPagination) {
    logger.trace(constants.LOG_MESSAGES.START_SEARCH_PODCASTS + searchTerm);

    // For offset for pagination filter
    let offset = constants.API_CONSTANTS.DEFAULT_OFFSET;
    if (offsetForPagination) offset = offsetForPagination;

    try {
        const result = await constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.SEARCH, {
            params: {
                q: searchTerm,
                sort_by_date: constants.API_CONSTANTS.SORT.BY_RELEVANCE,
                type: constants.API_CONSTANTS.TYPES.PODCAST,
                offset: offset,
                genre_Ids: genreIds,
                only_in: [constants.API_CONSTANTS.ONLY_IN_FIELDS.TITLE, constants.API_CONSTANTS.ONLY_IN_FIELDS.DESCRIPTION],
                safe_mode: constants.API_CONSTANTS.EXCLUDE_EXCPLICIT.YES
            }
        });

        logger.trace(constants.LOG_MESSAGES.SUCCESS_SEARCH_PODCASTS + result.data.results.length);
        return result.data.results;
    }
    catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_SEARCH_PODCASTS + e);
    }
}

async function getPodcastById(id, params = {}) {
    logger.trace(constants.LOG_MESSAGES.START_GET_PODCAST_BY_ID + id);

    // For offset for pagination filter
    try {
        const response = await constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.PODCAST_BY_ID + id, {
            params
        });
        logger.trace(constants.LOG_MESSAGES.SUCCESS_GET_PODCAST_BY_ID + response.data.id);
        return response.data;
    }
    catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_GET_PODCAST_BY_ID + e);
    }
}

async function getEpisodeById(id) {
    logger.trace(constants.LOG_MESSAGES.START_GET_EPISODE_BY_ID + id);

    // For offset for pagination filter
    try {
        const response = await constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.EPISODE_BY_ID + id);
        logger.trace(constants.LOG_MESSAGES.SUCCESS_GET_EPISODE_BY_ID + response.data.id);
        return response.data;
    }
    catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_GET_EPISODE_BY_ID + e);
    }
}

async function getAllEpisodesForPodcast(podcast){
    const episodes = [];
    episodes.push(...podcast.episodes);
    let nextEpisodePubDate = podcast.next_episode_pub_date;

    while (nextEpisodePubDate) {
        const results = await getPodcastById(podcast.id, {
            next_episode_pub_date: nextEpisodePubDate,
        });

        nextEpisodePubDate = results.next_episode_pub_date;
        episodes.push(...results.episodes)
    }

    return episodes.reverse();
}

async function getFeelingLucky() {
    logger.trace(constants.LOG_MESSAGES.START_FEELING_LUCKY);

    // For offset for pagination filter
    try {
        const response = await constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.FEELING_LUCKY);

        logger.trace(constants.LOG_MESSAGES.SUCCESS_GET_FEELING_LUCKY + response.data.id);
        return response.data;
    }
    catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_FEELING_LUCKY + e);
    }
}

module.exports = {
    getAllEpisodesForPodcast,
    searchPodcasts,
    getBestPodcasts,
    getPodcastById,
    getEpisodeById,
    getFeelingLucky
}
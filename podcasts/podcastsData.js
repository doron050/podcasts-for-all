const logger = require("../useful/logger");
const constants = require("../useful/const");

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
            }
        });

        podcasts.push(...result.data.podcasts);
        canKeepPulling = result.data.has_next;
        internalPage++;

    } while (podcasts.length < 100 && canKeepPulling);

    logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_BEST_PODCASTS + podcasts.length);
    return podcasts;
}

function getBestPodcastsWithEpisodes(page, genreId, region) {

    let podcastsWithEpisodes = [];
    let podcastsByIdPromises = [];
    let counterPomisesByIdDone = 0;
    let numberOfPodcasts;

    return (
        getBestPodcasts(page, genreId, region).then(function (podcasts) {

            if (podcasts)numberOfPodcasts = podcasts.length;
            else podcasts = [];
            
            podcasts.forEach(podcast => {

                getPodcastById(podcast.id).then(function (podcastWithEpisodes) {

                    podcastsWithEpisodes.push(podcastWithEpisodes);
                    counterPomisesByIdDone++;
                });

            });
        }).then(function () {

            var podcastsWithEpisodesPromise = new Promise(function (resolve, reject) {

                let intervalA = setInterval(function () {

                    // Checks if all promises of getting podcast by id as done
                    if (counterPomisesByIdDone == numberOfPodcasts) {

                        logger.info(constants.LOG_MESSAGES.END_HANDLE_WITH_PROMISES + counterPomisesByIdDone);

                        clearInterval(intervalA);
                        resolve(podcastsWithEpisodes)
                    } else {

                        logger.trace(constants.LOG_MESSAGES.ON_GOING_HANDLE_WITH_PROMISES + (numberOfPodcasts - counterPomisesByIdDone));
                    }
                }, 500);
            });
            // Returns a promise that will resolve when all the requests to get data about podcasts by id will be done
            return (podcastsWithEpisodesPromise)
        }));
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

        logger.debug(constants.LOG_MESSAGES.SUCCESS_SEARCH_PODCASTS + result.data.results.length);

        return result.data.results;
    }
    catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_SEARCH_PODCASTS + e);
    }
}

function searchPodcastsWithEpisodes(searchTerm, genreIds, offsetForPagination) {

    let podcastsWithEpisodes = [];
    let podcastsByIdPromises = [];
    let counterPomisesByIdDone = 0;
    let numberOfPodcasts;

    return (
        searchPodcasts(searchTerm, genreIds, offsetForPagination).then(function (podcasts) {

            numberOfPodcasts = podcasts.length;

            podcasts.forEach(podcast => {

                getPodcastById(podcast.id).then(function (podcastWithEpisodes) {

                    podcastsWithEpisodes.push(podcastWithEpisodes);
                    counterPomisesByIdDone++;
                });

            });
        }).then(function () {

            var podcastsWithEpisodesPromise = new Promise(function (resolve, reject) {

                let intervalA = setInterval(function () {

                    // Checks if all promises of getting podcast by id as done
                    if (counterPomisesByIdDone == numberOfPodcasts) {

                        logger.info(constants.LOG_MESSAGES.END_HANDLE_WITH_PROMISES + counterPomisesByIdDone);

                        clearInterval(intervalA);
                        resolve(podcastsWithEpisodes)
                    } else {

                        logger.trace(constants.LOG_MESSAGES.ON_GOING_HANDLE_WITH_PROMISES + (numberOfPodcasts - counterPomisesByIdDone));
                    }
                }, 500);
            });
            // Returns a promise that will resolve when all the requests to get data about podcasts by id will be done
            return (podcastsWithEpisodesPromise)
        }));
}

function getPodcastById(id) {

    logger.trace(constants.LOG_MESSAGES.START_GET_PODCAST_BY_ID + id);

    // For offset for pagination filter
    return (constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.PODCAST_BY_ID + id, {
            params: {
                //next_episode_pub_date: "",
            }
        })
        .then(function (response) {

            logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_PODCAST_BY_ID + response.data.id);

            return (response.data);
        })
        .catch(function (error) {

            logger.error(constants.LOG_MESSAGES.ERROR_GET_PODCAST_BY_ID + error);
        }));
}

function getEpisodeById(id) {

    logger.trace(constants.LOG_MESSAGES.START_GET_EPISODE_BY_ID + id);

    // For offset for pagination filter
    return (constants.apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.EPISODE_BY_ID + id)
        .then(function (response) {

            logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_EPISODE_BY_ID + response.data.id);

            return (response.data);
        })
        .catch(function (error) {

            logger.error(constants.LOG_MESSAGES.ERROR_GET_EPISODE_BY_ID + error);
        }));
}

module.exports = {
    searchPodcasts,
    getBestPodcasts,
    getBestPodcastsWithEpisodes,
    searchPodcastsWithEpisodes,
    getPodcastById,
    getEpisodeById
}
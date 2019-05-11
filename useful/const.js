const axios = require('axios');

// Define all the const that are use by the addon
const LOG_LEVEL = "debug";

const LOG_MESSAGES = {
    START_ADDON: "** Start Addon - dependencies loaded **",
    START_CONVERT_EPISODE_TO_VIDEO: "Start convert episode to video: ",
    START_CONVERT_EPISODES_TO_VIDEOS: "Start convert episodes to videos: ",
    START_CONVERT_PODCAST_TO_SERIES: "Start convert podcast to series: ",
    START_GET_BEST_PODCASTS: "Start get best podcasts: ",
    START_SEARCH_PODCASTS: "Start search for podcasts: ",
    START_GET_PODCAST_BY_ID: "Start get podcast by id: ",
    START_GET_EPISODE_BY_ID: "Start get episode by id: ",
    SUCCESS_GET_BEST_PODCASTS: "Success- get best podcasts! number of results: ",
    SUCCESS_SEARCH_PODCASTS: "Success- search podcasts! number of results: ",
    SUCCESS_GET_PODCAST_BY_ID: "Success- get podcast by id: ",
    SUCCESS_GET_EPISODE_BY_ID: "Success- get episode by id: ",
    SUCCESS_FIND_GENRE_BY_ID: "Success- Find match genre (by genre name): ",
    SUCCESS_TRANSLATE_GENRES_IDS_TO_NAMES: "Success- Translate genre ids to names: ",
    SUCCESS_TRANSLATE_GENRES_NAMES_TO_IDS: "Success- Translate genre names to ids: ",
    ERROR_GET_BEST_PODCASTS: "Error- get best podcasts! Error: ",
    ERROR_SEARCH_PODCASTS: "Error- search podcasts! Error: ",
    ERROR_GET_PODCAST_BY_ID: "Error- get podcast by id! Error: ",
    ERROR_GET_EPISODE_BY_ID: "Error- get episode by id! Error: ",
    START_CATALOG_HANDLER: "Handler: Catalog | ",
    SEARCH_ON_CATALOG_HANDLER: "Search available: ",
    START_META_HANDLER: "Handler: Meta | ",
    START_STREAM_HANDLER: "Handler: Stream | ",
    ON_GOING_HANDLE_WITH_PROMISES: "Not all promises 'getPodcastById' completed yet. More to go: ",
    END_HANDLE_WITH_PROMISES: "All promises handled: ",
    INIT_GENRES_BY_ID_OBJECT: "Done! Create genres object. Num of genres: "
}

const PODCAST_LOGO = "https://cdn3.iconfinder.com/data/icons/pyconic-icons-1-2/512/podcast-2-512.png";

const PODCASTS_DATA_BASE_API_URL = "https://listen-api.listennotes.com"

const PODCASTS_DATA_API_ROUTES = {
    SEARCH: "/api/v2/search",
    PODCAST_BY_ID: "/api/v2/podcasts/",
    EPISODE_BY_ID: "/api/v2/episodes/",
    BEST_PODCASTS: "/api/v2/best_podcasts",
    GENRES: "/api/v2/genres"
}

const PODCASTS_API_KEY = {
    HEADER_NAME: 'X-ListenAPI-Key',
    KEY: process.env.PODCASTS_API_KEY
}

// Podcast api docs https://www.listennotes.com/api/docs/
const apiInstance = axios.create({
    baseURL: PODCASTS_DATA_BASE_API_URL,
    //timeout: 2000,
    headers: {
        'X-ListenAPI-Key': PODCASTS_API_KEY.KEY
    }
});

const API_CONSTANTS = {
    DEFAULT_GENRE: 0,
    DEFAULT_OFFSET: 0,
    DEFAULT_REGION: "us",
    DEFAULT_CERTIFICATION: "PG",
    SORT: {
        BY_RELEVANCE: 0,
        BY_DATE: 1
    },
    TYPES: {
        PODCAST: "podcast",
        EPISODE: "episode"
    },
    ONLY_IN_FIELDS: {
        TITLE: "title",
        DESCRIPTION: "description",
        AUTHOR: "author",
        AUDIO: "audio"
    },
    EXCLUDE_EXCPLICIT: {
        YES: 1,
        NO: 0
    },
    STREAMS_TITLES: {
        DEFAULT_STREAM_TITLE: "Stream",
        LISTEN_NOTES_STREAM_TITLE: "Powered by LISTEN NOTES",
        RSS_STREAM_TITLE: "RSS Feed",
        WEBSITE_STREAM_TITLE: "Website",
        SPOTIFY_STREAM_TITLE: "Spotify",
        YOUTUBE_STREAM_TITLE: "Youtube (built-in player)"
    }
}

module.exports = {
    LOG_LEVEL,
    LOG_MESSAGES,
    PODCAST_LOGO,
    PODCASTS_DATA_BASE_API_URL,
    PODCASTS_DATA_API_ROUTES,
    PODCASTS_API_KEY,
    apiInstance,
    API_CONSTANTS
}
const logger = require("../useful/logger");
const constants = require("../useful/const");
const podcastsData = require("./podcastsData");
const genresData = require("./genresData");

// All functions that convert podcast or episode object to Stremio object
function episodeToVideo(episode, episodeNumber) {

    logger.trace(constants.LOG_MESSAGES.START_CONVERT_EPISODE_TO_VIDEO + episode.id);

    let video = {
        id: constants.ID_PREFIX + episode.id,
        title: episode.title,
        released: (new Date(episode.pub_date_ms)).toISOString(),
        thumbnail: episode.thumbnail,
        streams: [{
            url: episode.audio
        }],
        available: true,
        episode: episodeNumber,
        season: 1,
        //trailer: trailer,
        overview: episode.description
    }

    return (video);
}

function episodesToVideos(episodes) {

    logger.trace(constants.LOG_MESSAGES.START_CONVERT_EPISODES_TO_VIDEOS + episodes.length);

    let videos = {
        asArray: [],
        asObjectById: {}
    };

    let episodeNumber = 1;

    episodes.forEach(episode => {

        let currentVideo = episodeToVideo(episode, episodeNumber);

        episodeNumber++;

        videos.asArray.push(currentVideo);
        videos.asObjectById[episode.id] = currentVideo;
    });

    return (videos);
}

async function podcastToSeries(podcast) {

    logger.trace(constants.LOG_MESSAGES.START_CONVERT_PODCAST_TO_SERIES + podcast.id);

    let series = {
        id: constants.ID_PREFIX + podcast.id,
        type: "series",
        name: podcast.title,
        poster: podcast.thumbnail,
        //genres: genresData.getGenresStringsFromArray(podcast.genre_ids),
        genres: generateBasicGenres(podcast),
        posterShape: "landscape",
        background: podcast.image,
        logo: constants.PODCAST_LOGO,
        description: podcast.description,
        releaseInfo: generateReleaseInfo(podcast.earliest_pub_date_ms, podcast.latest_pub_date_ms),
        director: [podcast.publisher],
        //imdbRating: 10,
        //dvdRelease: "",
        released: (new Date(podcast.earliest_pub_date_ms)).toISOString(),
        inTheaters: true,
        //videos: episodesAsVideos.asArray,
        certification: constants.API_CONSTANTS.DEFAULT_CERTIFICATION,
        //runtime = "Last episode length: " + (podcast.episodes[0].audio_length_sec / 60).toFixed(0) + " minutes",
        language: podcast.language,
        country: podcast.country,
        awards: generateAwards(podcast.explicit_content, podcast.is_claimed),
        website: podcast.website
    }

    // Sets series parameters if there is episodes to the podcast
    if (podcast.episodes) {
        const allEpisodes = await podcastsData.getAllEpisodesForPodcast(podcast);
        series.runtime = "Last episode length: " + (podcast.episodes[0].audio_length_sec / 60).toFixed(0) + " minutes";
        series.genres = genresData.getGenresStringsFromArray(podcast.genre_ids);

        let episodesAsVideos = episodesToVideos(allEpisodes);
        series.videos = episodesAsVideos.asArray;

        // Adds extra field on the series (the episodes / videos by id)
        series.videosById = episodesAsVideos.asObjectById;
    }

    return series;
}

async function podcastsToSerieses(podcasts, simpleGenre){
    let serieses = {
        asArray: [],
        asObjectById: {}
    };

    for (let i=0;i<podcasts.length;i++){
        let currentSeries = await podcastToSeries(podcasts[i]);

        serieses.asArray.push(currentSeries);
        serieses.asObjectById[podcasts[i].id] = currentSeries;
    }

    return serieses;
}

function generateAwards(explicit_content, is_claimed) {

    let awards = "Explicit Content: X | ";

    if (explicit_content) {
        awards = "Explicit Content: V | "
    }

    awards += "Claimed: ";

    if (is_claimed) {
        awards += "V"
    } else {
        awards += "X"
    }

    return (awards);
}

function generateBasicGenres(podcast) {

    let basicGenres = [constants.API_CONSTANTS.STREAMS_TITLES.LISTEN_NOTES_STREAM_TITLE,
        "Number of Episodes: " + podcast.total_episodes,
        "Country: " + podcast.country, "Language: " + podcast.language
    ]

    if (podcast.explicit_content) basicGenres.push("*Include Explicit Contact")

    return (basicGenres);
}

function generateReleaseInfo(oldestEpisodeTime, newestEpisodeTime) {

    // The release info label shows years
    let oldestEpisodeYear = (new Date(oldestEpisodeTime)).getFullYear();
    let newestEpisosdeYear = (new Date(newestEpisodeTime)).getFullYear();
    let releaseInfo = oldestEpisodeYear + "-" + newestEpisosdeYear;
    if (oldestEpisodeYear == newestEpisosdeYear) {

        releaseInfo = oldestEpisodeYear;
    }

    return (releaseInfo);
}

function podcastToSeriesVideo(podcast) {

    return ({
        id: podcast.id,
        title: podcast.title,
        thumbnail: podcast.thumbnail,
        released: (new Date(podcast.earliest_pub_date_ms)).toISOString(),
        available: true,
        //season: 1,
        //episode: 1,
        trailer: podcast.youtube_url,
        overview: podcast.description
    })
}

module.exports = {
    episodesToVideos,
    podcastsToSerieses,
    podcastToSeries,
    podcastToSeriesVideo
};
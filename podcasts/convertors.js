const logger = require("../useful/logger");
const constants = require("../useful/const");
const podcastsData = require("./podcastsData");
const genresData = require("./genresData");

// All functions that convert podcast or episode object to Stremio object
function episodeToVideo(episode, episodeNumber){

    logger.trace(constants.LOG_MESSAGES.START_CONVERT_EPISODE_TO_VIDEO + episode.id);

    let video = {
        id: episode.id,
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

function episodesToVideos(episodes){

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

function podcastToSeries(podcast){

    logger.trace(constants.LOG_MESSAGES.START_CONVERT_PODCAST_TO_SERIES + podcast.id);

    let episodesAsVideos = episodesToVideos(podcast.episodes);

	var series = {
		id: podcast.id,
		type: "series",
		name: podcast.title,
		poster: podcast.thumbnail,
		genres: genresData.getGenresStringsFromArray(podcast.genre_ids), //todo: set geners by data from podcast
		posterShape: "landscape",
		background: podcast.image,
		logo: constants.PODCAST_LOGO,
		description: podcast.description,
		releaseInfo: (new Date(podcast.earliest_pub_date_ms)).getFullYear() + "-" + (new Date(podcast.latest_pub_date_ms)).getFullYear(),
		director: podcast.publisher,
		imdbRating: 10,
		//dvdRelease: "",
		released: (new Date(podcast.earliest_pub_date_ms)).toISOString(),
		inTheaters: true,
		videos: episodesAsVideos.asArray,
        certification: constants.API_CONSTANTS.DEFAULT_CERTIFICATION,
        runtime: "Last episode length: " + (podcast.episodes[0].audio_length_sec / 60).toFixed(0) + " minutes",
		language: podcast.language,
		country: podcast.country,
		awards: generateAwards(podcast.explicit_content, podcast.is_claimed),
		website: podcast.website
    }
    
    // Adds extra field on the series (the episodes / videos by id)
    series.videosById = episodesAsVideos.asObjectById;

    return (series);
}

function podcastsToSerieses(podcasts){

    let serieses = {
        asArray: [],
        asObjectById: {}
    };

    podcasts.forEach(podcast => {
        
        let currentSeries = podcastToSeries(podcast);

        serieses.asArray.push(currentSeries);
        serieses.asObjectById[podcast.id] = currentSeries;
    });

    return (serieses);
}

function generateAwards(explicit_content, is_claimed){

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

function generateGenres(podcastGenres){

    // TODO: Get strings by podcasts genres ids
    return (["drama", "history"])
}



module.exports = {episodesToVideos, podcastsToSerieses, podcastToSeries};
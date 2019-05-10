const {
	addonBuilder
} = require("stremio-addon-sdk")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.StremioPodcust",
	"version": "0.0.1",
	"sorts": [{prop: "bla", name: "Twitch.tv", types:["tv"]}],
	"filter": { "query.twitch_id": { "$exists": true }, "query.type": { "$in":["tv"] } },
	"catalogs": [{
		"type": "Podcust",
		"id": "test",
		"extra": [{
			"name": "genre",
			"options": [ "Best", "Hot" ],
			"isRequired": false
		}]
	}],
	"resources": [
		"catalog",
		"stream",
		"meta"
	],
	"types": [
		"movie",
		"series",
		"channel",
		"tv"
	],
	"name": "StremioPodcust",
	"description": "Listen to amazing podcust of all types and all languages "
}
const builder = new addonBuilder(manifest)
var podcustAsMeta
builder.defineCatalogHandler(({
	type,
	id,
	extra
}) => {
	console.log("request for catalogs: " + type + " " + id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md

	//getPodcust(extra.search)
	if (p) {

		podcustAsMeta = [];
		p.forEach(element => {
			
			podcustAsMeta.push({
				id: element.id,
				type: "movie",
				name: element.title_original,
				poster: element.image
			})
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

builder.defineMetaHandler(({
	type,
	id
}) => {
	console.log("request for meta: " + type + " " + id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
	return Promise.resolve({
		meta: podcustAsMeta[0]
	})
})

builder.defineStreamHandler(({
	type,
	id
}) => {
	console.log("request for streams: " + type + " " + id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
		// serve one stream to big buck bunny
		const stream = {
			url: p[0].audio
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
var p;

function getPodcust(searchQ) {

	unirest.get('https://listen-api.listennotes.com/api/v2/search?q=star%20wars&sort_by_date=0&type=episode&offset=0&len_min=0&len_max=10&genre_ids=68%2C82&published_before=1490190241000&published_after=1390190241000&only_in=title%2Cdescription&language=English&ocid=&ncid=&safe_mode=1')
	  .header('X-ListenAPI-Key', 'c2dce2e827794253800bb8a33c41d649')
	  .end(function (response) {
		  p = response.body.results;
		console.log(response.body);
	});

}

getPodcust();

module.exports = builder.getInterface()
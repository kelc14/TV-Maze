'use strict';

const $showsList = $('#showsList');
const $episodesArea = $('#episodesArea');
const $searchForm = $('#searchForm');
const $episodesList = $('#episodesList');

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
	const results = await axios.get('http://api.tvmaze.com/search/shows', {
		params: { q },
	});
	console.log(results.data);
	let showsList = [];
	for (let i = 0; i < results.data.length; i++) {
		const id = results.data[i].show.id;
		const name = results.data[i].show.name;
		const summary = results.data[i].show.summary;
		let image = '';
		if (!results.data[i].show.image) {
			image =
				'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png';
		} else {
			image = results.data[i].show.image.original;
		}
		const newShow = { id, name, summary, image };
		showsList.push(newShow);
	}
	return showsList;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
	$showsList.empty();
	console.log(shows);
	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4" id="episode-${show.id}">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
		);

		$showsList.append($show);
	}
	//can i add an event listener on the button here?
	$('.Show-getEpisodes').on('click', async function (e) {
		e.preventDefault();
		const target = e.target;
		const targetParent = target.parentNode.parentNode.parentNode;
		const id = targetParent.dataset.showId;
		await getEpisodesOfShow(id);
	});
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
	const q = $('#searchForm-term').val();
	// console.log(term);
	const shows = await getShowsByTerm(q);

	$episodesArea.hide();
	populateShows(shows);
}

$searchForm.on('submit', async function (evt) {
	evt.preventDefault();

	await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 * access episode info: result.data.
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
	const results = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
	let episodes = [];
	for (let i = 0; i < results.data.length; i++) {
		const id = results.data[i].id;
		const name = results.data[i].name;
		const season = results.data[i].season;
		const number = results.data[i].number;

		const newShow = { id, name, season, number };
		episodes.push(newShow);
	}
	const episodeBody = document.querySelector(`#episode-${id}`);

	return populateEpisodes(episodes, episodeBody);
}

// add episodeList items to UL ($episodesList)

function populateEpisodes(episodes, episodeBody) {
	const episodeListUL = document.createElement('ul');
	for (let i = 0; i < episodes.length; i++) {
		const newLi = document.createElement('li');
		newLi.innerHTML = `<b>${episodes[i].name},</b> Season: ${episodes[i].season}, Episode: ${episodes[i].number}`;
		episodeListUL.append(newLi);
	}
	return episodeBody.append(episodeListUL);
}

// function populateEpisodes(episodes) {
// 	for (let i = 0; i < episodes.length; i++) {
// 		const newLi = document.createElement('li');
// 		newLi.innerHTML = `<b>${episodes[i].name},</b> Season: ${episodes[i].season}, Episode: ${episodes[i].number}`;
// 		$episodesList.append(newLi);
// 	}
// 	$episodesArea.css('display', '');
// }

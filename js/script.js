'use strict'

let offsetValue = 0;
let renderLimit = 24;
let amountRendered = 0;
let totalLimit = 900;
let indexesOfCurrentSelection = [];
let activeSearchFilter = false;
let mainJson;
let loading = false;

async function loadInitData() {
    await createPokemonJson(offsetValue, renderLimit);
    await fillIDArrayFromMainJson();
    await renderPreviewCards(renderLimit);
    initSearchOnEnterEvent();
    initLoadOnScroll();
};


function stopPropagation(event) {
    event.stopPropagation();
};


async function initSearchOnEnterEvent() {
    let searchInputElement = document.getElementById('search');
    searchInputElement.addEventListener('keyup', e => {
        if (e.key === 'Enter') { search() };
    });
};


function initLoadOnScroll() {
    window.addEventListener('scroll', async () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !loading) {
            loading = !loading
            await renderMorePreviewCards();
            loading = !loading
        }
    });
};


async function createPokemonJson(offsetValue, limitValue) {
    let url = `https://pokeapi.co/api/v2/pokemon?limit=${limitValue}&offset=${offsetValue}`;
    let response = await fetch(url);
    let responseAsJson = await response.json();

    mainJson = responseAsJson;
};


async function fillIDArrayFromMainJson() {
    indexesOfCurrentSelection = [];
    for (let i = 0; i < mainJson['results'].length; i++) {
        let currentPokemonUrl = mainJson['results'][i]['url'];
        let currentPokemonJson = await getPokemonAsJson(slicePokemonIDfromUrl(currentPokemonUrl));
        indexesOfCurrentSelection.push(currentPokemonJson['id']);
    };
};


function fillIDArrayWithMatches(searchInputElement) {
    for (let i = 0; i < mainJson['results'].length; i++) {
        if (mainJson['results'][i]['name'].includes(searchInputElement.value.trim().toLowerCase())) {
            let pokemonID = slicePokemonIDfromUrl(mainJson['results'][i]['url']);
            indexesOfCurrentSelection.push(pokemonID);
        };
    };
};


function slicePokemonIDfromUrl(url) {
    let urlOfPokemon = url.slice(0, -1); /* slicing the last "Slash" */;
    let pokemonID = urlOfPokemon.slice(34);

    return pokemonID;
};


async function getPokemonAsJson(pokemonID) {
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemonID}`
    let response = await fetch(url);
    let responseAsJson = await response.json();
    let pokemonAsJson = responseAsJson;
    return pokemonAsJson;
};


async function renderPreviewCards(limit) {
    amountRendered = 0;
    let previewCardsElement = document.getElementById('previewCards');
    let loopLimit = indexesOfCurrentSelection.length < limit ? indexesOfCurrentSelection.length : limit;

    previewCardsElement.innerHTML = '';
    for (let entry = 0; entry < loopLimit; entry++) {
        await renderPreviewCard(indexesOfCurrentSelection[entry]);
    };
};


async function renderPreviewCard(pokemonID) {
    let pokemonJson = await getPokemonAsJson(pokemonID);
    let pokemonArtworkPath = pokemonJson['sprites']['other']['official-artwork']['front_default'];
    let pokemonName = makeNameInitialUpperCase(pokemonJson['name']);

    generatePreviewCardHTML(pokemonArtworkPath, pokemonName, pokemonID, pokemonJson);
    amountRendered++;
};


function generatePreviewCardHTML(artworkPath, nameString, pokemonID, pokemonJson) {
    let lastTypeName = pokemonJson['types'][pokemonJson['types'].length - 1]['type']['name'];

    document.getElementById('previewCards').innerHTML += /*html*/`
    <div id="pokemon${pokemonID}" class="previewCard px-3 pt-3 text-light" style="background-color: rgba(${getTypeColor(lastTypeName)},0.7)"
            onclick="showCard(${pokemonID})">
     ${renderArtwork(artworkPath, pokemonID)} <img class="pokeball-bg" src="img/pokeball.png" alt="pokeball">${renderNameAndId(nameString, pokemonID)}    
    </div>
    <div class="previewTypes mt-2 fs-5 d-flex flex-column">
        ${renderTypes(pokemonJson)}
    </div>
    `
};


function renderNameAndId(pokemonName, pokemonID) {
    return /*html*/ `<div class="d-flex align-items-end justify-content-between"><h3>${pokemonName}</h3><h4 class="fs-5">${generateId(pokemonID)}</h4>
    `
};


function generateId(pokemonID) {
    return (pokemonID < 10 ? ('#00' + pokemonID) :
        pokemonID < 100 ? ('#0' + pokemonID) :
            ('#' + pokemonID));
};


function renderArtwork(artworkPath, pokemonID) {
    return /*html*/ `<div class="artworkWrapper"><img class="artwork" id="artwork${pokemonID}" src="${artworkPath}" alt="officialPokemonArtwork"></div>`
};


function renderTypes(pokemonJson) {
    let typesHtml = "";
    for (let i = 0; i < pokemonJson['types'].length; i++) {
        let pokemonType = pokemonJson['types'][i]['type']['name'];
        typesHtml += /*html*/ `<span class="type d-flex justify-content-center mt-2 text-center" style="background-color:rgb(${getTypeColor(pokemonType)}">${pokemonType}</span>`;
    };

    return typesHtml;
};


function makeNameInitialUpperCase(pokemonName) {
    return (pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1));

};


function getTypeColor(type) {
    for (let i = 0; i < typeColors.length; i++) {
        if (typeColors[i]['typeName'] == type) {
            return typeColors[i]['color'];
        }
    };
};


async function search() {
    let searchInputElement = document.getElementById('search');
    if (searchInputElement.value.trim().length == 0) {
        resetOffsetAndActiveSearchVariables();
        await createPokemonJson(offsetValue, renderLimit);
        await fillIDArrayFromMainJson();
    } else {
        activeSearchFilter = true;
        await createPokemonJson(0, 984);
        indexesOfCurrentSelection = [];
        fillIDArrayWithMatches(searchInputElement);
    };
    renderResultInfoTextElement(searchInputElement);
    await renderPreviewCards(renderLimit);

};


function resetOffsetAndActiveSearchVariables() {
    let renderResultInfoTextElement = document.getElementById('resultInfoText')
    renderResultInfoTextElement.innerHTML = "";
    offsetValue = 0;
    activeSearchFilter = false;

};


function renderResultInfoTextElement(searchInputElement) {
    let renderResultInfoTextElement = document.getElementById('resultInfoText');
    let indexesLength = indexesOfCurrentSelection.length
    if (activeSearchFilter) {
        if (indexesLength == 0) {
            renderResultInfoTextElement.innerHTML = /*html*/ `
        Sorry, no matches for "<div>${searchInputElement.value}</div>"`
        } else {
            renderResultInfoTextElement.innerHTML = /*html*/ `
            <div>We found ${indexesLength} ${setMatchFoundText(indexesLength)} for&nbsp</div><div>"${searchInputElement.value}"&nbsp:</div>`
        };
        searchInputElement.value = '';
    };
};


function setMatchFoundText(matchesAmount) {
    if(matchesAmount == 1) {
        return 'match';
    } else {
        return 'matches';
    };
};


async function renderMorePreviewCards() {
    offsetValue = amountRendered;
    let amountToRender = await setAmountToRender();

    for (let i = offsetValue; i < (offsetValue + amountToRender); i++) {
        await renderPreviewCard(indexesOfCurrentSelection[i])
    };
};


async function setAmountToRender() {
    let amountToRender;
    if (activeSearchFilter) {
        if (amountRendered < indexesOfCurrentSelection.length) {
            amountToRender = compareToRenderLimit(indexesOfCurrentSelection.length);
        };
    } else if (amountRendered < totalLimit) {
        offsetValue = 0;
        amountToRender = compareToRenderLimit(totalLimit);
        await createPokemonJson(amountRendered, amountToRender);
        await fillIDArrayFromMainJson();
    };
    return amountToRender;
};


function compareToRenderLimit(endValue) {
    let differenceValue = (endValue - amountRendered);

    if (differenceValue < renderLimit) {
        return (differenceValue);
    } else { return renderLimit };
};
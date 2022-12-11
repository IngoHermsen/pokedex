'use strict'

async function showCard(pokemonID) {
    let overlayElement = document.getElementById('overlay');
    let pokemonJson = await getPokemonAsJson(pokemonID);

    renderOverlay(pokemonJson, pokemonID, overlayElement);

    overlayElement.classList.remove('d-none');
    document.getElementsByTagName('body')[0].classList.add('overflowHidden');
};


function renderOverlay(pokemonJson, pokemonID, overlayElement) {
    let pokemonArtworkPath = pokemonJson['sprites']['other']['official-artwork']['front_default'];
    let pokemonName = makeNameInitialUpperCase(pokemonJson['name']);
    let lastTypeName = pokemonJson['types'][pokemonJson['types'].length - 1]['type']['name'];

    overlayElement.innerHTML = /*html*/ `
            <div id="card" class="card" onclick="stopPropagation(event)"> 
                    ${renderCardHead(pokemonArtworkPath, pokemonName, pokemonID, lastTypeName)}
                    ${renderCardBody(pokemonID)}
              
            </div>
    `
};


function renderCardHead(artworkPath, pokemonName, pokemonID, lastTypeName) {
    return /*html*/ `
    <div id=cardHead class="d-flex flex-column ps-3 pt-3 text-light" style="background-color: rgba(${getTypeColor(lastTypeName)})">
        <i class="closeButton fs-2 fa-regular fa-circle-xmark" onclick="closeOverlay()"></i>
        <img src="${artworkPath}" alt="officialArtwork">
        <div class="d-flex align-items-center justify-content-between me-5">
        <h2 class="fs-1 card-title">${pokemonName}</h2>
        <h3 class="fs-3">${generateId(pokemonID)}</h3></div>
    </div>
    `
};


function renderCardBody(pokemonID) {
    return /*html*/ `
    <div class="card-body">
        <nav class="mb-4 d-flex justify-content-between">
            <a tabindex="0" id="about" class="text-left stats mx-3" onclick="renderAboutStats(${pokemonID})">About</a>
            <a tabindex="1" id="baseStats" class="stats mx-3" onclick="renderBaseStats(${pokemonID})">Base Stats</a>
            <a tabindex="2" id="moves" class="stats mx-3" onclick="renderMovesStats(${pokemonID})">Moves</a>
        </nav>
        <div id="cardStatContent" class="d-flex flex-column-reverse align-items-start">
            ${renderAboutStats(pokemonID)}
        </div>
    </div>
    `
};


function closeOverlay() {
    document.getElementById('overlay').classList.add('d-none');
    document.getElementsByTagName('body')[0].classList.remove('overflowHidden');
};



async function renderAboutStats(pokemonID) {
    let pokemonJson = await getPokemonAsJson(pokemonID);
    let cardStatContentElement = document.getElementById('cardStatContent');
    cardStatContentElement.innerHTML = /*html*/ `
    <table id="aboutTable">
        <tr><td >Types:</td>
            <td id="typesList">${generateTypesHtml(pokemonJson)}</td></tr>
        <tr><td>Abilities:</td>
            <td id="abilitiesList">${generateAbilitiesHtml(pokemonJson)}</td></tr>
        <tr><td>Height:</td>
            <td id="height">${(pokemonJson['height'] / 10).toFixed(2)} m</td></tr>
        <tr><td>Weight:</td>
            <td id="weight">${(pokemonJson['weight'] / 10).toFixed(2)} kg</td></tr>
    </table> `;
    focusAboutStats();
};


function focusAboutStats() {
    let aboutTextElement = document.getElementById('about');
    aboutTextElement.focus();
};


function generateTypesHtml(pokemonJson) {
    let typesHtml = "";
    for (let i = 0; i < pokemonJson['types'].length; i++) {
        typesHtml += `<span class="properties py-1 px-2">${pokemonJson['types'][i]['type']['name']}</span>`;
    }
    return typesHtml;

};


function generateAbilitiesHtml(pokemonJson) {
    let abilitiesHtml = "";
    for (let i = 0; i < pokemonJson['abilities'].length; i++) {
        abilitiesHtml += `<span class="properties py-1 px-2">${pokemonJson['abilities'][i]['ability']['name']}</span>`;
    }
    return abilitiesHtml;

};


async function renderBaseStats(pokemonID) {
    let pokemonJson = await getPokemonAsJson(pokemonID);
    let cardStatContentElement = document.getElementById('cardStatContent');
    cardStatContentElement.innerHTML = /*html*/ `
    <table id="aboutTable">
        ${renderBaseStatRow('Health: ', pokemonJson, 0, 'success')}
        ${renderBaseStatRow('Attack: ', pokemonJson, 1, 'warning')}
        ${renderBaseStatRow('Defense: ', pokemonJson, 2, 'danger')}
        ${renderBaseStatRow('Special-Attack: ', pokemonJson, 3, 'primary')}
        ${renderBaseStatRow('Special-Defense: ', pokemonJson, 4, 'info')}
        ${renderBaseStatRow('Speed: ', pokemonJson, 5, 'secondary')}
    </table>
    `;
};


function renderBaseStatRow(statName, pokemonJson, propertyID, bgColor) {
    return /*html*/ `<tr><td >${statName}</td>
    <td id="health">${renderProgressBar(pokemonJson, propertyID, bgColor)}</td></tr>
    `
};


function renderProgressBar(pokemonJson, propertyID, color) {
    let maxPropertyValue = 255
    let propertyValue = pokemonJson['stats'][propertyID]['base_stat']
    let propertyProgressValue = ((100 / maxPropertyValue) * propertyValue)

    let progressBarHtml = /*html*/ `
    <div class="progress" style="height: 15px">
        <div class="progress-bar-striped bg-${color} fw-bold text-light ps-2 pb-4" role="progressbar" aria-label="Example 1px high" style="width: ${propertyProgressValue}%;" aria-valuenow="40" aria-valuemin="0" aria-valuemax="255">${propertyValue}</div>
    </div>
    `;

    return progressBarHtml;
};


async function renderMovesStats(pokemonID) {
    let pokemonJson = await getPokemonAsJson(pokemonID);
    let cardStatContentElement = document.getElementById('cardStatContent');

    cardStatContentElement.innerHTML = /*html*/ `
    <div class="movesWrapper">
        ${generateMovesHtml(pokemonJson)}
    </div>
    `
};


function generateMovesHtml(pokemonJson) {
    let movesHtml = "";
    for (let i = 0; i < pokemonJson['moves'].length; i++) {
        movesHtml += `<div class="properties px-2 py-1 d-inline-block">${pokemonJson['moves'][i]['move']['name']}</div>`
    };
    return movesHtml

};
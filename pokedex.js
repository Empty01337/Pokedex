async function storeAllPokemons(limit, offset) {
  const pokemonsResult = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const pokemons = await pokemonsResult.json();
  const enhancedPokemons = [];
  await Promise.all(
    pokemons.results.map(async (p) => {
      const pokemonResult = await fetch(p.url);
      enhancedPokemons.push(await pokemonResult.json());
    })
  );
  window.pokemons = enhancedPokemons.sort((a, b) => {
    return a.id - b.id;
  });
  displayPokemons(enhancedPokemons);
}

async function displayPokemons(pokemons) {
  const display = document.getElementById("display");
  display.innerHTML = "";
  if (!pokemons || pokemons.length == 0) {
    display.innerHTML += "<h3>No results.</h3>";
  } else {
    pokemons.map(async (p) => {
      const types = getPokemonTypes(p.types);
      const pokemonDisplay = `<div class="d-flex flex-column justify-content-between pokemon-card rounded-4 border m-1 p-2 card" onclick="displayPokemon(${p.id})">
                                <div>
                                  ${types}
                                </div>
                                <img src="${`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}"/>
                                <div class="d-flex flex-column">
                                  <span class="text-black-50">#${p.id.toString().padStart(4, "0")}</span>
                                  <span class="fw-medium">${p.name}</span>
                                </div>
                              </div>`;
      display.innerHTML += pokemonDisplay;
    });
  }
}

function getPokemonTypes(types) {
  let element = "";
  types.map((type) => {
    element += `<span class="${type.type.name} type rounded-2 px-2 mx-1" onclick="searchType('${type.type.name}', event)">${type.type.name}</span>`;
  });
  return element;
}

function getPokemonFromWindow(id) {
  const pokemon = window.pokemons.find(p => p.id == id);
  return pokemon;
}

function playPokemonSound(pokemon) {
  if (pokemon.cries?.legacy) {
    const audio = new Audio(pokemon.cries.legacy);
    audio.volume = 0.05;
    audio.play();
  }
}

function getStatName(statId) {
  switch (statId) {
    case "hp":
      return "HP";
    case "attack":
      return "Attack";
    case "defense":
      return "Defense";
    case "special-attack":
      return "Special attack";
    case "special-defense":
      return "Special defense";
    case "speed":
      return "Speed";
    default:
      return "";
  }
}

function getStats(pokemon) {
  let stats = "";
  pokemon.stats.map((s) => {
    stats += `<div class="row">
                <label class="col">${getStatName(s.stat.name)}</label>
                <progress class="col my-auto" max=255 value="${s.base_stat}"/>
              </div>`;
  })
  return stats;
}

function closePokecard() {
  const display = document.getElementById("pokemon-data");
  display.innerHTML = `<span class="text-center">Select a Pokemon !</span>`;
}

async function displayPokemon(id) {
  const pokemon = getPokemonFromWindow(id);
  playPokemonSound(pokemon);
  const display = document.getElementById("pokemon-data");
  const types = getPokemonTypes(pokemon.types);
  const imgUrl = window.pokemonGeneration <= 5 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  const shinyImgUrl = window.pokemonGeneration <= 5 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemon.id}.gif` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
  display.innerHTML = `<button class="ms-auto btn btn-danger btn-sm" onclick="closePokecard()">X</button>
                      <div class="d-flex">
                        <div class="d-flex flex-column">
                          <div class="position-relative pokepic-container">
                            <img class="pokepic not-shiny" src="${imgUrl}"/>
                            <img class="pokepic shiny" src="${shinyImgUrl}"/>
                          </div>
                          <div class="d-flex flex-column">
                            <span class="text-black-50">
                              #${pokemon.id.toString().padStart(4, "0")}
                            </span>
                            <span class="fw-medium">
                              ${pokemon.name}
                            </span>
                          </div>
                          <div>
                            ${types}
                          </div>
                        </div>
                        <div class="container">
                          <div class="row">
                              <div class="col">
                                <label>Weight:</label>
                                <span class="fw-medium">${new Intl.NumberFormat('en', { style:'unit', unit:'kilogram' }).format(pokemon.weight / 10)}</span>
                              </div>
                              <div class="col">
                                <label>Height:</label>
                                <span class="fw-medium">${new Intl.NumberFormat('en', { style:'unit', unit:'meter' }).format(pokemon.height / 10)}</span>
                              </div>
                            </div>
                            <div class="row mb-3">
                              <div class="col">
                                <label>Species:</label>
                                <span class="fw-medium species">${pokemon.species.name}</span>
                              </div>
                            </div>
                            ${getStats(pokemon)}
                          </div>
                        </div>
                      </div>`;
}

async function search(searchValue) {
  const filteredPokemons = window.pokemons.filter((p) =>
    p.name.includes(searchValue.toLowerCase()) || p.types.find(t => t.type.name.includes(searchValue.toLowerCase())) || p.id.toString().padStart(4, "0").includes(searchValue.toLowerCase())
  );
  displayPokemons(filteredPokemons);
}

function searchType(search, event) {
  event.stopPropagation();
  const searchInput = document.getElementById("search-input");
  searchInput.value = search;
  this.search(search);
}

async function changePokemonGeneration(generation) {
  window.pokemonGeneration = generation;
  const searchInput = document.getElementById("search-input");
  switch (generation) {
    case 1:
      await storeAllPokemons(151, 0);
      break;
    case 2:
      await storeAllPokemons(100, 151);
      break;
    case 3:
      await storeAllPokemons(135, 251);
      break;
    case 4:
      await storeAllPokemons(107, 386);
      break;
    case 5:
      await storeAllPokemons(156, 493);
      break;
    case 6:
      await storeAllPokemons(72, 649);
      break;
    case 7:
      await storeAllPokemons(88, 721);
      break;
    case 8:
      await storeAllPokemons(96, 809);
      break;
    case 9:
      await storeAllPokemons(120, 905);
      break;
    default:
      break;
  }
  this.search(searchInput?.value ?? "");
}

changePokemonGeneration(1);
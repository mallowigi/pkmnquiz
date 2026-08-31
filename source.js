// oxlint-disable no-unused-expressions
// noinspection CommaExpressionJS,JSUnfilteredForInLoop

class Pokemon {
  constructor(data) {
    this.data = data;
    this.id = data.id;
    this.baseName = data.baseName;
    this.primaryType = data.primaryType;
    this.secondaryType = data.secondaryType;
    this.legendary = data.legendary;
    this.box = data.box;
    this.currentBox = this.box;
  }

  setExtraData(extra) {
    this.extraData = extra;
  }

  isType(type) {
    return this.primaryType === type || this.secondaryType === type;
  }

  isLegendary() {
    return this.legendary !== 'no';
  }

  setFormattedNames(dict) {
    this.formattedDict = dict;
  }

  getFormattedName(name) {
    return this.formattedDict[name];
  }
}

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x); // Returns a float between 0 and 1
}

class Quiz {
  pokemon = [];
  pokemonBaseNameDict = {};
  pokemonIdDict = {};
  silhouetteDictionary = {};
  spriteDictionary = {};
  pokeballDictionary = {};
  unguessedDictionary = {};
  unguessedDict = {};
  unguessedDictTexts = {};
  enabledLanguages = [];
  nameDict = {};
  nameArr = [];
  langDict = {};
  currentBaseNames = new Set();
  currentIds = new Set();
  currentLangsNames = new Set();
  revealTimeouts = [];
  allSprites = [];
  silhouetteArray = [];
  pokeballArray = [];
  missingnoEnabled = false;
  shinyEnabled = false;
  named = new Set();
  users = {};
  langCounts = {};
  currentLang = 'ENG';
  spriteCycles = {};
  cyclingEnabled = true;
  filters = {};
  paused = false;
  orderModeSet = new Set();
  baseNameIdDict = {};
  orderMode = false;
  chaosMode = false;
  typeDisorder = false;
  revealedShadows = new Set();
  giveUpState = false;
  spooky = false;
  name = 'none';
  currentType = null;
  seed = 0;
  typeChaosIds = new Set();
  boxConstruction = [];

  constructor(boxDict, genQuizBoxes, allLanguages) {
    this.boxDict = boxDict;
    this.genQuizBoxes = genQuizBoxes;
    this.allLanguages = allLanguages;
    this.useSilhouettes = false;
    this.startSpooky();
    this.seed = Math.floor(1000 * Math.random());
  }

  loadData(json, languages, onReset) {
    this.encodedImages = json.encoded_images;
    this.translations = json.translations;
    this.suffixes = json.suffix_namings;
    this.namings = json.namings;

    const pokemon = json.pokemon;

    for (let i = 0; i < pokemon.length; i++) {
      const poke = new Pokemon(pokemon[i]);

      if (poke.box !== 'unreleased') {
        this.pokemon.push(poke);
        this.pokemonIdDict[poke.id] = poke;

        if (!(poke.baseName in this.pokemonBaseNameDict)) {
          this.pokemonBaseNameDict[poke.baseName] = [];
          this.orderModeSet.add(poke.id);
          this.baseNameIdDict[poke.baseName] = poke.id;
        }

        this.pokemonBaseNameDict[poke.baseName].push(poke);
      }
    }

    this.setupNames();
    this.setFormattedNames();
    this.setupSprites();
    this.setupMissedContent();
    this.updateLanguages(languages);
    this.onReset = onReset;
    this.usePokeball();
  }

  reset() {
    this.giveUpState = false;
    this.stopReveal();
    this.named = new Set();
    this.users = {};
    this.langCounts = {};
    this.missingnoEnabled = false;
    this.useSilhouettes = false;
    this.revealedShadows = new Set();
    this.boxCounters = {};

    for (let box in this.currentBoxes) {
      this.boxCounters[box] = [];
    }

    this.usePokeball();

    for (let sprite in this.spriteDictionary) {
      this.hideSprite(sprite);
      this.spriteDictionary[sprite].classList.add('zoom');
      this.spriteDictionary[sprite].classList.remove('revealed');
    }

    for (let unguessed in this.unguessedDict) {
      this.unguessedDict[unguessed].style.display = 'none';
    }

    for (let box in this.boxDict) {
      this.boxDict[box].classList.remove('outline');
      this.boxDict[box].classList.remove(`outline${this.getStyleName()}`);
    }

    document.getElementById('big').classList.remove('outline');
    document.getElementById('big').classList.remove(`outline${this.getStyleName()}`);

    for (let unguessed in this.unguessedDictionary) {
      this.currentIds.has(unguessed)
        ? (this.unguessedDictionary[unguessed].style.display = 'inline')
        : (this.unguessedDictionary[unguessed].style.display = 'none');
    }

    if (this.shinyEnabled) {
      this.spriteDictionary.ditto.src = this.encodedImages.shiny.ditto;
      this.unguessedDict.ditto.getElementsByTagName('img')[0].src = this.encodedImages.shiny.ditto;
    } else {
      this.spriteDictionary.ditto.src = this.encodedImages.sprite.ditto;
      this.unguessedDict.ditto.getElementsByTagName('img')[0].src = this.encodedImages.sprite.ditto;
    }

    this.onReset();
  }

  setOrderMode(enabled) {
    this.orderMode = enabled;
    this.chaosMode = false;

    if (enabled) {
      this.typeDisorder = false;
    }

    this.setQuiz(this.name, this.filters);
  }

  setChaosMode(enabled) {
    this.chaosMode = enabled;
    this.orderMode = false;
    this.setQuiz(this.name, this.filters);
  }

  setTypeMode(enabled) {
    this.typeDisorder = enabled;

    if (enabled) {
      this.changeTypeStyle(this.currentType);
      this.currentType = this.getCurrentRandomType();
      this.changeTypeStyle(this.currentType);
    } else {
      this.changeTypeStyle(null);
      this.currentType = null;
    }
  }

  checkHighestLang() {
    let highestLang = 'ENG';
    let max = 0;

    for (let lang in this.langCounts) {
      if (this.langCounts[lang] > max) {
        max = this.langCounts[lang];
        highestLang = lang;
      }
    }

    if (this.currentLang !== highestLang) {
      document.getElementById(`missing-${highestLang}`).click();
      this.currentLang = highestLang;
    }
  }

  getScore() {
    return this.named.size;
  }

  getMaxScore() {
    return this.currentBaseNames.size;
  }

  setGenQuiz(gen) {
    let title = gen === 0 ? 'Full' : `Generation ${gen}`;

    this.setQuiz(title, {
      boxes: this.genQuizBoxes[gen.toString()],
    });
  }

  setTypeQuiz(type) {
    const title = `${type}\x20type\x20`;

    this.setQuiz(title, {
      types: [type],
    });
  }

  setQuiz(title, data) {
    this.emptyBoxes();
    // Set classes for the types
    if (this.getStyleName() !== '') {
      document.getElementById('body').classList.remove(this.getStyleName());

      for (let i = 0; i < typeClasses.length; i++) {
        const typeClass = typeClasses[i];
        const styleName = this.getStyleName();
        const elements = document.getElementsByClassName(typeClass.replace('type', ''));

        for (let j = 0; j < elements.length; j++) {
          elements[j].classList.remove(typeClass.replace('type', styleName));
        }

        let buttons = document.getElementsByClassName('button');
        for (let k = 0; k < buttons.length; k++) {
          buttons[k].classList.remove(`button${this.getStyleName()}`);
        }
      }
    }

    this.filters = data;
    this.currentType = null;
    this.name = title;

    let filteredPokemon;
    this.typeChaosIds = new Set();

    // Filter by boxes
    if ('boxes' in data) {
      filteredPokemon = this.pokemon.filter((p) => data.boxes.includes(p.box));
    } else {
      filteredPokemon = [...this.pokemon];
    }

    // Filter by typws
    if ('types' in data) {
      filteredPokemon = filteredPokemon.filter((p) => data.types.some((type) => p.isType(type)));

      // Reset order mode
      if (this.orderMode) {
        const orderOff = document.getElementById('order-off');
        const orderOn = document.getElementById('order-on');
        visualizeButtonClick(orderOff);
        visualizeButtonUnclick(orderOn);
        this.orderMode = false;
        showUserMessage('Order mode disabled');
      }
    }

    // Filter by legendary status
    if ('legendary' in data) {
      filteredPokemon = filteredPokemon.filter((p) => p.isLegendary());

      // Reset order mode
      if (this.orderMode) {
        const orderOff = document.getElementById('order-off');
        const orderOn = document.getElementById('order-on');
        visualizeButtonClick(orderOff);
        visualizeButtonUnclick(orderOn);
        this.orderMode = false;
        showUserMessage('Order mode disabled');
      }
    }

    // Add type chaos ids
    for (let i = 0; i < filteredPokemon.length; i++) {
      this.typeChaosIds.add(filteredPokemon[i].id);
    }

    // Regroup all pokemon of the same sprite cycle
    let spriteCycles = {},
      indices = [],
      i = 0;
    while (i < filteredPokemon.length - 1) {
      if (filteredPokemon[i].baseName === filteredPokemon[i + 1].baseName) {
        spriteCycles[filteredPokemon[i].id] = [filteredPokemon[i].id];
        let j = 1;

        while (i + j < filteredPokemon.length && filteredPokemon[i].baseName === filteredPokemon[i + j].baseName) {
          indices.push(i + j);
          spriteCycles[filteredPokemon[i].id].push(filteredPokemon[i + j].id);
          j++;
        }
        j--;
        i += j;
      }
      i++;
    }

    for (let i = indices.length - 1; i >= 0; i--) {
      filteredPokemon.splice(indices[i], 1);
    }

    // Populate order mode and sprite cycles
    if (this.orderMode || 'legendary' in this.filters || this.chaosMode) {
      let filtered = [],
        ids = filteredPokemon.map((pok) => pok.id);

      for (let i = 0; i < filteredPokemon.length; i++) {
        if (this.orderMode) {
          // Filter out gmax and megas
          if (filteredPokemon[i].box === 'gmax' || filteredPokemon[i].box === 'mega') {
            continue;
          }

          let pokemonId = filteredPokemon[i].id;

          if (this.orderModeSet.has(pokemonId)) {
            filtered.push(filteredPokemon[i]);
          } else {
            let baseNameId = this.baseNameIdDict[filteredPokemon[i].baseName];
            if (baseNameId in spriteCycles || pokemonId in spriteCycles) {
              for (let j = 0; j < spriteCycles[pokemonId].length; j++) {
                spriteCycles[baseNameId].push(spriteCycles[pokemonId][j]);
              }
            } else {
              spriteCycles[baseNameId].push(pokemonId);
            }
          }
        } else {
          let pokemonId = filteredPokemon[i].id,
            baseNameId = this.baseNameIdDict[filteredPokemon[i].baseName];

          if (this.orderModeSet.has(pokemonId) || !ids.includes(baseNameId)) {
            filtered.push(filteredPokemon[i]);
          } else {
            if (baseNameId in spriteCycles || pokemonId in spriteCycles) {
              for (let j = 0; j < spriteCycles[pokemonId].length; j++) {
                spriteCycles[baseNameId].push(spriteCycles[pokemonId][j]);
              }
            } else {
              spriteCycles[baseNameId].push(pokemonId);
            }
          }
        }

        filteredPokemon = filtered;
        if ('darumaka' in spriteCycles) {
          spriteCycles.darumaka = ['darumaka', 'darumaka', 'darumakagalar', 'darumakagalar'];
        }
        if (
          'meowth' in spriteCycles &&
          spriteCycles.meowth.includes('meowthalola') &&
          spriteCycles.meowth.includes('meowthgalar')
        ) {
          spriteCycles.meowth = ['meowth', 'meowthalola', 'meowthgalar'];
        }
        if ('persian' in spriteCycles && spriteCycles.persian.includes('persianalola')) {
          spriteCycles.persian = ['persian', 'persianalola', 'persiangalar'];
        }
      }
    }

    this.spriteCycles = spriteCycles;
    this.currentBaseNames = new Set();
    this.currentIds = new Set();
    this.currentBoxes = {};
    this.currentPokemonList = filteredPokemon;

    if (this.typeDisorder) {
      this.currentType = this.getCurrentRandomType();
    } else {
      this.currentType = null;
    }

    if (this.chaosMode || this.orderMode) {
      // Put all in a big box
      for (let i = 0; i < filteredPokemon.length; i++) {
        filteredPokemon[i].currentBox = 'big';
      }
    } else {
      if ('legendary' in data) {
        // Set legendary boxes
        for (let i = 0; i < filteredPokemon.length; i++) {
          filteredPokemon[i].currentBox = filteredPokemon[i].legendary;
        }
      } else {
        // Set boxes
        for (let i = 0; i < filteredPokemon.length; i++) {
          filteredPokemon[i].currentBox = filteredPokemon[i].box;
        }
      }
    }

    // Add basenames, ids and boxes
    for (let i = 0; i < filteredPokemon.length; i++) {
      this.currentBaseNames.add(filteredPokemon[i].baseName);
      this.currentIds.add(filteredPokemon[i].id);

      if (!(filteredPokemon[i].currentBox in this.currentBoxes)) {
        this.currentBoxes[filteredPokemon[i].currentBox] = [];
      }

      this.currentBoxes[filteredPokemon[i].currentBox].push(filteredPokemon[i]);
    }

    // Map dark to evil to avoid conflicting with dark mode
    if ('types' in this.filters) {
      if (this.filters.types[0] === 'dark') {
        this.currentType = 'evil';
      } else {
        this.currentType = this.filters.types[0];
      }
    }

    // Show unguessed
    for (let unguessed in this.unguessedDictionary) {
      if (unguessed in this.currentIds) {
        this.unguessedDictionary[unguessed].style.display = 'inline';
      } else {
        this.unguessedDictionary[unguessed].style.display = 'none';
      }
    }

    // Show boxes
    for (let box in this.boxDict)
      if (box in this.currentBoxes) {
        this.boxDict[box].style.display = 'block';
      } else {
        this.boxDict[box].style.display = 'none';
      }

    for (let currentBox in this.currentBoxes) {
      if (this.name === 'Full') {
        regionToAll(document.getElementById(`region${currentBox}`));
      } else {
        regionToSingle(document.getElementById(`region${currentBox}`));
      }
    }

    this.updateLanguages(this.enabledLanguages);

    // Layout in columns
    if (this.name === 'Full') {
      // Full game
      for (let box in this.currentBoxes) {
        regionToAll(document.getElementById(`region${box}`));
      }

      // Remove unknown box
      document.getElementById('unknown').classList.remove('unknownbox');

      // Create sprites
      for (let i = 0; i < this.allSprites.length; i++) {
        this.allSprites[i].classList.add('sprite');
        this.allSprites[i].classList.remove('spritew');
        this.allSprites[i].classList.remove('spritet');
      }

      // Layout in cols
      for (let i = 0; i < pokecolumns.length; i++) {
        pokecolumns[i].classList.add('fifth');
        pokecolumns[i].classList.remove('twothirds');
      }
    } else {
      // Generation game
      if (this.name.includes('eneration')) {
        for (let box in this.currentBoxes) {
          regionToSingle(document.getElementById(`region${box}`));
        }

        document.getElementById('unknown').classList.add('unknownbox');

        for (let i = 0; i < this.allSprites.length; i++) {
          this.allSprites[i].classList.add('spritew');
          this.allSprites[i].classList.remove('sprite');
          this.allSprites[i].classList.remove('spritet');
        }

        for (let i = 0; i < pokecolumns.length; i++) {
          pokecolumns[i].classList.remove('fifth');
          pokecolumns[i].classList.add('twothirds');
        }
      } else {
        // Type game
        document.getElementById('unknown').classList.remove('unknownbox');

        for (let box in this.currentBoxes) {
          regionToSingle(document.getElementById(`region${box}`));
        }

        for (let i = 0; i < pokecolumns.length; i++) {
          pokecolumns[i].classList.add('fifth');
          pokecolumns[i].classList.remove('twothirds');
        }

        for (let i = 0; i < this.allSprites.length; i++) {
          this.allSprites[i].classList.add('spritet');
          this.allSprites[i].classList.remove('spritew');
          this.allSprites[i].classList.remove('sprite');
        }
      }
    }

    // Typed, legendary or shuffle type mode skin
    if ('types' in data || 'legendary' in data || this.typeDisorder) {
      document.getElementById('body').classList.add(this.getStyleName());

      if (darkMode) {
        document.getElementById('body').classList.add('blenddark');
      } else {
        document.getElementById('body').classList.add('blend');
      }

      // Add type class to all elements that should be affected by the type style
      for (let i = 0; i < typeClasses.length; i++) {
        let typeClass = typeClasses[i];
        if (typeClass.includes('dark') && !darkMode) {
          continue;
        }

        let typeElements = document.getElementsByClassName(typeClass.replace('type', ''));
        for (let j = 0; j < typeElements.length; j++) {
          typeElements[j].classList.add(typeClass.replace('type', this.getStyleName()));
        }
      }

      // Add buttons with the type
      let buttons = document.getElementsByClassName('button');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.add(`button${this.getStyleName()}`);
      }

      // Background type
      let typeUpper = this.getStyleName().toUpperCase();
      if (typeUpper === 'EVIL') {
        typeUpper = 'DARK';
      }
      document.getElementById('bgpattern').style.display = 'block';
      document.getElementById('bgpattern2').style.display = 'block';
      document.getElementById('bgpattern2').src = `/images/types/${typeUpper}.svg`;
      document.getElementById('bgpattern2').src = `/images/types/${typeUpper}.svg`;
      document.getElementById('bgpattern').style.opacity = 0;

      setTimeout(() => {
        document.getElementById('bgpattern').src = `/images/types/${typeUpper}.svg`;
        document.getElementById('bgpattern').style.opacity = 1;
      }, 250);
    } else {
      document.getElementById('body').classList.remove('blend');
      document.getElementById('body').classList.remove('blenddark');
      document.getElementById('bgpattern').style.display = 'none';
      document.getElementById('bgpattern2').style.display = 'none';
    }

    this.moveBoxes();
    this.resetCurrentSprites();
    this.reset();
  }

  changeTypeStyle(type) {
    const consts = {
      bgpattern: 'bgpattern',
      bgpattern2: 'bgpattern2',
      blend: 'blend',
      blenddark: 'blenddark',
      body: 'body',
      button: 'button',
      dark: 'DARK',
      darks: 'dark',
      evil: 'EVIL',
      imagesTypes: '/images/types/',
      svg: '.svg',
      type: 'type',
    };

    if (type !== null) {
      type = type.toLowerCase();
      if (type === 'dark') {
        type = 'evil';
      }
    }

    // Remove type classes
    if (this.getStyleName() !== '') {
      document.getElementById('body').classList.remove(this.getStyleName());

      for (let i = 0; i < typeClasses.length; i++) {
        let typeClass = typeClasses[i],
          styleName = this.getStyleName(),
          typeElements = document.getElementsByClassName(typeClass.replace('type', ''));

        typeClass.replace('type', '');

        for (let elem = 0; elem < typeElements.length; elem++) {
          typeElements[elem].classList.remove(typeClass.replace('type', styleName));
        }
      }

      let buttons = document.getElementsByClassName('button');

      for (let elem = 0; elem < buttons.length; elem++) {
        buttons[elem].classList.remove(`button${this.getStyleName()}`);
      }
    }

    if (type !== null) {
      document.getElementById('body').classList.add(type);

      if (darkMode) {
        document.getElementById('body').classList.add(consts.blenddark);
      } else {
        document.getElementById('body').classList.add(consts.blend);
      }

      // add type classes
      for (let i = 0; i < typeClasses.length; i++) {
        let typeClass = typeClasses[i];
        if (typeClass.includes('dark') && !darkMode) {
          continue;
        }

        let elements = document.getElementsByClassName(typeClass.replace('type', ''));
        for (let j = 0; j < elements.length; j++) {
          elements[j].classList.add(typeClass.replace('type', type));
        }
      }

      let buttons = document.getElementsByClassName('button');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.add(`button${type}`);
      }

      let typeUpper = type.toUpperCase();
      if (typeUpper === 'EVIL') {
        typeUpper = 'DARK';
      }

      // Backgrounds
      document.getElementById(consts.bgpattern).style.display = 'block';
      document.getElementById('bgpattern2').style.display = 'block';

      document.getElementById(consts.bgpattern2).src = `/images/types/${typeUpper}${consts.svg}`;
      document.getElementById('bgpattern2').src = `/images/types/${typeUpper}${consts.svg}`;

      document.getElementById(consts.bgpattern).style.opacity = 0;

      setTimeout(() => {
        document.getElementById('bgpattern').src = `/images/types/${typeUpper}${consts.svg}`;
        document.getElementById('bgpattern').style.opacity = 1;
      }, 250);

      if (type.toLowerCase() === 'evil') {
        type = 'dark';
      }
    } else {
      document.getElementById('body').classList.remove(consts.blend);
      document.getElementById('body').classList.remove('blenddark');
      document.getElementById('bgpattern').style.display = 'none';
      document.getElementById('bgpattern2').style.display = 'none';
    }

    this.currentType = type;
  }

  emptyBoxes() {
    for (let i = 0; i < this.boxConstruction.length; i++) {
      let spriteDictionary = this.boxConstruction[i][1],
        pokemon = this.boxConstruction[i][2];

      for (let i = 0; i < spriteDictionary.length; i++) {
        this.boxDict[pokemon.currentBox].removeChild(spriteDictionary[i]);
      }
    }
  }

  moveBoxes() {
    for (let i = 0; i < this.boxConstruction.length; i++) {
      let spriteDictionary = this.boxConstruction[i][1],
        pokemon = this.boxConstruction[i][2];

      for (let i = 0; i < spriteDictionary.length; i++) {
        this.boxDict[pokemon.currentBox].appendChild(spriteDictionary[i]);
      }
    }
    document.getElementById('regionbig').innerText = '';
  }

  getStyleName() {
    if (this.currentType !== null) {
      if (this.currentType === 'dark') {
        return 'evil';
      }
      return this.currentType;
    }

    if ('types' in this.filters) {
      if (this.filters.types[0] === 'dark') {
        return 'evil';
      }
      return this.filters.types[0];
    }

    if ('legendary' in this.filters) {
      return 'special';
    }

    return '';
  }

  setFormattedNames() {
    for (let pokemonId in this.pokemonIdDict) {
      let pokemon = this.pokemonIdDict[pokemonId],
        translations = this.translations[pokemon.baseName],
        result = null;

      if (pokemon.id in this.namings) {
        result = {};
        for (let translation in translations) {
          result[translation] = translations[translation] + this.namings[pokemon.id];
        }
      } else {
        for (let suffix in this.suffixes) {
          if (pokemon.id.endsWith(suffix)) {
            if (pokemon.id.substring(0, pokemon.id.length - suffix.length) in this.pokemonBaseNameDict) {
              result = {};
              for (let translation in translations) {
                result[translation] = translations[translation] + this.suffixes[suffix];
              }
              break;
            }
          }
        }
      }

      if (result === null) {
        result = {};
        for (let translation in translations) result[translation] = translations[translation];
      }

      if (pokemon.baseName === 'nidoranm' || pokemon.baseName === 'nidoranf') {
        for (let translation in result) {
          if (result[translation].endsWith('m') || result[translation].endsWith('f')) {
            result[translation] = result[translation].substring(0, result[translation].length - 1);
          }
        }
      }

      pokemon.setFormattedNames(result);
    }
  }

  setLanguage(lang) {
    for (let text in this.unguessedDictTexts) {
      this.unguessedDictTexts[text].nodeValue = this.pokemonIdDict[text].getFormattedName(lang);
    }
    this.currentLang = lang;
  }

  updateLanguages(languages) {
    this.enabledLanguages = languages;
    this.currentLangsNames = new Set();
    this.nameDict = {};
    this.nameArr = [];

    // add lookup by translated name
    for (let id of this.currentIds) {
      for (let i = 0; i < languages.length; i++) {
        let lang = languages[i];
        this.currentLangsNames.add(standardizeName(this.translations[this.pokemonIdDict[id].baseName][lang]));
      }
    }

    for (let i = 0; i < this.pokemon.length; i++) {
      for (let l = 0; l < this.enabledLanguages.length; l++) {
        let lang = this.enabledLanguages[l],
          name = standardizeName(this.translations[this.pokemon[i].baseName][lang]);
        this.nameDict[name] = this.pokemon[i].id;
        this.nameArr.push(name);
      }
    }
  }

  setupNames() {
    for (let i = 0; i < this.pokemon.length; i++) {
      for (let l = 0; l < this.allLanguages.length; l++) {
        let lang = this.allLanguages[l];
        let translation = this.translations[this.pokemon[i].baseName];

        if (standardizeName(translation['ENG']) === standardizeName(translation[lang])) {
          this.langDict[standardizeName(translation[lang])] = 'ENG';
        } else {
          this.langDict[standardizeName(translation[lang])] = lang;
        }
      }
    }
  }

  startMissingno() {
    const ops = {
      unknown2: '/sprites/unknown-2.png',
      unknownPath: '/sprites/unknown.png',
    };

    if (!this.missingnoEnabled) {
      return;
    }

    let res = [];
    for (let i = 0; i < this.allSprites.length; i++) {
      if (
        this.allSprites[i].style.display != 'none' &&
        this.allSprites[i].parentElement.style.display != 'none' &&
        this.allSprites[i].parentElement.parentElement.style.display != 'none'
      ) {
        res.push(this.allSprites[i]);
      }
    }

    let img,
      randomI = randomIntFromInterval(0, res.length - 1),
      randomSrc = res[randomI].src,
      rand = randomIntFromInterval(0, 100);

    if (rand < 70) {
      img = '/images/missingno.png';
    } else if (rand < 90) {
      img = '/images/missingno2.png';
    } else {
      img = '/images/missingno3.png';
    }
    res[randomI].src = img;

    let self = this;
    setTimeout(
      () => {
        if (randomSrc.indexOf('/unknown') !== -1) {
          randomSrc = darkMode ? ops.unknown2 : ops.unknownPath;
        }

        res[randomI].src = randomSrc;
        self.startMissingno();
      },
      randomIntFromInterval(300, 3000),
    );
  }

  startSpooky() {
    const ops = {
      block: 'block',
      duskullPath: '/images/duskull.gif',
      none: 'none',
      rubySound: '/sound-effects/ruby_00ED.wav',
      rubySound2: '/sound-effects/ruby_00F4.wav',
      spooky: 'spooky',
      unknown: '/unknown',
      unknown2: '/sprites/unknown-2.png',
    };

    if (!this.spooky) {
      return;
    }

    let self = this;
    setTimeout(
      () => {
        if (!self.spooky) {
          return;
        }

        let spritesToChange = [];
        for (let i = 0; i < this.allSprites.length; i++) {
          if (
            this.allSprites[i].style.display != 'none' &&
            this.allSprites[i].parentElement.style.display != 'none' &&
            this.allSprites[i].parentElement.parentElement.style.display != 'none'
          ) {
            spritesToChange.push(this.allSprites[i]);
          }
        }

        if (spritesToChange.length < 1) {
          setTimeout(() => {
            self.startSpooky();
          }, 1000);
          return;
        }

        let played = false;

        if (soundEnabled) {
          let audio = new Audio(ops.rubySound2);
          audio.volume = 0.2;
          audio.play().then(() => {
            played = true;
          });
        }

        let randomNumber = randomIntFromInterval(0, spritesToChange.length - 1),
          randomSrc = spritesToChange[randomNumber].src,
          duskullPath = ops.duskullPath;

        spritesToChange[randomNumber].src = duskullPath;

        setTimeout(
          () => {
            if (randomSrc.indexOf(ops.unknown) !== -1) {
              randomSrc = darkMode ? ops.unknown2 : '/sprites/unknown.png';
            }
            spritesToChange[randomNumber].src = randomSrc;

            if (!self.spooky) {
              return;
            }

            if (soundEnabled && played) {
              let audio = new Audio(ops.rubySound);
              audio.volume = 0.2;
              audio.play();
              document.getElementById('spooky').style.display = ops.block;
            }

            if (!soundEnabled) {
              document.getElementById(ops.spooky).style.display = ops.block;
              self.startSpooky();
              return;
            }
          },
          randomIntFromInterval(3500, 4500),
        );
      },

      randomIntFromInterval(10000, 25000),
    );
  }

  parseInput(input, user, onFinish = null) {
    if (paused) {
      return [false, null];
    }

    let guesses = [];
    input = input.toLowerCase();

    if (input === 'nidoran' || input === 'ニドラン'.toLowerCase() || input === '니드런'.toLowerCase()) {
      if (this.orderMode) {
        if (this.named.has('nidoranf')) {
          guesses.push('nidoranm');
          guesses.push('ニドランm');
          guesses.push('니드런m');
        } else {
          guesses.push('nidoranf');
          guesses.push('ニドランf');
          guesses.push('니드런f');
        }
      } else {
        guesses.push('nidoranf');
        guesses.push('ニドランf');
        guesses.push('니드런f');
        guesses.push('nidoranm');
        guesses.push('ニドランm');
        guesses.push('니드런m');
      }
    }

    if (input === 'missingno' || input === 'けつばん' || input === 'missingno'.toLowerCase()) {
      this.missingnoEnabled = true;
      if (soundEnabled) soundEffectMissingno.play();
      this.startMissingno();
      return [true, 'missingno'];
    }

    input = standardizeName(input);
    let normalizedName = input.replace('ae', 'ä').replace('oe', 'ö').replace('ue', 'ü').replace('ss', 'ß');
    normalizedName = standardizeName(normalizedName);

    if (normalizedName !== input) {
      guesses.push(normalizedName);
    } else {
      guesses.push(input);
    }

    let found = false,
      errorMessage = null;

    for (let i = 0; i < guesses.length; i++) {
      guesses[i] = standardizeName(guesses[i]);
      let guess = guesses[i];

      if (guess in this.nameDict) {
        let guessedName = this.nameDict[guess],
          pokemonName = this.pokemonIdDict[guessedName].baseName;

        // already found
        if (this.named.has(pokemonName)) {
          let valid = false;

          for (let name in this.nameDict)
            if (name.startsWith(guess) && name !== guess) {
              valid = true;
              break;
            }

          if (!valid) {
            errorMessage = `${this.pokemonIdDict[this.baseNameIdDict[pokemonName]].getFormattedName(this.currentLang)}\x20already\x20named`;
          }
          continue;
        }

        // not part of this quiz
        if (!this.currentBaseNames.has(pokemonName)) {
          let valid = false;
          for (const currentLangsName of this.currentLangsNames)
            if (currentLangsName.startsWith(guess)) {
              valid = true;
              break;
            }

          if (!valid) {
            errorMessage = `${this.pokemonIdDict[this.baseNameIdDict[pokemonName]].getFormattedName(this.currentLang)}\x20is\x20not\x20part\x20of\x20this\x20quiz`;
          }
          continue;
        }

        // Not found
        if (!this.currentLangsNames.has(guess)) {
          continue;
        }

        // Order mode checking
        if (this.orderMode) {
          let lastNamedIndex = -1;
          for (let i = 0; i < this.currentPokemonList.length; i++) {
            if (this.named.has(this.currentPokemonList[i].baseName) && i > lastNamedIndex) {
              lastNamedIndex = i;
            }
          }

          if (pokemonName !== this.currentPokemonList[lastNamedIndex + 1].baseName) {
            let valid = false;

            for (let name in this.nameDict)
              if (name.startsWith(guess) && name !== guess) {
                valid = true;
                break;
              }

            if (!valid) {
              errorMessage = `${this.pokemonIdDict[this.baseNameIdDict[pokemonName]].getFormattedName(this.currentLang)}\x20is\x20not\x20the\x20next\x20Pokémon`;
            }

            continue;
          }
        } else {
          // Type Shuffle
          if (this.typeDisorder && this.currentType !== null) {
            let valid = false;
            for (let i = 0; i < this.pokemonBaseNameDict[pokemonName].length; i++) {
              let pokemonBaseName = this.pokemonBaseNameDict[pokemonName][i];
              if (
                (pokemonBaseName.primaryType === this.currentType ||
                  pokemonBaseName.secondaryType === this.currentType) &&
                this.typeChaosIds.has(pokemonBaseName.id)
              ) {
                valid = true;
                break;
              }
            }

            // before we return we need to check if there is another pokemon not yet found starting with the guess
            if (!valid) {
              let foundElsewhere = false;
              for (let name in this.nameDict)
                if (name.startsWith(guess) && name !== guess) {
                  foundElsewhere = true;
                  break;
                }

              if (!foundElsewhere) {
                let currentType = this.currentType.toLowerCase();
                currentType = currentType.charAt(0).toUpperCase() + currentType.slice(1);

                errorMessage = `${this.pokemonIdDict[this.baseNameIdDict[pokemonName]].getFormattedName(this.currentLang)}\x20is\x20not\x20${currentType}`;
              }
              continue;
            }
          }
        }

        let result = this.addNamed(pokemonName);
        this.addUserPoint(user);

        if (!(this.langDict[guess] in this.langCounts)) {
          this.langCounts[this.langDict[guess]] = 0;
        }
        this.langCounts[this.langDict[guess]] += 1;

        this.checkHighestLang();

        recentSprite.src = this.spriteDictionary[result.id].src;
        found = true;

        if (onFinish !== null) {
          onFinish(pokemonName);
        }
      }
    }
    return [found, errorMessage];
  }

  getCurrentRandomType() {
    const remaining = this.currentPokemonList.filter((pok) => !this.named.has(pok.baseName));

    if (remaining.length === 0) {
      return null;
    }

    const random = seededRandom(this.seed + this.named.size),
      randomPoke = remaining[Math.floor(random * remaining.length)];

    if (randomPoke.secondaryType) {
      return seededRandom(this.seed + this.named.size + 0.5) < 0.5 ? randomPoke.primaryType : randomPoke.secondaryType;
    }
    return randomPoke.primaryType;
  }

  addUserPoint(user) {
    if (!(user in this.users)) {
      this.users[user] = 0;
    }
    this.users[user] += 1;
  }

  resetDitto() {
    if (this.shinyEnabled) {
      this.spriteDictionary.ditto.src = this.encodedImages.shiny.ditto;
      this.unguessedDict.ditto.getElementsByTagName('img')[0].src = this.encodedImages.shiny.ditto;
    } else {
      this.spriteDictionary.ditto.src = this.encodedImages.sprite.ditto;
      this.unguessedDict.ditto.getElementsByTagName('img')[0].src = this.encodedImages.sprite.ditto;
    }
  }

  addNamed(value) {
    let baseNames = this.pokemonBaseNameDict[value],
      pokemons = [];

    for (let i = 0; i < baseNames.length; i++) {
      if (this.currentIds.has(baseNames[i].id)) {
        pokemons.push(baseNames[i]);
      }
    }

    if (this.cyclingEnabled) {
      if (this.named.has('ditto')) {
        this.spriteDictionary.ditto.src = this.spriteDictionary[pokemons[0].id].src;
        this.unguessedDict.ditto.getElementsByTagName('img')[0].src = this.spriteDictionary[pokemons[0].id].src;
      } else {
        this.resetDitto();
      }
    }

    for (let i = 0; i < pokemons.length; i++) {
      this.showSprite(pokemons[i].id);
    }
    this.named.add(value);

    // new random type
    if (this.typeDisorder) {
      let currentRandomType = this.getCurrentRandomType();
      if (currentRandomType !== this.currentType) {
        this.changeTypeStyle(currentRandomType);
      }

      let curType = this.currentType;
      if (curType !== null && curType.toLowerCase() === 'dark') {
        curType = 'DARK';
      } else if (curType !== null && curType.toLowerCase() === 'evil') {
        curType = 'DARK';
      }

      if (curType !== null) {
        showImage(curType.toUpperCase());
      }
    }

    return pokemons[pokemons.length - 1];
  }

  getEndText() {
    let result = '\x20';
    if (this.name !== 'Full') {
      result = `\x20${this.name.charAt(0).toUpperCase()}${this.name.slice(1)}\x20`;
    }
    return result;
  }

  isSilhouettesEnabled() {
    return this.useSilhouettes;
  }

  animateCongrats() {
    for (let id of this.currentIds) {
      if (this.named.has(this.pokemonIdDict[id].baseName)) {
        animateInput(id);
      }
    }
  }

  isAllShadowsRevealed() {
    let allRevealed = true;

    for (let i = 0; i < this.currentPokemonList.length; i++) {
      let currentPokemon = this.currentPokemonList[i];
      if (!this.revealedShadows.has(currentPokemon.id) && !this.named.has(currentPokemon.baseName)) {
        allRevealed = false;
        break;
      }
    }

    return allRevealed;
  }

  revealNextShadow() {
    for (let i = 0; i < this.currentPokemonList.length; i++) {
      let currentPokemon = this.currentPokemonList[i];

      if (!this.named.has(currentPokemon.baseName)) {
        this.silhouetteDictionary[currentPokemon.id].style.display = 'inline';
        this.pokeballDictionary[currentPokemon.id].style.display = 'none';
        this.revealedShadows.add(currentPokemon.id);

        return currentPokemon.id;
      }
    }
    return null;
  }

  revealRandomShadow() {
    if (!this.orderMode) {
      let remaining = [];
      for (let i = 0; i < this.currentPokemonList.length; i++) {
        let currentPokemon = this.currentPokemonList[i];

        if (!this.named.has(currentPokemon.baseName) && !this.revealedShadows.has(currentPokemon.id)) {
          remaining.push(currentPokemon.id);
        }
      }

      if (remaining.length > 0) {
        let randomPokemon = remaining[Math.floor(Math.random() * remaining.length)];

        this.silhouetteDictionary[randomPokemon].style.display = 'inline';
        this.pokeballDictionary[randomPokemon].style.display = 'none';
        this.revealedShadows.add(randomPokemon);

        return randomPokemon;
      }
    }
    return null;
  }

  revealRandomTypeShadow() {
    if (this.typeDisorder) {
      let candidates = [];
      for (let i = 0; i < this.currentPokemonList.length; i++) {
        let currentPokemon = this.currentPokemonList[i];

        if (!this.named.has(currentPokemon.baseName) && !this.revealedShadows.has(currentPokemon.id)) {
          if (currentPokemon.primaryType === this.currentType || currentPokemon.secondaryType === this.currentType) {
            candidates.push(currentPokemon.id);
          }
        }
      }

      if (candidates.length > 0) {
        let randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        this.silhouetteDictionary[randomCandidate].style.display = 'inline';
        this.pokeballDictionary[randomCandidate].style.display = 'none';
        this.revealedShadows.add(randomCandidate);
        return randomCandidate;
      }
    }
    return null;
  }

  revealSingleShadow(name) {
    if (!this.revealedShadows.has(name)) {
      this.revealedShadows.add(name);
      this.silhouetteDictionary[name].style.display = 'inline';
      this.pokeballDictionary[name].style.display = 'none';
    }
  }

  setSilhouettes() {
    for (let id of this.currentIds) {
      if (this.spriteDictionary[id].style.display !== 'inline') {
        this.revealSingleShadow(id);
      }
    }
    this.useSilhouettes = true;
  }

  usePokeball() {
    for (let i = 0; i < this.silhouetteArray.length; i++) {
      this.silhouetteArray[i].style.display = 'none';
      this.pokeballArray[i].style.display = 'inline';
    }
  }

  hideSprite(name) {
    this.spriteDictionary[name].style.display = 'none';
    this.unguessedDictionary[name].style.display = 'inline';
  }

  setupSprites() {
    for (let i = 0; i < this.pokemon.length; i++) {
      let pokemon = this.pokemon[i],
        img = document.createElement('img');

      img.classList.add('sprite');
      img.classList.add('zoom');
      img.src = this.encodedImages.sprite[pokemon.id];
      this.spriteDictionary[pokemon.id] = img;
      this.allSprites.push(img);

      let silhouetteImg = document.createElement('img');
      silhouetteImg.classList.add('sprite');
      silhouetteImg.src = this.encodedImages.silhouette[pokemon.id];
      silhouetteImg.style.display = 'none';
      this.silhouetteDictionary[pokemon.id] = silhouetteImg;
      this.silhouetteArray.push(silhouetteImg);
      this.allSprites.push(silhouetteImg);

      let div = document.createElement('div'),
        unknownImg = document.createElement('img');
      unknownImg.classList.add('sprite');
      unknownImg.src = '/sprites/unknown.png';
      this.unguessedDictionary[pokemon.id] = div;
      this.pokeballDictionary[pokemon.id] = unknownImg;
      this.pokeballArray.push(unknownImg);
      this.allSprites.push(unknownImg);

      div.appendChild(this.silhouetteDictionary[pokemon.id]);
      div.appendChild(unknownImg);

      let pokemonBox = this.boxDict[pokemon.box];
      pokemonBox.appendChild(this.spriteDictionary[pokemon.id]);
      pokemonBox.appendChild(div);

      this.hideSprite(pokemon.id);

      this.boxConstruction.push([pokemonBox, [this.spriteDictionary[pokemon.id], div], pokemon]);
    }
  }

  setupMissedContent() {
    const _0x12481a = {
      fcoTc: 'inline',
      yMdWu: 'none',
    };
    let allBoxes = {};
    document.getElementById('panel').innerHTML = '';

    for (let box in this.boxDict) {
      let boxWrapper = document.createElement('div'),
        boxPane = document.createElement('div');

      boxPane.classList.add('box');
      boxPane.classList.add('roundedf');
      boxPane.classList.add('topedge');
      boxPane.style.display = 'block';
      boxWrapper.appendChild(boxPane);
      document.getElementById('panel').appendChild(boxWrapper);

      allBoxes[box] = boxPane;
    }

    for (let i = 0; i < this.pokemon.length; i++) {
      let poke = this.pokemon[i],
        imgWrapper = document.createElement('div'),
        image = document.createElement('img'),
        text = document.createTextNode('');

      image.style.display = 'inline';
      image.src = this.spriteDictionary[poke.id].src;
      image.classList.add('spritel');

      imgWrapper.style.display = 'none';
      imgWrapper.appendChild(image);
      imgWrapper.appendChild(text);

      this.unguessedDict[poke.id] = imgWrapper;
      this.unguessedDictTexts[poke.id] = text;
      allBoxes[poke.currentBox].appendChild(imgWrapper);
    }
  }

  getLeaderboardData() {}

  showSprite(name) {
    this.spriteDictionary[name].style.display = 'inline';
    this.unguessedDictionary[name].style.display = 'none';

    let currentBox = this.pokemonIdDict[name].currentBox,
      pokemon = this.pokemonIdDict[name];

    if (this.chaosMode) {
      let pokemons = document.getElementById('pokemon-box-big').children,
        nextIndex = -1,
        foundIndex = -1;

      // switch the next pokemon in the list with the pokemon found
      for (let i = 1; i < pokemons.length; i++) {
        if (nextIndex === -1 && pokemons[i].tagName.toUpperCase() === 'DIV') {
          if (
            pokemons[i].children[1].style.display === 'inline' ||
            pokemons[i].children[0].style.display === 'inline'
          ) {
            nextIndex = i;
          }

          if (foundIndex !== -1) {
            break;
          }
        } else {
          if (foundIndex === -1 && pokemons[i] === this.spriteDictionary[name]) {
            foundIndex = i;
          }

          if (nextIndex !== -1) {
            break;
          }
        }
      }

      swapChildren(document.getElementById('pokemon-box-big'), nextIndex, foundIndex);
      if (nextIndex > foundIndex) {
        document.getElementById('pokemon-box-big').insertBefore(pokemons[foundIndex + 1], pokemons[nextIndex + 1]);
      }
    }

    if (
      !this.boxCounters[currentBox].includes(pokemon) &&
      (this.boxCounters[currentBox].push(pokemon),
      this.boxCounters[currentBox].length === this.currentBoxes[currentBox].length)
    ) {
      let parent = this.spriteDictionary[name].parentElement;
      parent.classList.add('outline');
      parent.classList.add(`outline${this.getStyleName()}`);
    }
  }

  stopReveal() {
    for (let i = 0; i < this.revealTimeouts.length; i++) {
      clearInterval(this.revealTimeouts[i]);
    }
    this.revealTimeouts = [];
  }

  gameOver() {
    this.giveUpState = true;
    let delay = 0,
      notFound = [];

    for (const id of this.currentIds) {
      if (!this.named.has(this.pokemonIdDict[id].baseName)) {
        notFound.push(id);
      }
    }

    for (let i = 0; i < notFound.length; i++) {
      let pokemon = notFound[i];
      delay += 35;

      let timeout = setTimeout(() => {
        this.spriteDictionary[pokemon].classList.add('revealed');
        this.spriteDictionary[pokemon].classList.remove('zoom');
        this.showSprite(pokemon);
        changeFooterPosition();
      }, delay);

      this.revealTimeouts.push(timeout);
    }

    for (let i = 0; i < notFound.length; i++) {
      let pokemon = notFound[i];
      this.unguessedDict[pokemon].style.display = 'inline-block';
      this.unguessedDict[pokemon].classList.add('fixed-width');
    }
    this.resetDitto();
  }

  resetCurrentSprites() {
    if (this.shinyEnabled) {
      for (let id of this.currentIds) {
        this.spriteDictionary[id].src = this.encodedImages.shiny[id];
        this.unguessedDict[id].getElementsByTagName('img')[0].src = this.encodedImages.shiny[id];
      }
    } else {
      for (let id of this.currentIds) {
        this.spriteDictionary[id].src = this.encodedImages.sprite[id];
        this.unguessedDict[id].getElementsByTagName('img')[0].src = this.encodedImages.sprite[id];
      }
    }
  }

  shinyOn() {
    this.shinyEnabled = true;
    this.resetCurrentSprites();
  }

  shinyOff() {
    this.shinyEnabled = false;
    this.resetCurrentSprites();
  }
}

function swapChildren(container, a, b) {
  const childA = container.children[a],
    childB = container.children[b];

  container.insertBefore(childB, childA);
  const pos = a < b ? b : b + 1;
  container.insertBefore(childA, container.children[pos]);
}

let allLanguages = ['ENG', 'FRE', 'GER', 'ESP', 'ITA', 'KOR', 'JPN', 'CHT', 'CHS'],
  typeList = [
    'normal',
    'fire',
    'water',
    'grass',
    'electric',
    'ice',
    'ground',
    'flying',
    'poison',
    'fighting',
    'psychic',
    'dark',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'steel',
    'fairy',
  ],
  boxIds = [
    'big',
    'kanto',
    'johto',
    'hoenn',
    'sinnoh',
    'unova',
    'kalos',
    'alola',
    'megakalos',
    'megahoenn',
    'unknown',
    'galar',
    'gmax',
    'hisui',
    'paldea',
    'paldeadlc',
    'megalumiose',
    'megahyperspace',
    'sub-legendary',
    'legendary',
    'mythical',
    'ultrabeast',
    'paradox',
  ],
  genQuizBoxes = {
    0: [
      'kanto',
      'johto',
      'hoenn',
      'sinnoh',
      'unova',
      'kalos',
      'megakalos',
      'megahoenn',
      'alola',
      'unknown',
      'galar',
      'gmax',
      'hisui',
      'paldea',
      'paldeadlc',
      'megalumiose',
      'megahyperspace',
    ],
    1: ['kanto'],
    0x2: ['johto'],
    0x3: ['hoenn'],
    0x4: ['sinnoh'],
    5: ['unova'],
    0x6: ['kalos', 'megakalos', 'megahoenn'],
    0x7: ['alola', 'unknown'],
    0x8: ['galar', 'gmax', 'hisui'],
    0x9: ['paldea', 'paldeadlc', 'megalumiose', 'megahyperspace'],
  },
  soundEffect = new Audio('/sound-effects/gen3-click2.wav'),
  soundEffectMissingno = new Audio('/sound-effects/032.wav');
((soundEffectMissingno.volume = 0.2), (soundEffect.volume = 0.5));
let soundEffect2 = new Audio('/sound-effects/Dex-Fanfare.mp3'),
  soundEffectJoin = new Audio('/sound-effects/quizjoin.wav');
soundEffectJoin.volume = 0.35;
let soundEffectExit = new Audio('/sound-effects/quizleave.wav');
((soundEffectExit.volume = 0.35), (soundEffect2.volume = 0.3));
let soundEffectWrongOrder = new Audio('/sound-effects/wrong.mp3');
soundEffectWrongOrder.volume = 0.15;
let darkMode = false,
  isSpellingEnabled = false,
  currentType = '',
  activeTimer = false,
  isTwitchOn = false;
var soundEnabled = true,
  paused = false,
  isSocketHost = false;
let socket = null,
  shadowHelpInterval = null,
  shadowHelpIntervalMessage = null,
  timerObj = {};
var client;
let rankVals = ['rankone', 'ranktwo', 'rankthree'],
  myUsername = 'Quizmaster',
  _lastDarkSwap = 0,
  _lastShinySwap = 0,
  swapLimit = 10000,
  missingOptionsDiv = document.getElementById('missednames-options'),
  language_box = document.getElementById('lang_box'),
  inputField = document.getElementById('pokemon'),
  recentSprite = document.getElementById('recentsprite'),
  spellingElement = document.getElementById('spelling'),
  spellingButton = document.getElementById('spellingbutton'),
  spellingCheck = document.getElementById('check'),
  spellingHint = document.getElementById('hint'),
  radioPokeball = document.getElementById('pokeball'),
  radioSilhouette = document.getElementById('silhouette'),
  orderModeMenu = document.getElementById('orderbox'),
  orderButton = document.getElementById('order-on'),
  regularButton = document.getElementById('order-off'),
  typeDisorderButtonOn = document.getElementById('type-on'),
  typeDisorderButtonOff = document.getElementById('type-off'),
  chaosButton = document.getElementById('chaos-on'),
  shadowNextBtn = document.getElementById('shadownext'),
  shadowHelpRadio = document.getElementById('shadowhelp'),
  counterText = document.getElementById('counter'),
  totalText = document.getElementById('total'),
  giveUpBtn = document.getElementById('surrender'),
  resetBtn = document.getElementById('resetButton'),
  promptSilh = document.getElementById('promptsilhouette'),
  promptOrderEnable = document.getElementById('promptorder-enable'),
  promptChaosEnable = document.getElementById('promptchaos-enable'),
  promptOrderDisable = document.getElementById('promptorder-disable'),
  promptTypeDisorderEnable = document.getElementById('prompttype-enable'),
  promptGen = document.getElementById('promptswitch'),
  promptSilhYes = document.getElementById('sil-yes'),
  promptSilhNo = document.getElementById('sil-no'),
  promptOrderEnableYes = document.getElementById('order-enable-yes'),
  promptChaosEnableYes = document.getElementById('chaos-enable-yes'),
  promptOrderDisableYes = document.getElementById('order-disable-yes'),
  promptOrderEnableNo = document.getElementById('order-enable-no'),
  promptChaosEnableNo = document.getElementById('chaos-enable-no'),
  promptOrderDisableNo = document.getElementById('order-disable-no'),
  promptTypeDisorderYes = document.getElementById('type-enable-yes'),
  promptTypeDisorderNo = document.getElementById('type-enable-no'),
  promptGenYes = document.getElementById('gen-yes'),
  promptGenNo = document.getElementById('gen-no'),
  timerBtn = document.getElementById('timer-set'),
  stopwatchBtn = document.getElementById('timer0'),
  timerText = document.getElementById('timer'),
  pauseBtn = document.getElementById('pause'),
  main = document.getElementById('main'),
  footer = document.getElementById('footer'),
  hostGame = document.getElementById('hostButton'),
  linkGame = document.getElementById('linkButton'),
  usernamePrompt = document.getElementById('promptusername'),
  genBoxes = document.getElementById('gen-boxes'),
  bigBox = document.getElementById('pokemon-box-big'),
  saveButton = document.getElementById('savestate'),
  loadButton = document.getElementById('loadstate'),
  boxDict = {};
for (let e = 0; e < boxIds.length; e++) {
  let t = boxIds[e];
  ((boxDict[t] = document.getElementById('pokemon-box-' + t)), (boxDict[t].style.display = 'none'));
}
let multiplayerUrl,
  randomIntFromInterval = function (_0xdf60d1, _0x59f1dd) {
    const _0x4487af = {
      Yqvno: function (_0x65b498, _0x4c17a8) {
        return _0x65b498 - _0x4c17a8;
      },
      kmDnq: function (_0xa3808f, _0x302cb9) {
        return _0xa3808f + _0x302cb9;
      },
    };
    return Math.floor(
      _0x4487af['kmDnq'](Math.random() * _0x4487af['kmDnq'](_0x4487af['Yqvno'](_0x59f1dd, _0xdf60d1), 1), _0xdf60d1),
    );
  },
  quiz = new Quiz(boxDict, genQuizBoxes, allLanguages);

function noSuchRoom() {
  const _0x1c0987 = {
    xFSWB: 'return-message',
  };
  ((document.getElementById(_0x1c0987['xFSWB']).innerText = 'Room\x20no\x20longer\x20exists'),
    (document.getElementById('return-overlay').style.display = 'block'));
}

function roomClosed() {
  const _0x4fdb8d = {
    PAbWI: 'block',
  };
  ((document.getElementById('return-message').innerText = 'The\x20host\x20has\x20disbanded\x20the\x20room'),
    (document.getElementById('return-overlay').style.display = _0x4fdb8d['PAbWI']));
}

function multiplayerDisabled() {
  const _1007998 = {
    eyOBa: 'block',
    zCMNV: 'return-overlay',
  };
  ((document.getElementById('return-message').innerText =
    'Multiplayer\x20is\x20undergoing\x20maintenance.\x20Try\x20again\x20later.'),
    (document.getElementById(_1007998['zCMNV']).style.display = _1007998['eyOBa']));
}

document.getElementById('return')['onclick'] = function () {
  (window['removeEventListener']('beforeunload', beforeUnload), (window['location']['href'] = '/'));
};
let current = new URL(window['location']['href']);

function loadSocketIO() {
  const _0x402189 = {
    MAHnf: 'socket.io/socket.io.js',
    fOvZS: 'script',
  };
  return new Promise((_0x2ce3c4, _0x3ebf19) => {
    let _0x3e76f8 = multiplayerUrl + _0x402189['MAHnf'];
    const _0x2a0fb5 = document.createElement(_0x402189['fOvZS']);
    ((_0x2a0fb5.src = _0x3e76f8),
      (_0x2a0fb5['onload'] = _0x2ce3c4),
      (_0x2a0fb5['onerror'] = _0x3ebf19),
      document['head'].appendChild(_0x2a0fb5));
  });
}

function getRoomNameFromURL() {
  const _0x2cf89c = {
      mawoM: function (_0x493c4e, _0x51bc1e) {
        return _0x493c4e - _0x51bc1e;
      },
    },
    _0x3d8ef4 = window['location']['pathname']['split']('/');
  return _0x3d8ef4[_0x2cf89c['mawoM'](_0x3d8ef4.length, 1)];
}

multiplayerUrl = current['hostname'].includes('localhost') ? '//localhost:3001/' : '//stapo.cloud/';
let roomId = getRoomNameFromURL();

async function fetchData(_0x5ee8df, _0x29f4cc = true) {
  const _0x415e7b = {
    HtGIB: function (_0x58f020, _0x4f5dfb) {
      return _0x58f020(_0x4f5dfb);
    },
    NGsGi:
      'There\x20seems\x20to\x20be\x20a\x20problem\x20with\x20fetching\x20the\x20data.\x20Please\x20try\x20refreshing\x20the\x20page.',
    QOjBY: function (_0x211ff3, _0x12ffea) {
      return _0x211ff3 + _0x12ffea;
    },
    VJbnn: 'application/json',
    tWZQa: function (_0xf180e2, _0x369f81, _0x4fdb01) {
      return _0xf180e2(_0x369f81, _0x4fdb01);
    },
  };
  try {
    let _0x100382 = await fetch(_0x415e7b['QOjBY']('/', _0x5ee8df), {
        headers: {
          'Content-Type': _0x415e7b['VJbnn'],
        },
        method: 'GET',
      }),
      _0x2f0c52 = await _0x100382['json']();
    return ((retries = 0), _0x2f0c52);
  } catch (_0x2e0ad3) {
    if ((console['error']('Error\x20fetching\x20data:', _0x2e0ad3), _0x29f4cc)) {
      if ((retries++, retries <= MAX_RETRIES)) {
        return (
          await new Promise((_0x1b6070) => setTimeout(_0x1b6070, RETRY_INTERVAL_MS)),
          _0x415e7b['tWZQa'](fetchData, _0x5ee8df, _0x29f4cc)
        );
      }
      (console['error'](_0x2e0ad3), _0x415e7b['HtGIB'](alert, _0x415e7b['NGsGi']));
    }
  }
}

async function postMultiplayerServer(_0x32e08b, _0xfd2c7d) {
  const _0x179836 = {
    XCvJJ: 'POST',
    tSmjz: function (_0x5d0755, _0x8e0d18, _0x5e6c70) {
      return _0x5d0755(_0x8e0d18, _0x5e6c70);
    },
  };
  try {
    let _0x1f737f = await _0x179836['tSmjz'](fetch, multiplayerUrl + _0x32e08b, {
      body: JSON['stringify'](_0xfd2c7d),
      headers: {
        'Content-Type': 'application/json',
      },
      method: _0x179836['XCvJJ'],
    });
    return await _0x1f737f['json']();
  } catch (_0x972af4) {
    return (console['log'](_0x972af4), false);
  }
}

((MAX_RETRIES = 5), (RETRY_INTERVAL_MS = 1000), (retries = 0));
var lastResult = {};

async function postResult(_0x3d112b) {}

async function getMultiplayerServer(_0x2fb606) {
  const _0x587faa = {
    tOugX: function (_0xbea23f, _0x337253, _0x3ceb9f) {
      return _0xbea23f(_0x337253, _0x3ceb9f);
    },
    yvlXx: function (_0x2d69a4, _0x1de459) {
      return _0x2d69a4 + _0x1de459;
    },
  };
  try {
    let _0x5108a9 = await _0x587faa['tOugX'](fetch, _0x587faa['yvlXx'](multiplayerUrl, _0x2fb606), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return await _0x5108a9['json']();
  } catch (_0x402188) {
    return (console['log'](_0x402188), false);
  }
}

function beforeUnload(_0x5d63ac) {
  '00:00:00' != timerText.innerHTML && (_0x5d63ac['preventDefault'](), (_0x5d63ac['returnValue'] = ''));
}

async function loadData() {
  const constants = {
    EjTKk: function (_0x58a477, _0x1ae138) {
      return _0x58a477(_0x1ae138);
    },
    EkIcu: function (_0x27c694, _0x377fcb) {
      return _0x27c694(_0x377fcb);
    },
    EmCVN: function (_0x5d5753, _0x31378f) {
      return _0x5d5753 === _0x31378f;
    },
    Esrzl: function (_0x1be2e6, _0x3071ce) {
      return _0x1be2e6 == _0x3071ce;
    },
    FBbYa: function (_0x5c4e05, _0x39437b) {
      return _0x5c4e05 + _0x39437b;
    },
    FTJPv: function (_0x22e474, _0x5e354f) {
      return _0x22e474 in _0x5e354f;
    },
    FjwQw: 'revealedShadows',
    GBQPa: function (_0x426e93, _0x545d61) {
      return _0x426e93(_0x545d61);
    },
    GLavs: 'inlineboxdark',
    GQIGX: function (_0x5ab1a3, _0x2e900b) {
      return _0x5ab1a3 + _0x2e900b;
    },
    GYoHP: function (_0x34bba5, _0x143037) {
      return _0x34bba5(_0x143037);
    },
    GlnwJ: function (_0x155788, _0x21cc5a) {
      return _0x155788 % _0x21cc5a;
    },
    HAvSt: 'Username\x20should\x20be\x20at\x20least\x202\x20characters\x20long',
    HHRag: '/images/types/',
    HJKnV: 'smolbuttonxdark',
    HJLRw: function (_0x195a8d, _0x110c42) {
      return _0x195a8d > _0x110c42;
    },
    HhOuq: function (_0x1a9a4f, _0x31e656) {
      return _0x1a9a4f(_0x31e656);
    },
    IGEEC: function (_0x4e43c6, _0x1c48bc) {
      return _0x4e43c6 + _0x1c48bc;
    },
    JbBCS: function (_0x274013, _0x349127) {
      return _0x274013(_0x349127);
    },
    KDxwc: 'Revealing\x20a\x20shadow\x20in\x203\x20seconds\x20...',
    KWwwr: 'cycle-on',
    KXNkQ: function (_0x192662, _0x3c42e2) {
      return _0x192662 === _0x3c42e2;
    },
    KbDPg: 'nora',
    KzMpF: function (_0x32cb42, _0xbace1e) {
      return _0x32cb42(_0xbace1e);
    },
    LCDxb: function (_0x411e53, _0x132eeb) {
      return _0x411e53 - _0x132eeb;
    },
    LImBr: function (_0x3c7966, _0x516675) {
      return _0x3c7966 !== _0x516675;
    },
    LVmEH: function (_0x3830f1, _0x46332a, _0x46bd45, _0x2b9aa5) {
      return _0x3830f1(_0x46332a, _0x46bd45, _0x2b9aa5);
    },
    LWdHe: 'wingull',
    Ltrxd: function (_0xe04e29, _0x38e7ec) {
      return _0xe04e29 + _0x38e7ec;
    },
    Lwfue: function (_0x4de712, _0xb616e0) {
      return _0x4de712 == _0xb616e0;
    },
    Lzipw: function (_0x2751a8, _0x1472dc) {
      return _0x2751a8 === _0x1472dc;
    },
    MAcCo: function (_0x11b43e, _0x4377ce) {
      return _0x11b43e(_0x4377ce);
    },
    OkKMX: 'party\x20off',
    Osfto: function (_0x47b39b, _100a810) {
      return _0x47b39b == _100a810;
    },
    PUPtP: function (_0x57f91c, _0x110617, _0x195efa, _0x54a9b6) {
      return _0x57f91c(_0x110617, _0x195efa, _0x54a9b6);
    },
    PmenZ: function (_0x17b479, _0x181ee4) {
      return _0x17b479(_0x181ee4);
    },
    PoGPv: function (_0x545cd, _0x561c42) {
      return _0x545cd * _0x561c42;
    },
    PqSrS: function (_0x268c7f, _0x14bb57) {
      return _0x268c7f !== _0x14bb57;
    },
    QC: 'QC\x20-\x20',
    QQEdY: 'Shadow\x20hotkey\x20is\x20not\x20enabled',
    Qqmuu: 'ethan_from_chicago',
    RItDx: function (_0x2548fb, _0x2bfdc4) {
      return _0x2548fb + _0x2bfdc4;
    },
    RLUxk: function (_0xc3f84d, _0x28c187) {
      return _0xc3f84d == _0x28c187;
    },
    RlRVA: function (_0x2e99d3, _0x348786) {
      return _0x2e99d3(_0x348786);
    },
    RwcIQ: 'ethan',
    SPaSR: 'message',
    SWNAr: 'order-congrats',
    Srgss: 'roggenrola',
    SsLza: 'silhouettes',
    SuctZ: function (_0x407b67, _0x4e8486, _0x24c860, _0x1590f4) {
      return _0x407b67(_0x4e8486, _0x24c860, _0x1590f4);
    },
    TDdIp: function (_0x2fa351, _0x225a56) {
      return _0x2fa351 - _0x225a56;
    },
    TTIup: function (_0x4aa6a8, _0x43e5a3) {
      return _0x4aa6a8 !== _0x43e5a3;
    },
    TjiLp: 'inline',
    ToQQE: 'online',
    TwgqC: function (_0x434837, _0x287482) {
      return _0x434837 / _0x287482;
    },
    UBviC: function (_0x2fd744, _0x14bab9) {
      return _0x2fd744(_0x14bab9);
    },
    UJqTj: 'Order\x20mode\x20does\x20not\x20work\x20with\x20the\x20current\x20quiz',
    UiQPb: 'blenddark',
    UwClu: 'fortuna',
    UzzfA: 'GET',
    ViKZe: 'yarnie',
    Vkdua: '/images/spheal.png',
    VmxES: function (_0xad4319) {
      return _0xad4319();
    },
    VotkM: function (_0x4db74a, _0x4bedfb) {
      return _0x4db74a(_0x4bedfb);
    },
    VrsqJ: 'SPRITE\x20NOT\x20FOUND!',
    VwuXG: 'pidove',
    WIJsr: function (_0x383a9f, _0x31b9b0) {
      return _0x383a9f * _0x31b9b0;
    },
    WMYbe: function (_0x4f9ec1, _0xaaca7, _0x329a17) {
      return _0x4f9ec1(_0xaaca7, _0x329a17);
    },
    WTcif: function (_0x25b205, _0x34ec64) {
      return _0x25b205 != _0x34ec64;
    },
    absolPath: '/images/absol.png',
    absoltastic: 'absoltastic',
    accordion: 'accordion',
    activatedAutoReveal: 'Activated\x20auto-reveal\x20of\x20next\x20shadow\x20every\x2020\x20seconds',
    add: (a, b) => a + b,
    add2: (a, b) => a + b,
    add30: function (_0x42bf59, _0x2efbe0) {
      return _0x42bf59 + _0x2efbe0;
    },
    add4: function (_0x132c27, _0x2647bd) {
      return _0x132c27 + _0x2647bd;
    },
    add7: function (_0x411c49, _0x2bf46e) {
      return _0x411c49 + _0x2bf46e;
    },
    adeptcharon: 'adeptcharon',
    adown: 'adown',
    airstainer: 'aistrainer',
    archen: 'archen',
    arrow2: 'arrow2',
    artists: '/artists',
    aup: 'aup',
    backgroundDark: '/images/background-dark.svg',
    badges: 'badges',
    beforeunload: 'beforeunload',
    birdkeeper: 'birdkeeper',
    birdkeepertoby: 'birdkeepertoby',
    block: 'block',
    board: 'board',
    body: 'body',
    button: 'button',
    call: (f, x) => f(x),
    call0: function (_0x571493, _0x5c9f66) {
      return _0x571493(_0x5c9f66);
    },
    call2: (f) => f(),
    call23: function (_0x377755, _0x57f9eb) {
      return _0x377755(_0x57f9eb);
    },
    call3: (f) => f(),
    call4: (f, x) => f(x),
    call43: function (_0x191d8c, _0x321679, _0x2be48a, _0x1c3c07) {
      return _0x191d8c(_0x321679, _0x2be48a, _0x1c3c07);
    },
    call431: function (_0x19eb39, _0x10b5ff) {
      return _0x19eb39(_0x10b5ff);
    },
    call5: (f, x) => f(x),
    call54: function (_0xd43899, _0x306f34) {
      return _0xd43899(_0x306f34);
    },
    call6: (f, x) => f(x),
    call7: function (_0x591ce9, _0x5ba7b1) {
      return _0x591ce9(_0x5ba7b1);
    },
    call8: function (_0xa2406a, _0x4ec791) {
      return _0xa2406a(_0x4ec791);
    },
    call9: function (_0x4b2c9d, _0x114b00) {
      return _0x4b2c9d(_0x114b00);
    },
    callf: (f) => f(),
    callf2: (f) => f(),
    callf3: (f) => f(),
    callf4: function (_0x2cb946, _0x2f7701) {
      return _0x2cb946(_0x2f7701);
    },
    callf5: (f, a) => f !== a,
    callf6: function (_0x5c76d7, _0x548fac, _0x12561b, _0x219c30) {
      return _0x5c76d7(_0x548fac, _0x12561b, _0x219c30);
    },
    callfa: (f, a, b) => f(a, b),
    callfa3: (f, a, b, c) => f(a, b, c),
    callfa4: function (f, a, b, c) {
      return f(a, b, c);
    },
    callfunc: function (_0xf6e790, _0xa16dd5, _0x39706f, _0x4394b5) {
      return _0xf6e790(_0xa16dd5, _0x39706f, _0x4394b5);
    },
    callg: (g, a, b) => g(a, b),
    callg3: function (_0x35a65f, _0x5efcce) {
      return _0x35a65f(_0x5efcce);
    },
    callg4: function (_0x38ee44, _0x2906fd) {
      return _0x38ee44(_0x2906fd);
    },
    callgg: function (_0x21504e, _0x4602b5) {
      return _0x21504e(_0x4602b5);
    },
    calll: (f) => f(),
    calll3: function (_0x945d08) {
      return _0x945d08();
    },
    callt: (f, a, b) => f(a, b),
    chaosmode: '\x20in\x20Chaos\x20mode!',
    chatot: 'chatot',
    countdown: 'countdown',
    crabominable: 'crabominable',
    cramorant: '/images/cramorant.png',
    creditstable: 'creditstable',
    cycleOff: 'cycle-off',
    dark: 'dark',
    darkoff: 'darkoff',
    darkon: 'darkon',
    delibird: 'delibird',
    dennis: 'dennis',
    disable: 'disable',
    disabledShuffle: 'Disabled\x20type\x20shuffle\x20mode.',
    displayName: 'display-name',
    div: (a, b) => a / b,
    div2: function (_0x38dd26, _0x169b92) {
      return _0x38dd26 / _0x169b92;
    },
    divdiv: 'div',
    donors: '/donors',
    drop: 'drop',
    ducklett: 'ducklett',
    end: 'end',
    eq: (a, b) => a === b,
    eq2: (a, b) => a === b,
    eq3: (a, b) => a === b,
    eq5: (a, b) => a === b,
    eqeqeq: function (_0x356ee2, _0x30d8a2) {
      return _0x356ee2 === _0x30d8a2;
    },
    eqeqeq2: function (_0x17f3ab, _0x2d6edb) {
      return _0x17f3ab === _0x2d6edb;
    },
    eqeqeq3: function (_0x3a4425, _0x7d4955) {
      return _0x3a4425 === _0x7d4955;
    },
    eqeqeq4: function (_0x4d3aeb, _0x1a406b) {
      return _0x4d3aeb === _0x1a406b;
    },
    eqeqeq5: function (_0x5ebb84, _0x2fc51f) {
      return _0x5ebb84 === _0x2fc51f;
    },
    eqeqeq7: function (_0x3162a7, _0x53a050) {
      return _0x3162a7 === _0x53a050;
    },
    equals: function (a, b) {
      return a === b;
    },
    errorLoadingData:
      'Error\x20loading\x20data.\x20Please\x20try\x20to\x20hard\x20refresh\x20(CTRL\x20+\x20F5)\x20or\x20clear\x20cache',
    every: '\x20every\x20',
    evil: 'evil',
    exec: function (_0x556140) {
      return _0x556140();
    },
    exec2: function (_0x26e7ba) {
      return _0x26e7ba();
    },
    exec4: function (_0x531020) {
      return _0x531020();
    },
    f5: function (_0x19a2f4, _0x4b18ef) {
      return _0x19a2f4(_0x4b18ef);
    },
    f6: function (_0x3c7bc7, _0x344551) {
      return _0x3c7bc7(_0x344551);
    },
    fabulousfauna: 'fabulousfauna',
    failedLoading: 'Failed\x20loading\x20file',
    farfetched: 'farfetchd',
    fcrVe: function (_0x43c98b, _0x5b3e75, _0x494e10) {
      return _0x43c98b(_0x5b3e75, _0x494e10);
    },
    fff: function (_0x5ea9d9, _0x56fb11) {
      return _0x5ea9d9(_0x56fb11);
    },
    fff7: function (_0xd33003, _0x5f4b82) {
      return _0xd33003(_0x5f4b82);
    },
    fff9: function (_0x4d3913, _0x189022) {
      return _0x4d3913(_0x189022);
    },
    ffg: function (_0x321ae1, _0x9abff4) {
      return _0x321ae1(_0x9abff4);
    },
    fg: function (_0x1a9602, _0x1a9cfa) {
      return _0x1a9602(_0x1a9cfa);
    },
    fileInput: 'fileInput',
    flapple: 'flapple',
    flapplePath: '/images/flapple.png',
    ft: function (_0x23369c, _0x5b7442) {
      return _0x23369c(_0x5b7442);
    },
    gen: 'gen',
    genname: 'gen-name',
    genselection: 'genselection',
    ggg: function (_0x1e8bc3, _0x49b305, _0x5b9f8a, _0x5e153a) {
      return _0x1e8bc3(_0x49b305, _0x5b9f8a, _0x5e153a);
    },
    gt: (a, b) => a > b,
    gt2: (a, b) => a > b,
    gt3: function (_0x2f44aa, _0xdb198a) {
      return _0x2f44aa > _0xdb198a;
    },
    gt33: function (_0x508555, _0x3f749e) {
      return _0x508555 > _0x3f749e;
    },
    gt35: function (_0x4fa014, _0x48292) {
      return _0x4fa014 > _0x48292;
    },
    gt4: function (_0x1486f9, _0x111c1b) {
      return _0x1486f9 > _0x111c1b;
    },
    gte: function (_0x4606cc, _0xd59c2a) {
      return _0x4606cc >= _0xd59c2a;
    },
    hawlucha: 'hawlucha',
    hoothoot: 'hoothoot',
    hoothootPath: '/images/hoothoot.png',
    https: 'https://',
    img: 'img',
    in2: (i, arr) => i in arr,
    inArr: (item, arr) => item in arr,
    inin: function (a, b) {
      return a in b;
    },
    inlineBlock: 'inline-block',
    inlinebox: 'inlinebox',
    inlinetext: 'inlinetext',
    inputBar: 'inputbar',
    join: '/join/',
    keyup: 'keyup',
    leaderboard2: 'leaderboard2',
    legendary: 'legendary',
    load: 'load',
    lt: (a, b) => a < b,
    lt2: function (_0x441af0, _0x41ddf0) {
      return _0x441af0 < _0x41ddf0;
    },
    lt3: function (_0x1bbf65, _0x4adf93) {
      return _0x1bbf65 < _0x4adf93;
    },
    lt41: function (_0x1bf264, _0x36c9ec) {
      return _0x1bf264 < _0x36c9ec;
    },
    ltlt: function (_0xdf6bb7, _0x57a1c6) {
      return _0xdf6bb7 < _0x57a1c6;
    },
    mareepPath: '/images/mareep.png',
    minus: function (_0x573c16, _0x227e77) {
      return _0x573c16 - _0x227e77;
    },
    missednames: 'missednames',
    missigno3: '/images/missingno3.png',
    missingEng: 'missing-ENG',
    missingno: 'missingno',
    missingno2: '/images/missingno2.png',
    mod: (a, b) => a % b,
    mod2: function (_0x21b36c, _0x10016c) {
      return _0x21b36c % _0x10016c;
    },
    multiplayerEnabled: 'multiplayerEnabled',
    multiplayerIsMaintenance: 'Multiplayer\x20is\x20undergoing\x20maintenance.\x20Try\x20again\x20later.',
    ne2: function (_0x9784f3, _0x10c4d3) {
      return _0x9784f3 != _0x10c4d3;
    },
    ne3: function (_0x2f0782, _0x2ae039) {
      return _0x2f0782 != _0x2ae039;
    },
    ne30: function (_0x947f3d, _0x4731d3) {
      return _0x947f3d != _0x4731d3;
    },
    ne4: function (_0x689d41, _0x65046) {
      return _0x689d41 !== _0x65046;
    },
    ne43: function (_0x488f14, _0x47584c) {
      return _0x488f14 != _0x47584c;
    },
    ne5: function (_0x4a7edd, _0x37994e) {
      return _0x4a7edd != _0x37994e;
    },
    nene: function (_0x2491f5, _0x2bf1eb) {
      return _0x2491f5 !== _0x2bf1eb;
    },
    nenene: function (_0x339c80, _0x30f276) {
      return _0x339c80 !== _0x30f276;
    },
    nenene3: function (_0x167407, _0x178ce1) {
      return _0x167407 !== _0x178ce1;
    },
    ninetales: 'ninetales',
    none: 'none',
    norainthefuture: 'norainthefuture',
    notEquals: function (a, b) {
      return a !== b;
    },
    notEquals2: (a, b) => a !== b,
    notFound: 'not\x20found',
    noteq: function (_0x28e9e0, _0x4bd263) {
      return _0x28e9e0 !== _0x4bd263;
    },
    orderMode: 'orderMode',
    overlay: 'overlay',
    panel: 'panel',
    partyOn: 'party\x20on',
    pauseOverlay: 'pause-overlay',
    pikipek: 'pikipek',
    pkmncast: 'pkmncast',
    pkmnquizState: 'pkmnquiz_state_',
    plus: function (_0x2ec214, _0x4dea28) {
      return _0x2ec214 + _0x4dea28;
    },
    plus2: function (_0xfac577, _0xb75a3b) {
      return _0xfac577 + _0xb75a3b;
    },
    plus31: function (_0x12342a, _0x3200c8) {
      return _0x12342a + _0x3200c8;
    },
    plus4: function (_0xdfe927, _0x2775e4) {
      return _0xdfe927 + _0x2775e4;
    },
    pokedexOrder: '\x20in\x20Pokédex\x20order!',
    pokemon: 'pokemon',
    prompttimer: 'prompttimer',
    quizmaster: 'quizmaster',
    rank: 'rank',
    ranking: 'ranking',
    ranking2: 'ranking2',
    reset: 'reset',
    reveal: 'reveal',
    rufflet: 'rufflet',
    run3: function (_0x506396, _0xc0ef5f, _0x4267d4, _0x56b5a9) {
      return _0x506396(_0xc0ef5f, _0x4267d4, _0x56b5a9);
    },
    runf: function (_0x39d5e9) {
      return _0x39d5e9();
    },
    runf3: function (_0xf2b6c8, _0x3f9290) {
      return _0xf2b6c8(_0x3f9290);
    },
    scrolldown: 'scrolldown',
    scrollup: 'scrollup',
    shadowHotkeyDisabled: 'Shadow\x20hotkey\x20disabled',
    shadowHotkeyEnabled: 'Shadow\x20hotkey\x20enabled',
    shinyon: 'shinyon',
    similar: function (a, b) {
      return a == b;
    },
    sinistcha: 'sinistcha',
    sinistea: 'sinistea',
    skarmory: 'skarmory',
    smolbutton: 'smolbutton',
    smolbuttondark: 'smolbuttondark',
    smolbuttonx: 'smolbuttonx',
    specialButton: 'specialButton',
    spheal: 'spheal',
    spinner: 'spinner',
    stateChange: 'stateChange',
    sub: (a, b) => a - b,
    sub2: (a, b) => a - b,
    sub23: function (_0x36fe09, _0x2435a2) {
      return _0x36fe09 - _0x2435a2;
    },
    sub3: function (_0x46b8a6, _0x1190b4) {
      return _0x46b8a6 - _0x1190b4;
    },
    svg: '.svg',
    swablu: 'swablu',
    taillow: 'taillow',
    timerScore: 'timer-score',
    tranquill: 'tranquill',
    twitchChannel: 'twitch-channel',
    twitchOff: 'twitch-off',
    twitchon: 'twitch-on',
    typeDisorder: 'typeDisorder',
    typeSeed: 'typeSeed',
    types: 'types',
    typeselection: 'typeselection',
    unfezant: 'unfezant',
    unpause: 'unpause',
    usernameConfirm: 'username-confirm',
    wigglypuff: 'wigglypuff',
    yarnity: 'yarnity',
  };

  let response = null,
    encodedImages = null;

  try {
    const response = await fetchData('config.json?v=2.0');
    const encodedImages = response.encoded_images;

    quiz.loadData(response, enabledLanguages, () => {
      if (socket !== null && isSocketHost) {
        socket.emit();
      }

      timerObj = {
        type: 'none',
      };

      startTimer(timerObj);

      (constants.call6(_0x46dbc4, 0),
        _0x5ab889(quiz.getMaxScore()),
        constants.calll(_0x34a9b2),
        (inputField.disabled = false),
        (recentSprite.src = darkMode ? '/sprites/unknown-2.png' : '/sprites/unknown.png'),
        (document.getElementById('silhouette').checked = false),
        constants.calll(changeFooterPosition),
        constants['similar'](constants.block, document.getElementById(constants.panel).style.display) &&
          document.getElementById('accordion').click(),
        (document.getElementById('missednames').style.display = constants.none),
        (document.getElementById(constants['ranking2']).style.display = constants.none),
        (document.getElementById(constants['ranking']).style.display = 'none'),
        emptyLeaderboard());
    });
  } catch (err) {
    constants['callg'](
      setTimeout,
      () => {
        constants['callg3'](showUserMessage, constants['errorLoadingData']);
      },
      0x1f4,
    );
  }

  function _0x4f10() {
    null !== socket &&
      isSocketHost &&
      socket.emit(constants['stateChange'], {
        flashState: constants.calll(getState),
      });
  }

  function _0x322aa8(_0x4a557d) {
    null !== socket &&
      isSocketHost &&
      socket.emit(constants['stateChange'], {
        typeDisorder: _0x4a557d,
      });
  }

  function _0x1ffa5f(_0x1a6282) {
    constants['nenene3'](null, socket) &&
      isSocketHost &&
      (socket.emit('stateChange', {
        paused: _0x1a6282,
      }),
      _0x339caf());
  }

  function _0x41fe3f(_0x500d42) {
    constants['nenene'](null, socket) &&
      isSocketHost &&
      socket.emit(constants['reveal'], {
        revealSingle: _0x500d42,
      });
  }

  function _0x46d327(_0x2e1745) {
    null !== socket &&
      isSocketHost &&
      socket.emit('message', {
        message: _0x2e1745,
      });
  }

  function _0x339caf() {
    ((timerObj['updatedAt'] = Date['now']()),
      constants['noteq'](null, socket) &&
        isSocketHost &&
        socket.emit('stateChange', {
          timer: timerObj,
        }));
  }

  function _0x33551a(_0x37dd32, _0x285e7a) {
    const _0x35aeb8 = {
      BNEjH: function (_0x2bc551) {
        return constants.calll(_0x2bc551);
      },
      BdMSI: 'Copied\x20link\x20to\x20clipboard\x20(',
      GEvSV: function (_0x12d652) {
        return constants.calll(_0x12d652);
      },
      IMmov: constants['stateChange'],
      JFHbB: function (_0x564d7d) {
        return constants['runf'](_0x564d7d);
      },
      JGYLU: function (_0x33d90c, _0x4ca804) {
        return _0x33d90c(_0x4ca804);
      },
      LXYUg: 'named',
      OMgcY: constants['https'],
      PSXVG: 'noSuchRoom',
      TaZqH: constants['end'],
      UnpZp: constants['join'],
      VgTdr: '\x20joined\x20the\x20room\x20!',
      YIFvx: function (_0x84729, _0x232932) {
        return constants['eq'](_0x84729, _0x232932);
      },
      bOfIq: constants['SsLza'],
      dCweY: constants.block,
      evXwu: 'reset',
      ghASX: 'revealSingle',
      hFtRs: function (_0x4703c4, _0x83aab1) {
        return constants['add30'](_0x4703c4, _0x83aab1);
      },
      hltGz: function (_0x32d048, _0x22778e) {
        return _0x32d048 === _0x22778e;
      },
      iWZpG: 'roomCreated',
    };
    loadSocketIO()
      .then(() => {
        const _0x3c4e91 = {
          FOeSp: function (_0x12eae5) {
            return _0x35aeb8['JFHbB'](_0x12eae5);
          },
          ICAoG: _0x35aeb8['bOfIq'],
          LhmvE: 'giveup',
          SZXOy: function (_0x5225ed, _0x385f02) {
            return _0x5225ed < _0x385f02;
          },
          ThqEq: function (_0x2ff2e9, _0x2ff45f) {
            return _0x2ff2e9 === _0x2ff45f;
          },
          ayqka: function (_0x3f3c65, _0x243339) {
            return _0x35aeb8['JGYLU'](_0x3f3c65, _0x243339);
          },
          fctYY: function (_0x12fc21) {
            return _0x12fc21();
          },
          fzGuU: function (_0x2fff76, _0x5820f7) {
            return _0x2fff76 === _0x5820f7;
          },
          iERiN: _0x35aeb8['ghASX'],
          ncMoB: function (_0x50649d, _0x246400) {
            return _0x50649d in _0x246400;
          },
          tolEj: 'state',
          vtfCk: 'typeDisorder',
          wxbmn: 'timer',
        };
        try {
          ((socket = io(multiplayerUrl, {
            transports: ['polling'],
          })),
            socket['on']('userJoined', (_0x5c9acb) => {
              (soundEnabled && soundEffectJoin.play(), showUserMessage(_0x5c9acb + _0x35aeb8['VgTdr']));
            }),
            socket['on']('userLeft', (_0x39c776) => {
              (soundEnabled && soundEffectExit.play(),
                _0x35aeb8['JGYLU'](showUserMessage, _0x39c776 + '\x20left\x20the\x20room\x20!'));
            }),
            socket['on'](_0x35aeb8['iWZpG'], (_0x19cb56) => {
              const _0x4d9807 = {
                CGOqn: _0x35aeb8['OMgcY'],
                DZlnf: _0x35aeb8['BdMSI'],
                NYcRb: function (_0x483076, _0x3ca3b0) {
                  return _0x483076 + _0x3ca3b0;
                },
                WZGex: function (_0x4c7c87, _0x53248f) {
                  return _0x35aeb8['hFtRs'](_0x4c7c87, _0x53248f);
                },
                oCeQV: function (_0x2e8965, _0x2b3483) {
                  return _0x35aeb8['JGYLU'](_0x2e8965, _0x2b3483);
                },
                yjkxu: _0x35aeb8['UnpZp'],
              };

              function _0x2fe22c() {
                var _0x5e81a3 = new URL(window['location']['href']),
                  _0x27a2e6 = _0x4d9807['WZGex'](
                    _0x5e81a3['hostname'],
                    _0x5e81a3['port'] ? _0x4d9807['WZGex'](':', _0x5e81a3['port']) : '',
                  );
                let _0x10fb31 = _0x4d9807['WZGex'](_0x4d9807['CGOqn'], _0x27a2e6) + _0x4d9807['yjkxu'] + _0x19cb56;
                (_0x27a2e6.includes('localhost') &&
                  (_0x10fb31 = _0x4d9807['WZGex'](
                    _0x4d9807['WZGex'](_0x4d9807['NYcRb']('http://', _0x27a2e6), '/join/'),
                    _0x19cb56,
                  )),
                  navigator['clipboard']['writeText'](_0x10fb31),
                  _0x4d9807['oCeQV'](showUserMessage, _0x4d9807['WZGex'](_0x4d9807['DZlnf'], _0x10fb31) + ')'));
              }

              ((linkGame['onclick'] = function () {
                _0x2fe22c();
              }),
                (linkGame.style.display = _0x35aeb8['dCweY']),
                (hostGame.style.display = 'none'),
                _0x2fe22c());
            }),
            socket['on'](_0x35aeb8['LXYUg'], (_0x199e13) => {
              const { username: _0x5cb705, id: _0xf065cb } = _0x199e13;
              (quiz['addNamed'](_0xf065cb),
                quiz['addUserPoint'](_0x5cb705),
                soundEnabled && soundEffect.play(),
                _0x46dbc4(quiz['getScore']()),
                activeTimer ||
                  (_0x35aeb8['hltGz'](0, _0x15939e) ? _0x35aeb8['GEvSV'](_0x1609e5) : _0x3cf874(_0x15939e)),
                _0x35aeb8['YIFvx'](quiz.getMaxScore(), quiz['getScore']()) && null === roomId && someFunc(),
                _0x35aeb8['GEvSV'](_0x45f4e9),
                _0x35aeb8['GEvSV'](_0x43ad00));
            }),
            socket['on'](_0x35aeb8['PSXVG'], () => {
              noSuchRoom();
            }),
            socket['on'](_0x35aeb8['evXwu'], () => {
              quiz['reset']();
            }),
            socket['on'](_0x35aeb8['TaZqH'], () => {
              _0x35aeb8['GEvSV'](roomClosed);
            }),
            socket['on']('message', (_0x1a79e6) => {
              showUserMessage(_0x1a79e6['message']);
            }),
            socket['on']('scores', (_0x34e0dc) => {
              ((quiz.users = _0x34e0dc), _0x35aeb8['GEvSV'](_0x43ad00), _0x45f4e9());
            }),
            socket['on']('reveal', (_0x44bff4) => {
              if (_0x3c4e91['iERiN'] in _0x44bff4) {
                quiz['revealSingleShadow'](_0x44bff4['revealSingle']);
              } else {
                if (_0x3c4e91['ncMoB']('revealMultiple', _0x44bff4)) {
                  for (
                    let _0x1809d8 = 0;
                    _0x3c4e91['SZXOy'](_0x1809d8, _0x44bff4['revealMultiple'].length);
                    _0x1809d8++
                  )
                    quiz['revealSingleShadow'](_0x44bff4['revealMultiple'][_0x1809d8]);
                }
              }
            }),
            socket['on'](_0x35aeb8['IMmov'], (_0x994ddb) => {
              for (let _0x535520 in _0x994ddb)
                _0x3c4e91['ThqEq'](_0x3c4e91['LhmvE'], _0x535520)
                  ? _0x292768()
                  : _0x3c4e91['ICAoG'] === _0x535520
                    ? _0x994ddb[_0x535520] && quiz['setSilhouettes']()
                    : _0x3c4e91['fzGuU']('showcongrats', _0x535520)
                      ? someFunc()
                      : _0x3c4e91['ThqEq']('paused', _0x535520)
                        ? _0x994ddb['paused']
                          ? _0x1634aa()
                          : _0x3caacb()
                        : _0x3c4e91['tolEj'] === _0x535520
                          ? (_0x173913(_0x994ddb['state']),
                            _0x3c4e91['FOeSp'](_0x45f4e9),
                            _0x3c4e91['fctYY'](_0x43ad00))
                          : _0x3c4e91['wxbmn'] === _0x535520
                            ? _0x3c4e91['ayqka'](startTimer, _0x994ddb['timer'])
                            : _0x3c4e91['ThqEq'](_0x3c4e91['vtfCk'], _0x535520) &&
                              (_0x994ddb['typeDisorder']
                                ? typeDisorderButtonOn.click()
                                : typeDisorderButtonOff.click());
            }),
            _0x35aeb8['JFHbB'](_0x37dd32));
        } catch (_0x3f5073) {
          (_0x35aeb8['BNEjH'](_0x285e7a), console['log'](_0x3f5073));
        }
      })
      ['catch']((_0x1bb2c9) => {
        _0x35aeb8['BNEjH'](_0x285e7a);
      });
  }

  function _0x93513a() {
    const _0x1e765a = {
      KoZpJ: 'input-username',
      UogWe: constants.none,
      XuhVN: function (_0x48ad06) {
        return _0x48ad06();
      },
      lpClo: function (_0x13a832, _0x60b042, _0x3a1fdd) {
        return _0x13a832(_0x60b042, _0x3a1fdd);
      },
    };
    usernamePrompt.style.display = constants.block;
    let _0x2759ec = document.getElementById('input-username'),
      _0x1c3111 = document.getElementById(constants['usernameConfirm']);

    function _0x420f5d(_0x4f9c3d) {
      0xd === _0x4f9c3d['keyCode']
        ? _0x1c3111.click()
        : 0x1b === _0x4f9c3d['keyCode'] && (usernamePrompt.style.display = constants.none);
    }

    ((_0x1c3111['onclick'] = function () {
      const _0x19db26 = {
        EFiCK: _0x1e765a['UogWe'],
        PnYlP: function (_0x25b42c, _0x4dcbbc) {
          return _0x25b42c in _0x4dcbbc;
        },
        bHbah: 'Generating\x20room...',
        wABps: 'host',
        zjaIp: function (_0x551960) {
          return _0x1e765a['XuhVN'](_0x551960);
        },
      };
      let _0x599168 = document.getElementById(_0x1e765a['KoZpJ'])['value'];
      if (_0x599168.length < 0x2) {
        showUserMessage('Username\x20should\x20be\x20at\x20least\x202\x20characters\x20long');
      } else {
        let _0x43dc73 = function () {
          ((isSocketHost = true),
            (usernamePrompt.style.display = _0x19db26['EFiCK']),
            usernamePrompt['removeEventListener']('keyup', _0x420f5d),
            (hostGame.disabled = true),
            (hostGame.innerText = _0x19db26['bHbah']),
            (function (_0x8b6d7d) {
              if (null !== socket) {
                let _0x351780 = {};
                ((_0x351780['username'] = _0x8b6d7d),
                  _0x19db26['PnYlP'](myUsername, quiz.users) &&
                    ((quiz.users[_0x8b6d7d] = quiz.users[myUsername]), delete quiz.users[myUsername]),
                  (myUsername = _0x8b6d7d),
                  (_0x351780['state'] = _0x19db26['zjaIp'](getState)),
                  (_0x351780['state']['timer']['updatedAt'] = Date['now']()),
                  socket.emit(_0x19db26['wABps'], _0x351780));
              }
            })(_0x599168));
        };
        _0x1e765a['lpClo'](_0x33551a, _0x43dc73, function () {
          multiplayerDisabled();
        });
      }
    }),
      _0x2759ec['focus'](),
      usernamePrompt['addEventListener'](constants['keyup'], _0x420f5d),
      (usernamePrompt['onclick'] = function () {
        usernamePrompt.style.display = 'none';
      }),
      (_0x2759ec['onclick'] = function (_0xfc5912) {
        _0xfc5912['stopPropagation']();
      }));
  }

  function _0x90b95e() {
    constants.call6(showUserMessage, constants['multiplayerIsMaintenance']);
  }

  if (constants['Lzipw'](null, roomId)) {
    async function _0x36e491() {
      let _0x399251 = constants['fff'](getMultiplayerServer, constants['ToQQE']),
        _0x4c9a81 = constants['callg'](fetchData, constants['multiplayerEnabled'], false),
        _0x259cf1 = await _0x399251,
        _0x1be6f7 = (await _0x4c9a81)['result'];
      hostGame['onclick'] = _0x259cf1 && _0x1be6f7 ? _0x93513a : _0x90b95e;
    }

    (constants['VmxES'](_0x36e491),
      constants['fcrVe'](
        setInterval,
        () => {
          _0x36e491();
        },
        20000,
      ));
  }
  if (null !== roomId) {
    usernamePrompt.style.display = constants.block;
    let _0x4e1c2a = document.getElementById('input-username'),
      _0x124bae = document.getElementById(constants['usernameConfirm']);

    function _0x46cb76(_0x43096d) {
      constants['eq'](0xd, _0x43096d['keyCode']) && _0x124bae.click();
    }

    ((_0x124bae['onclick'] = function () {
      const _0x373dc9 = {
        VcPal: 'joinRoom',
      };
      let _0x29184d = document.getElementById('input-username')['value'];
      if (_0x29184d.length < 0x2) {
        showUserMessage(constants['HAvSt']);
      } else {
        let _0x277e02 = function () {
          (_0x4e1c2a['removeEventListener']('keyup', _0x46cb76),
            (usernamePrompt.style.display = 'none'),
            off2(),
            (function (_0x561e28) {
              ((myUsername = _0x561e28),
                socket.emit(_0x373dc9['VcPal'], {
                  roomId: roomId,
                  username: _0x561e28,
                }));
            })(_0x29184d));
        };
        _0x33551a(_0x277e02, function () {
          constants['callg3'](showUserMessage, constants['multiplayerIsMaintenance']);
        });
      }
    }),
      constants['WMYbe'](
        setTimeout,
        () => {
          _0x4e1c2a['focus']();
        },
        100,
      ),
      _0x4e1c2a['addEventListener'](constants['keyup'], _0x46cb76));
  }
  let _0x2f9557 = function (_0x96535d) {
    (_0x96535d.classList.add(constants['smolbuttonx']), darkMode && _0x96535d.classList.add(constants['HJKnV']));
    let _0x4c57b5 = quiz['getStyleName']();
    '' !== _0x4c57b5 &&
      (_0x96535d.classList.add(constants['add30']('smolbuttonx', _0x4c57b5)),
      darkMode && _0x96535d.classList.add(constants['HJKnV'] + _0x4c57b5));
  };
  ((darkmodebg = new Image()),
    (darkmodebg.src = constants['backgroundDark']),
    (unknownDark = new Image()),
    (unknownDark.src = '/sprites/unknown-2.png'),
    (missingno = new Image()),
    (missingno.src = '/images/missingno.png'),
    (missingno = new Image()),
    (missingno.src = constants.missingno2),
    (missingno = new Image()),
    (missingno.src = constants['missigno3']));
  let globalElapsed,
    _0x3ef989 = function () {
      let _0x782dc8 = new XMLHttpRequest();
      (_0x782dc8['open'](constants['UzzfA'], constants['artists'], true),
        (_0x782dc8['onreadystatechange'] = function () {
          const _0x5a57f6 = {
            BOGbq: function (_0xc39643, _0x40a384) {
              return constants['lt3'](_0xc39643, _0x40a384);
            },
            PCAoI: function (_0x259e04, _0x2534fe) {
              return constants['lt41'](_0x259e04, _0x2534fe);
            },
            TvmyU: constants['QC'],
            cdTuz: function (_0x4d6e3e, _0x1cb11b) {
              return constants['plus2'](_0x4d6e3e, _0x1cb11b);
            },
            fSQxb: function (_0x2de23a, _0xf62407) {
              return constants['TDdIp'](_0x2de23a, _0xf62407);
            },
            jVJZj: function (_0x199d6d, _0x2c1b0f) {
              return constants['plus4'](_0x199d6d, _0x2c1b0f);
            },
            lIRGL: '<br>',
            rNtRQ: constants['creditstable'],
          };
          constants['similar'](0x4, this['readyState']) &&
            (constants['equals'](0xc8, this['status'])
              ? (function (_0x54e6e1) {
                  table = document.getElementById(_0x5a57f6['rNtRQ']);
                  for (let _0x44d959 = 0; _0x44d959 < _0x54e6e1.length; _0x44d959++) {
                    const _0x960127 = _0x54e6e1[_0x44d959],
                      _0x2ddba9 = _0x960127['sprites'],
                      _0x5ec642 = _0x960127['artists'],
                      _0x226f7c = _0x960127['QCs'];
                    let _0x44c43c = '';
                    for (let _0x59a63e = 0; _0x5a57f6['PCAoI'](_0x59a63e, _0x2ddba9.length); _0x59a63e++)
                      _0x44c43c += _0x5a57f6['cdTuz'](_0x2ddba9[_0x59a63e], _0x5a57f6['lIRGL']);
                    let _0x9b0756 = '';
                    for (let _0x484ac1 = 0; _0x5a57f6['BOGbq'](_0x484ac1, _0x5ec642.length); _0x484ac1++)
                      _0x9b0756 += _0x5a57f6['jVJZj'](_0x5ec642[_0x484ac1], ',\x20');
                    if (
                      ((_0x9b0756 = _0x9b0756['substring'](0, _0x5a57f6['fSQxb'](_0x9b0756.length, 0x2))),
                      _0x226f7c.length > 0)
                    ) {
                      _0x5ec642.length > 0 ? (_0x9b0756 += '<br>QC\x20-\x20') : (_0x9b0756 += _0x5a57f6['TvmyU']);
                      for (let _0x506918 = 0; _0x5a57f6['PCAoI'](_0x506918, _0x226f7c.length); _0x506918++)
                        _0x9b0756 += _0x5a57f6['cdTuz'](_0x226f7c[_0x506918], ',\x20');
                      _0x9b0756 = _0x9b0756['substring'](0, _0x9b0756.length - 0x2);
                    }
                    const _0x54994d = '<tr><td>' + _0x44c43c + '</td><td>' + _0x9b0756 + '</td></tr>';
                    table.innerHTML += _0x54994d;
                  }
                })(JSON['parse'](this['response']))
              : (console['log']('error\x20loading\x20arists,\x20retrying...'),
                constants['callg'](
                  setTimeout,
                  function () {
                    _0x3ef989();
                  },
                  0x7d0,
                )));
        }),
        _0x782dc8['send']());
    },
    _0x45c9c9 = function () {
      const _0x5993d7 = {
        cePDJ: function (_0x11b56a, _0x5814cb) {
          return _0x11b56a == _0x5814cb;
        },
        eKgTi: 'error\x20loading\x20donors,\x20retrying...',
        gmCVV: function (_0x5d7bb5, _0x27a529) {
          return constants['KXNkQ'](_0x5d7bb5, _0x27a529);
        },
      };
      let _0x50bca1 = new XMLHttpRequest();
      (_0x50bca1['open'](constants['UzzfA'], constants['donors'], true),
        (_0x50bca1['onreadystatechange'] = function () {
          var _0x3c3faa, _0x4fa89c;
          _0x5993d7['cePDJ'](0x4, this['readyState']) &&
            (_0x5993d7['gmCVV'](0xc8, this['status'])
              ? ((_0x3c3faa = JSON['parse'](this['response'])),
                (_0x4fa89c = document.getElementById('donors').getElementsByTagName('ol')[0]),
                _0x3c3faa['forEach'](function (_0x5683ac) {
                  var _0x5e4249 = document.createElement('li');
                  (_0x5e4249.appendChild(document['createTextNode'](_0x5683ac)), _0x4fa89c.appendChild(_0x5e4249));
                }))
              : (console['log'](_0x5993d7['eKgTi']),
                setTimeout(function () {
                  _0x45c9c9();
                }, 0x7d0)));
        }),
        _0x50bca1['send']());
    };

  function _0x46dbc4(fallback) {
    try {
      _0x101adf();
    } catch (e) {}
    counterText.innerHTML = fallback;
  }

  function _0x5ab889(_0x153855) {
    totalText.innerHTML = _0x153855;
  }

  function _0x1609e5() {
    (Date['now'](),
      ((timerObj = {
        t: 0,
        type: 'timer',
      }),
      _0x339caf(),
      startTimer(timerObj)));
  }

  function setElapsed(elapsed) {
    if (elapsed < 0) {
      elapsed = 0;
    }
    globalElapsed = elapsed;
    timerText.innerHTML = formatElapsed(elapsed);
  }

  function _0x34a9b2() {
    (delete timerObj['savedAt'],
      constants['f6'](setElapsed, constants['equals'](0, _0x15939e) ? 0 : 0xea60 * _0x15939e));
  }

  function formatElapsed(elapsed) {
    let _0x7faa04 = constants['mod'](
        (elapsed = constants['div'](constants['minus'](elapsed, constants['mod2'](elapsed, 1000)), 1000)),
        0x3c,
      ),
      _0x4af790 = constants['mod']((elapsed = constants['div2'](constants['LCDxb'](elapsed, _0x7faa04), 0x3c)), 0x3c),
      _0x38dea8 = constants['TwgqC'](constants['LCDxb'](elapsed, _0x4af790), 0x3c);
    return (
      constants['lt41'](_0x38dea8, 0xa) && (_0x38dea8 = constants['plus4']('0', _0x38dea8)),
      _0x4af790 < 0xa && (_0x4af790 = constants['plus2']('0', _0x4af790)),
      constants.lt(_0x7faa04, 0xa) && (_0x7faa04 = constants['add30']('0', _0x7faa04)),
      constants['plus2'](_0x38dea8, ':') + _0x4af790 + ':' + _0x7faa04
    );
  }

  let _0x15939e = 0;

  function _0x4dcdfc(_0x2a4e49) {
    ((_0x15939e = _0x2a4e49), quiz['reset'](), constants['exec4'](_0x34a9b2));
    let _0x5c669b = timerText.innerHTML;
    timerText.innerHTML != _0x5c669b &&
      (constants['KXNkQ']('00:00:00', timerText.innerHTML)
        ? constants['call4'](showUserMessage, 'Timer\x20set\x20to\x20stopwatch')
        : constants['call4'](showUserMessage, 'Timer\x20set\x20to\x20' + timerText.innerHTML));
  }

  function _0x4a696a() {
    document.getElementById(constants['prompttimer']).style.display = constants.none;
  }

  let _0x1d011c = function (_0x1044ec) {
    const _0x7ee5e6 = {
      MCGDn: 'prompttimer',
      zgjhW: constants.none,
    };
    activeTimer
      ? ((document.getElementById(constants['prompttimer']).style.display = constants.block),
        (document.getElementById('timer-yes')['onclick'] = function () {
          ((document.getElementById(_0x7ee5e6['MCGDn']).style.display = _0x7ee5e6['zgjhW']), _0x4dcdfc(_0x1044ec));
        }),
        (document.getElementById('timer-no')['onclick'] = _0x4a696a))
      : constants['GYoHP'](_0x4dcdfc, _0x1044ec);
  };
  ((timerBtn['onclick'] = function () {
    (_0x2f9557(timerBtn), constants['f6'](_0x57dd20, stopwatchBtn));
    let _0x59c01f = Math['abs'](document.getElementById('timer-min')['value']);
    _0x1d011c(_0x59c01f);
  }),
    (stopwatchBtn['onclick'] = function () {
      (_0x2f9557(stopwatchBtn), _0x57dd20(timerBtn), _0x1d011c(0));
    }),
    _0x3ef989(),
    constants['exec2'](_0x45c9c9));
  let _0x57dd20 = function (_0x420198) {
      (_0x420198.classList.remove(constants['smolbuttonx']), _0x420198.classList.remove('smolbuttonxdark'));
      let _0xe3fad5 = quiz['getStyleName']();
      constants['nenene']('', _0xe3fad5) &&
        (constants['dark'] == _0xe3fad5 && (_0xe3fad5 = 'evil'),
        _0x420198.classList.remove('smolbuttonx' + _0xe3fad5),
        _0x420198.classList.remove(constants['FBbYa']('smolbuttonxdark', _0xe3fad5)));
    },
    _0x185180 = function () {
      (constants['ft'](_0x5ab889, quiz.getMaxScore()),
        constants['GYoHP'](_0x46dbc4, quiz['getScore']()),
        constants['exec2'](_0x4f10),
        changeFooterPosition());
    };
  for (let _0x55b3f7 in genQuizBoxes)
    document.getElementById(constants['gen'] + _0x55b3f7)['onclick'] = function () {
      const _0xef4229 = {
        hxtaf: constants.none,
        onOdF: function (_0x410ed7) {
          return _0x410ed7();
        },
      };
      let _0x1137ed = function () {
        var _0xc8494f;
        ((document.getElementById(constants['genselection'])['onclick'] = off2),
          (document.getElementById('typeselection')['onclick'] = off2),
          (promptGen.style.display = constants.none),
          (_0xc8494f = _0x55b3f7),
          quiz['setGenQuiz'](_0xc8494f),
          constants['callf3'](_0x185180));
      };
      ((promptGenYes['onclick'] = function () {
        (_0xef4229['onOdF'](_0x1137ed), off2());
      }),
        (promptGenNo['onclick'] = function () {
          promptGen.style.display = _0xef4229['hxtaf'];
        }),
        0 !== quiz['getScore']() ? (promptGen.style.display = 'inline') : (_0x1137ed(), off2()));
    };
  document.getElementById(constants['specialButton'])['onclick'] = function () {
    const _0x3d8e34 = {
      FWabX: function (_0x2cef67) {
        return constants['exec2'](_0x2cef67);
      },
      RLjxd: constants['genselection'],
      SIBpr: 'special',
    };
    let _0x58261e = function () {
      ((document.getElementById(_0x3d8e34['RLjxd'])['onclick'] = off2),
        (document.getElementById('typeselection')['onclick'] = off2),
        (promptGen.style.display = 'none'),
        quiz['setQuiz'](_0x3d8e34['SIBpr'], {
          legendary: true,
        }),
        _0x3d8e34['FWabX'](_0x185180));
    };
    ((promptGenYes['onclick'] = function () {
      (_0x58261e(), constants['callf'](off2));
    }),
      (promptGenNo['onclick'] = function () {
        promptGen.style.display = 'none';
      }),
      0 !== quiz['getScore']() ? (promptGen.style.display = 'inline') : (constants['calll3'](_0x58261e), off2()));
  };
  let _0x2a95c1 = [];
  for (let _0x310f4d = 0; constants['lt41'](_0x310f4d, allLanguages.length); _0x310f4d++) {
    let _0x4fc0d0 = allLanguages[_0x310f4d],
      _0x53a6b7 = document.createElement('div');
    ((_0x53a6b7.innerHTML += _0x4fc0d0),
      _0x53a6b7.classList.add(constants['smolbutton']),
      _0x53a6b7.classList.add('langbutton'),
      (_0x53a6b7.id = constants['add7']('missing-', _0x4fc0d0)),
      (_0x53a6b7['onclick'] = function () {
        let _0x32e152 = quiz['getStyleName']();
        for (let _0x19ce55 = 0; _0x19ce55 < _0x2a95c1.length; _0x19ce55++)
          (constants['ne5'](_0x2a95c1[_0x19ce55], _0x53a6b7) &&
            (_0x2a95c1[_0x19ce55].classList.remove('smolbuttonSwap'),
            _0x2a95c1[_0x19ce55].classList.remove('smolbuttonSwap' + _0x32e152),
            _0x2a95c1[_0x19ce55].classList.add(constants['smolbutton']),
            _0x2a95c1[_0x19ce55].classList.add(constants['add30']('smolbutton', _0x32e152)),
            darkMode &&
              (_0x2a95c1[_0x19ce55].classList.add(constants['smolbuttondark']),
              _0x2a95c1[_0x19ce55].classList.add(constants['FBbYa'](constants['smolbuttondark'], _0x32e152)))),
            _0x53a6b7.classList.remove(constants['smolbutton']),
            _0x53a6b7.classList.remove(constants['smolbutton'] + _0x32e152),
            _0x53a6b7.classList.remove(constants['smolbuttondark']),
            _0x53a6b7.classList.remove(constants['FBbYa'](constants['smolbuttondark'], _0x32e152)),
            _0x53a6b7.classList.add('smolbuttonSwap'),
            _0x53a6b7.classList.add('smolbuttonSwap' + _0x32e152));
        quiz['setLanguage'](_0x4fc0d0);
      }),
      missingOptionsDiv.appendChild(_0x53a6b7),
      _0x2a95c1.push(_0x53a6b7));
  }

  function _0x3cf874(_0x33cd2e) {
    let _0x1c83f7 = constants['PoGPv'](constants['WIJsr'](0x3c, _0x33cd2e), 1000) + Date['now']();
    (Date['now'](),
      ((timerObj = {
        t: _0x1c83f7,
        type: 'countdown',
      }),
      startTimer(timerObj),
      constants.calll(_0x339caf)));
  }

  function _0x46eda6(_0x2c887b, _0x3e6aa9) {
    const consts = {
      named: 'named',
    };
    let _0x40b817 = null;

    (isSocketHost || constants['notEquals'](null, roomId)) &&
      (_0x40b817 = (_0x13f661) => {
        var _0x2457e8;
        ((_0x2457e8 = _0x13f661),
          socket.emit(consts['named'], {
            id: _0x2457e8,
          }));
      });
    let _0xc688a8 = quiz['parseInput'](_0x2c887b, _0x3e6aa9, _0x40b817),
      _0x2ee05c = _0xc688a8[0],
      _0x49f54c = _0xc688a8[1];
    return (
      _0x2ee05c &&
        (soundEnabled && soundEffect.play(),
        _0x46dbc4(quiz['getScore']()),
        activeTimer || (constants['eqeqeq3'](0, _0x15939e) ? _0x1609e5() : constants['EkIcu'](_0x3cf874, _0x15939e)),
        quiz.getMaxScore() === quiz['getScore']() && null === roomId && someFunc(),
        (isSocketHost || constants['LImBr'](null, roomId) || isTwitchOn) && (_0x45f4e9(), _0x43ad00())),
      [_0x2ee05c, _0x49f54c]
    );
  }

  function someFunc() {
    (constants['nenene3'](null, socket) &&
      isSocketHost &&
      socket.emit('stateChange', {
        showcongrats: true,
      }),
      (inputField.disabled = true),
      _0x43ad00(),
      constants.call6(clearInterval, activeTimer),
      (timerObj = {
        type: 'none',
      }),
      (document.getElementById(constants['overlay']).style.display = constants.block),
      soundEnabled && soundEffect2.play());
    let _0x26c108 = '',
      _0x337ba5 = '';
    (constants['Lzipw'](0, _0x15939e)
      ? ((_0x26c108 = timerText.innerHTML), (_0x337ba5 = constants['every']))
      : ((_0x26c108 =
          0 === globalElapsed
            ? constants['add4'](_0x15939e, '\x20minutes')
            : constants['fff7'](formatElapsed, constants['PoGPv'](0x3c, _0x15939e) * 1000 - globalElapsed)),
        (_0x337ba5 = constants['plus2']('\x20', quiz['getScore']()) + '\x20')),
      (document.getElementById(constants['genname']).innerHTML = quiz['getEndText']()),
      (document.getElementById(constants['timerScore']).innerHTML = _0x26c108),
      (document.getElementById('currentcount').innerHTML = _0x337ba5),
      (document.getElementById('shadow-count').innerHTML = quiz['revealedShadows'].size),
      quiz['orderMode']
        ? (document.getElementById(constants['SWNAr']).innerHTML = constants['pokedexOrder'])
        : quiz['chaosMode']
          ? (document.getElementById(constants['SWNAr']).innerHTML = constants['chaosmode'])
          : (document.getElementById(constants['SWNAr']).innerHTML = '!'),
      quiz['revealedShadows'].size > 0
        ? (document.getElementById('trychallenge').style.display = constants.block)
        : (document.getElementById('trychallenge').style.display = 'none'),
      Object['keys'](quiz.users).length > 1 &&
        (document.getElementById(constants['ranking2']).style.display = constants.block),
      (document.getElementById('ranking').style.display = constants.none),
      quiz['animateCongrats'](),
      quiz['giveUp'](),
      (document.getElementById(constants['missednames']).style.display = constants.block),
      document.getElementById(constants['accordion']).click(),
      (result_data = {
        allShadows: quiz['useSilhouettes'],
        chaosMode: quiz['chaosMode'],
        filters: quiz['filters'],
        giveUpState: quiz['giveUpState'],
        langCounts: quiz['langCounts'],
        named: [...quiz['named']],
        orderMode: quiz['orderMode'],
        revealedShadows: quiz['revealedShadows'],
        timerScore: timerText.innerHTML,
        typeDisorder: quiz['typeDisorder'],
      }),
      postResult(result_data));
  }

  function _0x292768() {
    (null !== socket &&
      isSocketHost &&
      socket.emit('stateChange', {
        giveup: true,
      }),
      _0x43ad00(),
      (inputField.disabled = true),
      constants['HJLRw'](Object['keys'](quiz.users).length, 1) &&
        (document.getElementById(constants['ranking2']).style.display = constants.block),
      (document.getElementById('ranking').style.display = constants.none),
      clearInterval(activeTimer),
      (timerObj = {
        type: 'none',
      }),
      quiz['giveUp'](),
      (document.getElementById('missednames').style.display = 'block'),
      document.getElementById(constants['accordion']).click(),
      (result_data = {
        allShadows: quiz['useSilhouettes'],
        chaosMode: quiz['chaosMode'],
        filters: quiz['filters'],
        giveUpState: quiz['giveUpState'],
        langCounts: quiz['langCounts'],
        named: [...quiz['named']],
        orderMode: quiz['orderMode'],
        revealedShadows: quiz['revealedShadows'],
        timerScore: timerText.innerHTML,
        typeDisorder: quiz['typeDisorder'],
      }),
      constants['RlRVA'](postResult, result_data));
  }

  const nameAll = function () {
    for (let id of quiz.currentIds) {
      _0x46eda6(quiz.pokemonIdDict[id].baseName, myUsername);
    }
  };

  ((inputField['oninput'] = function () {
    if (inputField.value.length === 0) return;

    if (inputField.value[inputField.value.length - 1] === '?') {
      inputField.value = inputField.value.substring(0, inputField.value.length - 1);
      spellCheck();
      return;
    }

    if (constants.none !== quiz.name && ',' === inputField.value[inputField.value.length - 1]) {
      return (
        _0xc027bf ? _0x3806aa() : constants['fff7'](showUserMessage, constants['QQEdY']),
        void (inputField.value = inputField.value['substring'](0, constants['minus'](inputField.value.length, 1)))
      );
    }

    res = constants['callg'](_0x46eda6, inputField.value, myUsername);
    let _0x4346b4 = res[0],
      _0x260dd3 = res[1];
    (constants['PqSrS'](null, _0x260dd3) &&
      _0x260dd3.includes('not\x20the\x20next') &&
      soundEnabled &&
      soundEffectWrongOrder.play(),
      constants['missingno'] === _0x260dd3
        ? (inputField.value = '')
        : _0x4346b4
          ? ((inputField.value = ''), hideHint())
          : _0x4346b4 ||
            constants['KXNkQ'](null, _0x260dd3) ||
            ((inputField.value = ''), hideHint(), constants['f5'](showUserMessage, _0x260dd3)));
  }),
    (giveUpBtn['onclick'] = _0x292768),
    (radioPokeball['onclick'] = function () {
      quiz['usePokeball']();
    }),
    (radioSilhouette['onclick'] = function () {
      constants['TTIup'](true, quiz['isSilhouettesEnabled']()) && (promptSilh.style.display = 'inline');
    }),
    (promptSilhYes['onclick'] = function () {
      (quiz['setSilhouettes'](),
        null !== socket &&
          isSocketHost &&
          socket.emit(constants['stateChange'], {
            silhouettes: true,
          }),
        (promptSilh.style.display = 'none'),
        (radioSilhouette.checked = true));
    }),
    (promptSilhNo['onclick'] = function () {
      ((promptSilh.style.display = 'none'), (radioSilhouette.checked = false));
    }),
    (orderButton['onclick'] = function () {
      quiz['orderMode'] ||
        (constants['types'] in quiz['filters'] || constants['legendary'] in quiz['filters']
          ? showUserMessage(constants['UJqTj'])
          : (promptOrderEnable.style.display = constants['TjiLp']));
    }),
    (regularButton['onclick'] = function () {
      (quiz['orderMode'] || quiz['chaosMode']) && (promptOrderDisable.style.display = constants['TjiLp']);
    }),
    (chaosButton['onclick'] = function () {
      quiz['chaosMode'] || (promptChaosEnable.style.display = 'inline');
    }),
    (typeDisorderButtonOn['onclick'] = function () {
      quiz['typeDisorder'] ||
        (constants['inin'](constants['types'], quiz['filters'])
          ? showUserMessage('Type\x20shuffle\x20mode\x20does\x20not\x20work\x20with\x20type\x20quizzes')
          : quiz['orderMode']
            ? showUserMessage('Type\x20shuffle\x20mode\x20does\x20not\x20work\x20with\x20dex\x20order\x20mode')
            : (_0x2f9557(typeDisorderButtonOn),
              _0x57dd20(typeDisorderButtonOff),
              quiz['setTypeMode'](true),
              constants['RlRVA'](_0x322aa8, true),
              constants['EkIcu'](showUserMessage, 'Enabled\x20type\x20shuffle\x20mode.')));
    }),
    (typeDisorderButtonOff['onclick'] = function () {
      quiz['typeDisorder'] &&
        (constants['RlRVA'](_0x57dd20, typeDisorderButtonOn),
        constants['callg3'](_0x2f9557, typeDisorderButtonOff),
        quiz['setTypeMode'](false),
        _0x322aa8(false),
        constants['f6'](showUserMessage, constants['disabledShuffle']));
    }),
    (promptOrderEnableYes['onclick'] = function () {
      (constants['call8'](_0x57dd20, regularButton),
        constants['call0'](_0x57dd20, chaosButton),
        constants['runf3'](_0x2f9557, orderButton),
        typeDisorderButtonOff.click(),
        quiz['setOrderMode'](true),
        constants.calll(_0x185180),
        (promptOrderEnable.style.display = 'none'));
    }),
    (promptOrderEnableNo['onclick'] = function () {
      promptOrderEnable.style.display = constants.none;
    }),
    (promptOrderDisableYes['onclick'] = function () {
      (constants['HhOuq'](_0x57dd20, orderButton),
        constants['f6'](_0x57dd20, chaosButton),
        constants['fg'](_0x2f9557, regularButton),
        quiz['setOrderMode'](false),
        constants.calll(_0x185180),
        (promptOrderDisable.style.display = 'none'));
    }),
    (promptOrderDisableNo['onclick'] = function () {
      promptOrderDisable.style.display = constants.none;
    }),
    (promptChaosEnableYes['onclick'] = function () {
      (_0x57dd20(regularButton),
        constants['callgg'](_0x2f9557, chaosButton),
        _0x57dd20(orderButton),
        quiz['setChaosMode'](true),
        constants['calll3'](_0x185180),
        (promptChaosEnable.style.display = constants.none));
    }),
    (promptChaosEnableNo['onclick'] = function () {
      promptChaosEnable.style.display = 'none';
    }));
  let _0xc027bf = false,
    _0x3806aa = function () {
      if (
        constants['noteq']('none', quiz.name) &&
        !quiz['paused'] &&
        quiz.getMaxScore() !== quiz['getScore']() &&
        (null === socket || isSocketHost)
      ) {
        if (quiz['orderMode']) {
          let _0x3231bd = quiz['revealNextShadow']();
          null !== _0x3231bd && _0x41fe3f(_0x3231bd);
        } else {
          if (quiz['typeDisorder']) {
            let _0x2ed1c2 = quiz['revealRandomTypeShadow']();
            null !== _0x2ed1c2 && _0x41fe3f(_0x2ed1c2);
          } else {
            let _0x39a83e = quiz['revealRandomShadow']();
            constants['notEquals2'](null, _0x39a83e) && constants['callf4'](_0x41fe3f, _0x39a83e);
          }
        }
      }
    };

  function _0x101adf() {
    const _0x18c009 = {
      BFCih: function (_0x236ad0) {
        return constants.call2(_0x236ad0);
      },
      RCtvw: function (_0x547b66, _0x362d96) {
        return constants['callf5'](_0x547b66, _0x362d96);
      },
    };
    constants['nene'](null, shadowHelpInterval) &&
      (clearTimeout(shadowHelpInterval),
      constants['callg3'](clearTimeout, shadowHelpIntervalMessage),
      (shadowHelpIntervalMessage = constants['callg'](
        setTimeout,
        () => {
          !quiz['paused'] &&
            quiz.getMaxScore() !== quiz['getScore']() &&
            quiz['getScore']() > 0 &&
            !quiz['isAllShadowsRevealed']() &&
            !quiz['giveUpState'] &&
            (_0x46d327(constants['KDxwc']), showUserMessage('Revealing\x20a\x20shadow\x20in\x203\x20seconds\x20...'));
        },
        17000,
      )),
      (shadowHelpInterval = constants['callg'](
        setTimeout,
        () => {
          (!quiz['paused'] &&
            _0x18c009['RCtvw'](quiz.getMaxScore(), quiz['getScore']()) &&
            quiz['getScore']() > 0 &&
            !quiz['isAllShadowsRevealed']() &&
            !quiz['giveUpState'] &&
            _0x18c009['BFCih'](_0x3806aa),
            _0x101adf());
        },
        20000,
      )));
  }

  ((shadowNextBtn['onclick'] = function () {
    _0xc027bf
      ? ((_0xc027bf = false),
        _0x57dd20(shadowNextBtn),
        constants['call54'](showUserMessage, constants['shadowHotkeyDisabled']))
      : ((_0xc027bf = true),
        _0x2f9557(shadowNextBtn),
        constants['callg4'](showUserMessage, constants['shadowHotkeyEnabled']));
  }),
    (shadowHelpRadio['onclick'] = function () {
      const _0x2372e4 = {
        iqZdJ: function (_0x2bc609) {
          return _0x2bc609();
        },
        iyxpc: function (_0x3f7718, _0x532724) {
          return constants['gt33'](_0x3f7718, _0x532724);
        },
      };
      constants['callf5'](null, shadowHelpInterval)
        ? (_0x57dd20(shadowHelpRadio),
          clearTimeout(shadowHelpInterval),
          clearTimeout(shadowHelpIntervalMessage),
          constants.call(showUserMessage, 'Disabled\x20auto-reveal\x20of\x20shadows'),
          (shadowHelpInterval = null))
        : (constants['HhOuq'](_0x2f9557, shadowHelpRadio),
          quiz['orderMode']
            ? constants['KzMpF'](showUserMessage, constants['activatedAutoReveal'])
            : constants['runf3'](
                showUserMessage,
                'Activated\x20auto-reveal\x20of\x20random\x20shadow\x20every\x2020\x20seconds',
              ),
          (shadowHelpIntervalMessage = setTimeout(() => {
            !quiz['paused'] &&
              quiz.getMaxScore() !== quiz['getScore']() &&
              quiz['getScore']() > 0 &&
              !quiz['isAllShadowsRevealed']() &&
              !quiz['giveUpState'] &&
              (constants['f6'](_0x46d327, constants['KDxwc']), constants['GBQPa'](showUserMessage, constants['KDxwc']));
          }, 17000)),
          (shadowHelpInterval = constants['callt'](
            setTimeout,
            () => {
              (!quiz['paused'] &&
                quiz.getMaxScore() !== quiz['getScore']() &&
                _0x2372e4['iyxpc'](quiz['getScore'](), 0) &&
                !quiz['isAllShadowsRevealed']() &&
                !quiz['giveUpState'] &&
                _0x2372e4['iqZdJ'](_0x3806aa),
                _0x101adf());
            },
            20000,
          )));
    }));
  let misspellings = response.misspellings,
    mispellingDict = {};

  for (let mispell in misspellings) {
    for (let i = 0; i < misspellings[mispell].length; i++) {
      mispellingDict[misspellings[mispell][i]] = mispell;
    }
  }

  function spellCheck() {
    if (!isSpellingEnabled) {
      return;
    }

    inputField.focus();
    spellingCheck.style.display = 'none';
    spellingHint.style.display = 'inline-block';

    let text = (function (name) {
      let distances = (function (name) {
        if (name.length >= 3) {
          let result = {};
          let standardName = standardizeName(name);

          for (const n of quiz.nameArr) {
            result[n] = Levenshtein(standardizeName(n), standardName);
          }

          sortedVals = sortDictionaryByValue(result);
          return sortedVals.reverse();
        }
      })(name);

      if (distances.length > 0) {
        let distance = distances[0],
          word = distance[0],
          dist = distance[1];

        if (name in mispellingDict) {
          return mispellingDict[name];
        }
        if (dist === 1) {
          return word;
        }
        if (name.length === 5 && dist <= 2) {
          return word;
        }
        if (name.length === 6 && dist <= 2) {
          return word;
        }
        if (name.length === 7 && dist <= 3) {
          return word;
        }
        if (name.length >= 8 && dist <= 4) {
          return word;
        }
      }
      return 'not found';
    })(standardizeName(inputField.value));

    spellingHint.innerHTML = text;
    if (inputField.value.length > 0) {
      return inputField.value;
    }
  }

  document.getElementById('hintplace')['onclick'] = spellCheck;
  let _0x43ad00 = function () {
    let _0x2833ef = document.getElementById(constants['leaderboard2']);
    for (; _0x2833ef['firstChild'];) _0x2833ef['firstChild']['remove']();
    if (constants['gt35'](Object['keys'](quiz.users).length, 1)) {
      let _0x4a90c3 = constants['callg4'](sortDictionaryByValue, quiz.users),
        _0x3a3d36 = quiz['getStyleName']();
      for (let _0x23ab74 = 0; _0x23ab74 < _0x4a90c3.length; _0x23ab74++) {
        let _0x50c082 = document.createElement('div'),
          _0x3d1333 = document.createElement(constants['divdiv']),
          _0x25b8c4 = document.createElement('div'),
          _0x112443 = document.createElement(constants['divdiv']),
          _0x115f97 = document.createElement('img');
        (_0x115f97.classList.add('spriteb'),
          (_0x115f97.src = '/sprites/unknown-1.png'),
          _0x50c082.classList.add(constants['board']),
          _0x3d1333.classList.add('place', constants['inlinebox'], 'inlinebox' + _0x3a3d36),
          _0x25b8c4.classList.add('twitchname', 'inlinebox', 'inlinebox' + _0x3a3d36),
          _0x112443.classList.add('number', 'inlinebox', constants['inlinebox'] + _0x3a3d36),
          darkMode &&
            (_0x3d1333.classList.add(constants['GLavs']),
            _0x3d1333.classList.add(constants['plus']('inlineboxdark', _0x3a3d36)),
            _0x25b8c4.classList.add(constants['GLavs']),
            _0x25b8c4.classList.add(constants['add30']('inlineboxdark', _0x3a3d36)),
            _0x112443.classList.add('inlineboxdark'),
            _0x112443.classList.add('inlineboxdark' + _0x3a3d36)));
        let _0x4e1e4a = document['createTextNode']('#' + constants['IGEEC'](_0x23ab74, 1));
        _0x3d1333.appendChild(_0x4e1e4a);
        let _0x59dcb6 = document['createTextNode'](_0x4a90c3[_0x23ab74][0]);
        (constants['eq5'](_0x4a90c3[_0x23ab74][0], myUsername) && _0x25b8c4.classList.add(constants['quizmaster']),
          _0x25b8c4.appendChild(_0x59dcb6));
        let _0x407392 = document['createTextNode']('\x20' + _0x4a90c3[_0x23ab74][1]);
        (_0x112443['append'](_0x115f97, _0x407392),
          _0x50c082['append'](_0x3d1333, _0x25b8c4, _0x112443),
          _0x2833ef['append'](_0x50c082));
      }
      changeFooterPosition();
    }
  };
  document.getElementById('accordion2')['onclick'] = function () {
    ('block' == document.getElementById(constants['leaderboard2']).style.display
      ? ((document.getElementById('leaderboard2').style.display = constants.none),
        document.getElementById(constants['arrow2']).classList.add(constants['adown']),
        document.getElementById(constants['arrow2']).classList.remove(constants['aup']))
      : ((document.getElementById(constants['leaderboard2']).style.display = 'block'),
        document.getElementById('arrow2').classList.add(constants['aup']),
        document.getElementById(constants['arrow2']).classList.remove('adown'),
        _0x43ad00()),
      constants['callf2'](changeFooterPosition));
  };
  for (let _0x216774 = 0; constants['ltlt'](_0x216774, typeList.length); _0x216774++) {
    let _0x13aa2e = _0x216774;
    document.getElementById('b-' + typeList[_0x216774])['onclick'] = function () {
      const _0x114f6c = {
        EamlX: function (_0x333cdd) {
          return _0x333cdd();
        },
        YbXhu: constants['typeselection'],
      };
      let _0x5b4a5c = function () {
        var _0x513538;
        ((document.getElementById(_0x114f6c['YbXhu'])['onclick'] = off2),
          (document.getElementById('genselection')['onclick'] = off2),
          (promptGen.style.display = 'none'),
          quiz['reset'](),
          (_0x513538 = typeList[_0x13aa2e]),
          typeDisorderButtonOff.click(),
          quiz['setTypeQuiz'](_0x513538),
          _0x185180());
      };
      ((promptGenYes['onclick'] = function () {
        (_0x114f6c['EamlX'](_0x5b4a5c), off2());
      }),
        (promptGenNo['onclick'] = function () {
          promptGen.style.display = constants.none;
        }),
        0 !== quiz['getScore']() ? (promptGen.style.display = constants['TjiLp']) : (_0x5b4a5c(), off2()));
    };
  }
  let _0x103bde = null;
  document.getElementById('accordion2').click();
  let _0x535161 = [
      [encodedImages.sprite['bulbasaur'], encodedImages.sprite['charmander'], encodedImages.sprite['squirtle']],
      [encodedImages.sprite['cyndaquil'], encodedImages.sprite['totodile'], encodedImages.sprite['chikorita']],
      [encodedImages.sprite['mudkip'], encodedImages.sprite['treecko'], encodedImages.sprite['torchic']],
      [encodedImages.sprite['turtwig'], encodedImages.sprite['chimchar'], encodedImages.sprite['piplup']],
      [encodedImages.sprite['tepig'], encodedImages.sprite['oshawott'], encodedImages.sprite['snivy']],
      [encodedImages.sprite['froakie'], encodedImages.sprite['chespin'], encodedImages.sprite['fennekin']],
      [encodedImages.sprite['rowlet'], encodedImages.sprite['litten'], encodedImages.sprite['popplio']],
      [encodedImages.sprite['scorbunny'], encodedImages.sprite['sobble'], encodedImages.sprite['grookey']],
      [encodedImages.sprite['quaxly'], encodedImages.sprite['sprigatito'], encodedImages.sprite['fuecoco']],
    ],
    _0x5bd580 = 0,
    _0x193402 = true,
    _0x14d036 = response['sprite_cycles'],
    _0xec1497 = document.getElementById('type0')['classList'].length,
    _0x12e639 = function () {
      const _0x42f94c = {
        GQOHK: function (_0x693401, _0x437361, _0x10874c) {
          return _0x693401(_0x437361, _0x10874c);
        },
        GvJIT: constants['VrsqJ'],
        NHGKr: function (_0xedebec, _0x2f71a8) {
          return _0xedebec % _0x2f71a8;
        },
        TinGP: function (_0x3d576e, _0x4a00fe) {
          return constants['f5'](_0x3d576e, _0x4a00fe);
        },
      };
      for (let _0x398e08 = 0; constants['ltlt'](_0x398e08, _0x535161.length); _0x398e08++) {
        document.getElementById(
          constants['plus31'](constants.add('gen', [constants['IGEEC'](_0x398e08, 1)]), constants['img']),
        ).src = _0x535161[_0x398e08][constants['GlnwJ'](_0x5bd580, _0x535161[0].length)];
      }
      (!(function (_0xadd48e) {
        let _0x305c92 = document.getElementById('type-img'),
          _0x10c719 = document.getElementById('type0'),
          _0x268ffe = constants['mod2'](_0xadd48e, typeList.length);
        _0x268ffe = _0x193402 ? _0x268ffe : 0;
        let _0x2a553c = typeList[_0x268ffe];
        (constants['eqeqeq3']('dark', _0x2a553c) && (_0x2a553c = constants.evil),
          (_0x305c92.src = constants['plus'](
            constants['RItDx'](constants['HHRag'], typeList[_0x268ffe].toUpperCase()),
            constants.svg,
          )),
          _0x10c719['classList'].length !== _0xec1497 &&
            _0x10c719.classList.remove(_0x10c719['classList'][_0x10c719['classList'].length - 1]),
          _0x10c719.classList.add(constants['add2'](constants.button, _0x2a553c)));
      })(_0x5bd580),
        (function (_0x446286) {
          const _0x1afb49 = {
            HXAxL: function (_0x55030a, _0x13be00) {
              return _0x55030a(_0x13be00);
            },
            IqSYq: function (_0x14deb3, _0x11b56e) {
              return _0x14deb3 in _0x11b56e;
            },
            cqpgA: function (_0x5590ee, _0x453453) {
              return _0x42f94c['NHGKr'](_0x5590ee, _0x453453);
            },
            hwgYR: function (_0x283306, _0x462e2e) {
              return _0x42f94c['TinGP'](_0x283306, _0x462e2e);
            },
            sYimT: _0x42f94c['GvJIT'],
          };
          let _0x13e6ef = (_0x9eb8f2, _0x3e07cb) => {
            let _0x25374d,
              _0x2c5d0e = _0x1afb49['HXAxL'](standardizeName, _0x9eb8f2);
            _0x25374d = quiz.shinyEnabled ? 'shiny' : 'sprite';
            let _0x5e4fc8 = _0x1afb49['cqpgA'](_0x446286, _0x3e07cb[_0x9eb8f2].length);
            _0x5e4fc8 = _0x193402 ? _0x5e4fc8 : 0;
            let _0x1d1f48 = _0x1afb49['hwgYR'](standardizeName, _0x3e07cb[_0x9eb8f2][_0x5e4fc8]);
            ((quiz.spriteDictionary[standardizeName(_0x2c5d0e)].src = encodedImages[_0x25374d][_0x1d1f48]),
              _0x1afb49['IqSYq'](_0x1d1f48, encodedImages[_0x25374d])
                ? ((quiz.unguessedDict[standardizeName(_0x2c5d0e)].getElementsByTagName('img')[0].src =
                    encodedImages[_0x25374d][_0x1d1f48]),
                  _0x1afb49['IqSYq'](_0x1d1f48, quiz.pokemonIdDict)
                    ? (quiz.unguessedDictTexts[standardizeName(_0x2c5d0e)]['nodeValue'] = quiz.pokemonIdDict[
                        standardizeName(_0x3e07cb[_0x9eb8f2][_0x5e4fc8])
                      ]['getFormattedName'](quiz.currentLang))
                    : (quiz.unguessedDictTexts[_0x1afb49['hwgYR'](standardizeName, _0x2c5d0e)]['nodeValue'] = quiz[
                        'pokemonIdDict'
                      ][standardizeName(_0x9eb8f2)]['getFormattedName'](quiz.currentLang)))
                : console['log'](_0x1d1f48, _0x1afb49['sYimT']));
          };
          for (let _0xad9623 in _0x14d036) _0x42f94c['GQOHK'](_0x13e6ef, _0xad9623, _0x14d036);
          for (let _0x104580 in quiz['spriteCycles']) _0x13e6ef(_0x104580, quiz['spriteCycles']);
        })(_0x5bd580),
        (_0x5bd580 += 1));
    };
  (constants['callt'](
    setInterval,
    () => {
      _0x12e639();
    },
    0x7d0,
  ),
    _0x12e639());

  function _0x45f4e9() {
    let _0x463e68 = constants['callf4'](sortDictionaryByValue, quiz.users);
    constants['callf3'](emptyLeaderboard);
    let _0x5949a5 = document.getElementById('leaderboard'),
      _0xe19fdb = quiz['getStyleName']();
    for (let _0x168b32 = 0; constants['lt41'](_0x168b32, _0x463e68.length); _0x168b32++) {
      let _0x4c45b9 = document.createElement(constants['divdiv']);
      (_0x4c45b9.classList.add(constants['inlinetext']),
        _0x4c45b9.classList.add(constants['GQIGX']('inlinetext', _0xe19fdb)),
        _0x4c45b9.classList.add(constants['rank']),
        _0x4c45b9.classList.add(rankVals[_0x168b32]));
      let _0x2169ed = document['createTextNode'](
        constants['Ltrxd'](
          constants['Ltrxd'](
            constants['plus2'](constants['add2']('#', _0x168b32 + 1) + '\x20', _0x463e68[_0x168b32][0]) + '\x20(',
            _0x463e68[_0x168b32][1],
          ),
          ')',
        ),
      );
      if ((_0x4c45b9.appendChild(_0x2169ed), _0x5949a5.appendChild(_0x4c45b9), constants['gte'](_0x168b32, 0x2))) {
        break;
      }
    }
    constants['gt'](_0x463e68.length, 1) && (document.getElementById(constants['ranking']).style.display = 'block');
  }

  ((document.getElementById(constants['KWwwr'])['onclick'] = () => {
    ((_0x193402 = true),
      (quiz.cyclingEnabled = true),
      _0x57dd20(document.getElementById(constants['cycleOff'])),
      constants['call7'](_0x2f9557, document.getElementById('cycle-on')));
  }),
    (document.getElementById(constants['cycleOff'])['onclick'] = () => {
      ((_0x193402 = false),
        (quiz.cyclingEnabled = false),
        quiz['resetDitto'](),
        _0x12e639(),
        constants['JbBCS'](_0x57dd20, document.getElementById('cycle-on')),
        _0x2f9557(document.getElementById('cycle-off')));
    }),
    window['addEventListener'](constants['beforeunload'], beforeUnload),
    (document.getElementById('twitch-on')['onclick'] = function () {
      const _0x5da9dd = {
        KlDFr: function (_0x2cb46e, _0x41f589) {
          return constants['VotkM'](_0x2cb46e, _0x41f589);
        },
        PJcyp: constants['UiQPb'],
        SeLVa: function (_0x89e55d, _0x187a44) {
          return _0x89e55d(_0x187a44);
        },
        YBtrc: function (_0x14256a, _0x4f4445) {
          return constants['ne4'](_0x14256a, _0x4f4445);
        },
        ccJBa: function (_0x56ca62, _0x2fdeb3) {
          return constants['lt41'](_0x56ca62, _0x2fdeb3);
        },
        mjFul: function (_0x1314b8, _0x23e747, _0x626890, _0xcf7c68) {
          return _0x1314b8(_0x23e747, _0x626890, _0xcf7c68);
        },
        sDAxn: function (_0x2b9498, _0x1f4c24, _0x4ed152, _0x58e303) {
          return _0x2b9498(_0x1f4c24, _0x4ed152, _0x58e303);
        },
        veUMa: constants.body,
      };
      if (!isTwitchOn && constants.ne2('', document.getElementById('twitch-channel')['value'])) {
        isTwitchOn = true;
        let _0x2fdaa7 = document.getElementById('twitch-channel')['value'];
        (console['log']('enable', _0x2fdaa7),
          (document.getElementById(constants['twitchChannel']).disabled = true),
          _0x57dd20(document.getElementById(constants['twitchOff'])),
          _0x2f9557(document.getElementById(constants['twitchon'])),
          (client = new tmi['Client']({
            channels: [document.getElementById('twitch-channel')['value']],
          }))['on']('connected', function (_0x4cb0c1, _0x4bccc7) {
            _0x5da9dd['SeLVa'](showUserMessage, 'Connected\x20to\x20Twitch\x20chat\x20for\x20' + _0x2fdaa7);
          }),
          client['connect'](),
          client['on'](constants['SPaSR'], (_0x17f4cf, _0x577ed1, _0x426cd4, _0x563a85) => {
            const _0x4e5200 = {
              SpoUc: function (_0x352044, _0x5331b9, _0x2068e9) {
                return constants['callfa'](_0x352044, _0x5331b9, _0x2068e9);
              },
              UWGLD: function (_0x1cedf2, _0x2d1f42) {
                return constants['LImBr'](_0x1cedf2, _0x2d1f42);
              },
              XRPvW: constants.body,
              ZJzcm: function (_0x4ba508, _0x282f67, _0x20d6e8, _0x4645e4) {
                return constants['call43'](_0x4ba508, _0x282f67, _0x20d6e8, _0x4645e4);
              },
              conTZ: constants['UiQPb'],
              yjSvQ: function (_0x2d88d4, _0x5d24cd, _0x193700, _0xe56ed0) {
                return _0x2d88d4(_0x5d24cd, _0x193700, _0xe56ed0);
              },
            };
            console['log']('Twitch\x20chat\x20message\x20-\x20' + _0x577ed1['display-name'] + ':\x20' + _0x426cd4);
            let _0x52294e = _0x577ed1[constants['displayName']].toLowerCase(),
              _0x301569 = false;
            if (
              (constants['badges'] in _0x577ed1 &&
                null != _0x577ed1['badges'] &&
                (constants['inin']('vip', _0x577ed1['badges']) &&
                  '1' == _0x577ed1['badges']['vip'] &&
                  (_0x301569 = true),
                constants['FTJPv']('moderator', _0x577ed1['badges']) &&
                  '1' == _0x577ed1['badges']['moderator'] &&
                  (_0x301569 = true),
                constants['inArr']('broadcaster', _0x577ed1['badges']) &&
                  '1' == _0x577ed1['badges']['broadcaster'] &&
                  (_0x301569 = true)),
              (_0x301569 || 'adeptcharon' == _0x52294e || constants['similar']('stapotv', _0x52294e)) &&
                (standardizeName(_0x426cd4) === constants['scrolldown'].toLowerCase()
                  ? window['scrollBy'](0, 0x3c)
                  : constants['eqeqeq4'](
                      constants['call7'](standardizeName, _0x426cd4),
                      constants['scrollup'].toLowerCase(),
                    ) && window['scrollBy'](0, -0x3c),
                constants['GBQPa'](standardizeName, _0x426cd4) === constants['darkoff'].toLowerCase()
                  ? constants['minus'](Date['now'](), swapLimit) > _lastDarkSwap &&
                    (document.getElementById(constants['darkoff']).click(), (_lastDarkSwap = Date['now']()))
                  : constants['eqeqeq5'](constants['fff'](standardizeName, _0x426cd4), 'darkon'.toLowerCase())
                    ? constants['HJLRw'](constants['sub23'](Date['now'](), swapLimit), _lastDarkSwap) &&
                      (document.getElementById(constants['darkon']).click(), (_lastDarkSwap = Date['now']()))
                    : constants['EjTKk'](standardizeName, _0x426cd4) === constants['shinyon'].toLowerCase()
                      ? constants['gt3'](constants['sub3'](Date['now'](), swapLimit), _lastShinySwap) &&
                        (shinyOn(), (_lastShinySwap = Date['now']()))
                      : constants['ffg'](standardizeName, _0x426cd4) === 'shinyoff'.toLowerCase() &&
                        constants['gt4'](constants.sub(Date['now'](), swapLimit), _lastShinySwap) &&
                        (constants['callf3'](shinyOff), (_lastShinySwap = Date['now']()))),
              constants['similar'](constants['Qqmuu'], _0x2fdaa7.toLowerCase()))
            ) {
              if ('ethan_from_chicago' == _0x52294e && constants['RwcIQ'] == _0x426cd4) {
                let _0x9e8699 = 5;
                for (const _0x5785ed of quiz['currentIds']) {
                  if (quiz['named'].has(_0x5785ed)) {
                    continue;
                  }
                  let _0x25a808 = quiz.pokemonIdDict[_0x5785ed].baseName;
                  (constants['callfa'](
                    setTimeout,
                    () => {
                      _0x4cb4ed(_0x52294e, _0x25a808, true);
                    },
                    _0x9e8699,
                  ),
                    (_0x9e8699 += 5));
                }
              }
              (constants['eqeqeq4'](_0x426cd4, 'satan'.toLowerCase()) && _0x4cb4ed(_0x52294e, 'whimsicott', true),
                constants['eq'](_0x426cd4, 'wilbur'.toLowerCase()) &&
                  (constants['call43'](_0x4cb4ed, _0x52294e, constants['VwuXG'], true),
                  _0x4cb4ed(_0x52294e, constants['tranquill'], true),
                  constants['call43'](_0x4cb4ed, _0x52294e, constants['unfezant'], true)),
                constants['eqeqeq5'](_0x426cd4, constants['dennis'].toLowerCase()) &&
                  (constants['call43'](_0x4cb4ed, _0x52294e, constants['Srgss'], true),
                  _0x4cb4ed(_0x52294e, 'boldore', true),
                  constants['call43'](_0x4cb4ed, _0x52294e, 'gigalith', true)),
                constants['eqeqeq5'](_0x426cd4, constants['UwClu'].toLowerCase()) &&
                  constants['LVmEH'](_0x4cb4ed, _0x52294e, constants['spheal'], true));
            }
            (constants['eqeqeq2']('stapotv', _0x52294e) &&
              (constants['equals'](constants['partyOn'], _0x426cd4)
                ? (function () {
                    let _0x22b8b2 = 0;
                    (_0x4e5200['UWGLD']('', currentType) &&
                      document.getElementById('body').classList.remove(currentType),
                      (_0x103bde = _0x4e5200['SpoUc'](
                        setInterval,
                        () => {
                          (document.getElementById(_0x4e5200['XRPvW']).classList.remove(typeList[_0x22b8b2]),
                            (_0x22b8b2 += 1),
                            _0x22b8b2 == typeList.length && (_0x22b8b2 = 0),
                            document.getElementById(_0x4e5200['XRPvW']).classList.add(typeList[_0x22b8b2]),
                            darkMode
                              ? document.getElementById('body').classList.add(_0x4e5200['conTZ'])
                              : document.getElementById('body').classList.add('blend'));
                        },
                        0x96,
                      )));
                  })()
                : constants['OkKMX'] === _0x426cd4 &&
                  (function () {
                    _0x5da9dd['YBtrc'](null, _0x103bde) && _0x5da9dd['KlDFr'](clearInterval, _0x103bde);
                    for (let _0x4b9999 = 0; _0x5da9dd['ccJBa'](_0x4b9999, typeList.length); _0x4b9999++)
                      document.getElementById('body').classList.remove(typeList[_0x4b9999]);
                    '' === currentType
                      ? (document.getElementById('body').classList.remove('blend'),
                        document.getElementById('body').classList.remove(_0x5da9dd['PJcyp']))
                      : (darkMode
                          ? document.getElementById('body').classList.add(_0x5da9dd['PJcyp'])
                          : document.getElementById(_0x5da9dd['veUMa']).classList.add('blend'),
                        document.getElementById(_0x5da9dd['veUMa']).classList.add(currentType));
                  })()),
              ('ethan_from_chicago' != _0x52294e && 'ethan_from_chicago' != _0x2fdaa7.toLowerCase()) ||
                (constants['eq'](_0x426cd4, 'ethan_from_chicago\x27s\x20favorite\x20pokemon'.toLowerCase()) &&
                  (_0x4cb4ed(_0x52294e, 'spheal', true),
                  (image = new Image()),
                  (image.src = constants['Vkdua']),
                  image['addEventListener'](
                    'load',
                    function () {
                      _0x5da9dd['sDAxn'](imageRain, image, 0x190, 0xa0);
                    },
                    false,
                  ))),
              (constants['ne3'](constants['pkmncast'], _0x52294e) && constants['ne30']('adeptcharon', _0x52294e)) ||
                (constants['eqeqeq5'](_0x426cd4, constants['pkmncast'].toLowerCase()) &&
                  (_0x4cb4ed(_0x52294e, 'cramorant', true),
                  (image = new Image()),
                  (image.src = constants['cramorant']),
                  image['addEventListener'](
                    constants['load'],
                    function () {
                      _0x5da9dd['mjFul'](imageRain, image, 0x32, 300);
                    },
                    false,
                  )),
                _0x426cd4 === constants['wigglypuff'].toLowerCase() &&
                  (constants['callfunc'](_0x4cb4ed, _0x52294e, 'wigglytuff', true),
                  (image = new Image()),
                  (image.src = '/images/wigglypuff.png'),
                  image['addEventListener'](
                    'load',
                    function () {
                      _0x4e5200['ZJzcm'](imageRain, image, 0x32, 300);
                    },
                    false,
                  ))),
              (constants['norainthefuture'] != _0x52294e && constants.ne2('adeptcharon', _0x52294e)) ||
                (constants['EmCVN'](_0x426cd4, constants['KbDPg'].toLowerCase()) &&
                  (constants['LVmEH'](_0x4cb4ed, _0x52294e, 'pawmi', true),
                  (image = new Image()),
                  (image.src = '/images/pawmi.png'),
                  image['addEventListener'](
                    'load',
                    function () {
                      imageRain(image, 0x32, 300);
                    },
                    false,
                  ))),
              (constants['WTcif'](constants['birdkeepertoby'], _0x2fdaa7.toLowerCase()) &&
                constants['adeptcharon'] != _0x2fdaa7.toLowerCase()) ||
                (constants['birdkeepertoby'] != _0x52294e && constants['adeptcharon'] != _0x52294e) ||
                (constants['eq5'](_0x426cd4, 'hoot'.toLowerCase()) &&
                  (constants['callfunc'](_0x4cb4ed, _0x52294e, constants['hoothoot'], true),
                  (image = new Image()),
                  (image.src = constants['hoothoot']),
                  image['addEventListener'](
                    constants['load'],
                    function () {
                      _0x5da9dd['sDAxn'](imageRain, image, 0x32, 0xc8);
                    },
                    false,
                  )),
                _0x426cd4 === constants['birdkeeper'].toLowerCase() &&
                  (_0x4cb4ed(_0x52294e, 'pidgey', true),
                  _0x4cb4ed(_0x52294e, 'spearow', true),
                  constants['callfa4'](_0x4cb4ed, _0x52294e, constants['farfetched'], true),
                  _0x4cb4ed(_0x52294e, 'doduo', true),
                  _0x4cb4ed(_0x52294e, 'hoothoot', true),
                  _0x4cb4ed(_0x52294e, 'natu', true),
                  _0x4cb4ed(_0x52294e, 'murkrow', true),
                  constants['LVmEH'](_0x4cb4ed, _0x52294e, constants['delibird'], true),
                  _0x4cb4ed(_0x52294e, constants['skarmory'], true),
                  constants['ggg'](_0x4cb4ed, _0x52294e, constants['taillow'], true),
                  constants['call43'](_0x4cb4ed, _0x52294e, constants['LWdHe'], true),
                  constants['callfunc'](_0x4cb4ed, _0x52294e, constants['swablu'], true),
                  _0x4cb4ed(_0x52294e, 'starly', true),
                  constants['run3'](_0x4cb4ed, _0x52294e, constants['chatot'], true),
                  constants['callfa3'](_0x4cb4ed, _0x52294e, constants['VwuXG'], true),
                  _0x4cb4ed(_0x52294e, constants['archen'], true),
                  constants['ggg'](_0x4cb4ed, _0x52294e, constants['ducklett'], true),
                  _0x4cb4ed(_0x52294e, constants['rufflet'], true),
                  constants['ggg'](_0x4cb4ed, _0x52294e, 'vullaby', true),
                  constants['PUPtP'](_0x4cb4ed, _0x52294e, 'fletchling', true),
                  _0x4cb4ed(_0x52294e, constants['hawlucha'], true),
                  constants['callfa3'](_0x4cb4ed, _0x52294e, 'rowlet', true),
                  _0x4cb4ed(_0x52294e, 'torchic', true),
                  _0x4cb4ed(_0x52294e, constants['pikipek'], true),
                  _0x4cb4ed(_0x52294e, 'oricorio', true),
                  _0x4cb4ed(_0x52294e, 'rookidee', true),
                  constants['callf6'](_0x4cb4ed, _0x52294e, 'cramorant', true))),
              (constants['absoltastic'] == _0x52294e ||
                constants['Esrzl'](constants['adeptcharon'], _0x52294e) ||
                (constants['RLUxk'](constants['absoltastic'], _0x2fdaa7.toLowerCase()) && _0x301569)) &&
                constants['eqeqeq7'](_0x426cd4, 'matt'.toLowerCase()) &&
                (constants['SuctZ'](_0x4cb4ed, _0x52294e, 'absol', true),
                (image = new Image()),
                (image.src = constants['absolPath']),
                image['addEventListener'](
                  constants['load'],
                  function () {
                    imageRain(image, 0x32, 300);
                  },
                  false,
                )),
              (constants['airstainer'] == _0x52294e ||
                'adeptcharon' == _0x52294e ||
                (constants['Osfto'](constants['airstainer'], _0x2fdaa7.toLowerCase()) && _0x301569)) &&
                constants['eqeqeq'](_0x426cd4, 'ais'.toLowerCase()) &&
                (_0x4cb4ed(_0x52294e, constants['sinistea'], true),
                _0x4cb4ed(_0x52294e, 'polteageist', true),
                _0x4cb4ed(_0x52294e, 'poltchageist', true),
                constants['callfa3'](_0x4cb4ed, _0x52294e, constants['sinistcha'], true),
                (image = new Image()),
                (image.src = '/images/poltchageist.png'),
                image['addEventListener'](
                  'load',
                  function () {
                    imageRain(image, 0x32, 300);
                  },
                  false,
                )),
              (constants['Esrzl']('durmoo', _0x52294e) ||
                constants['Lwfue']('adeptcharon', _0x52294e) ||
                (constants['Esrzl']('durmoo', _0x2fdaa7.toLowerCase()) && _0x301569)) &&
                constants['equals'](_0x426cd4, 'durmoo'.toLowerCase()) &&
                (_0x4cb4ed(_0x52294e, 'hitmontop', true),
                (image = new Image()),
                (image.src = '/images/hitmontop.png'),
                image['addEventListener'](
                  constants['load'],
                  function () {
                    imageRain(image, 0x32, 300);
                  },
                  false,
                )),
              ('yarnity' == _0x52294e ||
                constants['adeptcharon'] == _0x52294e ||
                (constants['yarnity'] == _0x2fdaa7.toLowerCase() && _0x301569)) &&
                _0x426cd4 === constants['ViKZe'].toLowerCase() &&
                (_0x4cb4ed(_0x52294e, 'mareep', true),
                (image = new Image()),
                (image.src = constants['mareepPath']),
                image['addEventListener'](
                  constants['load'],
                  function () {
                    imageRain(image, 0x32, 300);
                  },
                  false,
                )),
              ('r2dabes' != _0x52294e && constants['ne43'](constants['adeptcharon'], _0x52294e)) ||
                (_0x426cd4 === 'r2dabes'.toLowerCase() &&
                  (constants['ggg'](_0x4cb4ed, _0x52294e, constants['flapple'], true),
                  (image = new Image()),
                  (image.src = constants['flapplePath']),
                  image['addEventListener'](
                    constants['load'],
                    function () {
                      imageRain(image, 0x32, 300);
                    },
                    false,
                  ))),
              constants['Esrzl']('adeptcharon', _0x52294e) &&
                constants['eq2'](_0x426cd4, 'bestpkmn'.toLowerCase()) &&
                (constants['PUPtP'](_0x4cb4ed, _0x52294e, constants['crabominable'], true),
                (image = new Image()),
                (image.src = '/images/crabominable.png'),
                image['addEventListener'](
                  'load',
                  function () {
                    _0x4e5200['yjSvQ'](imageRain, image, 0x32, 0x154);
                  },
                  false,
                )),
              (constants['fabulousfauna'] != _0x52294e && constants['adeptcharon'] != _0x52294e) ||
                (constants['eqeqeq2'](_0x426cd4, 'fauna'.toLowerCase()) &&
                  (_0x4cb4ed(_0x52294e, 'vulpix', true),
                  (image = new Image()),
                  (image.src = '/images/vulpix.png'),
                  image['addEventListener'](
                    'load',
                    function () {
                      imageRain(image, 0x32, 300);
                    },
                    false,
                  )),
                _0x426cd4 === 'fabulous'.toLowerCase() &&
                  (constants['ggg'](_0x4cb4ed, _0x52294e, constants['ninetales'], true),
                  (image = new Image()),
                  (image.src = '/images/vulpix-alola.png'),
                  image['addEventListener'](
                    'load',
                    function () {
                      imageRain(image, 0x32, 300);
                    },
                    false,
                  ))),
              constants['LVmEH'](_0x4cb4ed, _0x52294e, _0x426cd4, true));
          }));
      }
    }));
  let _0x4cb4ed = function (_0x1ea349, _0x462dc0, _0x565156) {
    _0x46eda6(_0x462dc0, _0x1ea349);
  };

  function _0x1634aa() {
    ((paused = true),
      (quiz['paused'] = true),
      (inputField.disabled = true),
      (document.getElementById(constants['pauseOverlay']).style.display = 'block'));
  }

  function _0x3caacb() {
    ((paused = false),
      (quiz['paused'] = false),
      (inputField.disabled = false),
      (document.getElementById(constants['pauseOverlay']).style.display = 'none'));
  }

  function getState() {
    let response = {};
    response.filters = quiz.filters;
    response.quizName = quiz.name;
    response.named = [...quiz.named];
    response.users = quiz.users;
    response.paused = quiz.paused;
    response.silhouettes = quiz.isSilhouettesEnabled();
    response.orderMode = quiz.orderMode;
    response.chaosMode = quiz.chaosMode;
    response.typeDisorder = quiz.typeDisorder;
    response.typeSeed = quiz.seed;
    response.revealedShadows = [...quiz.revealedShadows];
    response.giveup = quiz.giveUpState;
    response.timer = timerObj;

    return response;
  }

  ((document.getElementById(constants['twitchOff'])['onclick'] = function () {
    isTwitchOn &&
      ((isTwitchOn = false),
      console['log'](constants['disable']),
      (document.getElementById(constants['twitchChannel']).disabled = false),
      constants['MAcCo'](_0x57dd20, document.getElementById(constants['twitchon'])),
      constants['call431'](_0x2f9557, document.getElementById(constants['twitchOff'])),
      client['disconnect'](),
      (document.getElementById('ranking').style.display = constants.none));
  }),
    (saveButton['onclick'] = () => {
      let _0x182a0b = constants.call2(getState);
      ((_0x182a0b['timer']['savedAt'] = Date['now']()), (_0x182a0b['version'] = 1));
      let _0x111cc6 = JSON['stringify'](_0x182a0b),
        _0x3cf089 = constants['fff9'](btoa, _0x111cc6),
        _0x4ba227 = new Blob([_0x3cf089], {
          type: 'text/plain',
        }),
        _0x36a4a0 = URL['createObjectURL'](_0x4ba227),
        _0x41fd18 = document.createElement('a');
      ((_0x41fd18['href'] = _0x36a4a0),
        (_0x41fd18['download'] =
          constants['plus4'](
            constants['pkmnquizState'],
            (function () {
              let _0x406d0c = new Date()['toISOString']()['slice'](0, 0xa);
              return ((_0x406d0c = _0x406d0c.replace(/-/g, '_')), _0x406d0c);
            })(),
          ) + '.quiz'),
        (_0x41fd18.style.display = constants.none),
        document.body.appendChild(_0x41fd18),
        _0x41fd18.click(),
        URL['revokeObjectURL'](_0x36a4a0));
    }));
  let _0x5de384 = (_0x339bfd) => {
    const _0x5b9d42 = new FileReader();
    ((_0x5b9d42['onload'] = function (_0x3bf15e) {
      try {
        let _0x1ba06a = _0x3bf15e['target']['result'],
          _0x4df361 = constants['UBviC'](atob, _0x1ba06a);
        (constants['fcrVe'](_0x173913, JSON['parse'](_0x4df361), true), _0x4f10());
        let _0x1b74b0 = 'Successfully\x20loaded\x20quiz\x20[' + quiz.name.toLowerCase() + ']';
        ((_0x1b74b0 = _0x1b74b0.replace('\x20]', ']')), constants['call23'](showUserMessage, _0x1b74b0));
      } catch (_0x279f19) {
        (console['error']('Failed\x20to\x20load\x20file:', _0x279f19), showUserMessage(constants['failedLoading']));
      }
    }),
      _0x5b9d42['readAsText'](_0x339bfd));
  };
  function startTimer(timer) {
    const ops = {
      call: (f, x) => f(x),
    };

    clearInterval(activeTimer);
    activeTimer = false;

    if (timer.type !== 'none') {
      if (timer.type === 'countdown') {
        let startTime = Date.now();

        activeTimer = setInterval(() => {
          const currentNow = Date.now();
          if (paused) {
            timer.t += currentNow - startTime;
          }

          const elapsed = timer.t - currentNow;
          if ((socket === null || isSocketHost) && elapsed < 0) {
            someFunc();
          }
          startTime = currentNow;
        }, 100);
      } else {
      }
    }

    if (constants['eq2']('countdown', timer.type)) {
      let startTime = Date['now']();
      activeTimer = constants['callt'](
        setInterval,
        function () {
          let currentNow = Date['now']();
          paused && (timer['t'] += constants.sub(currentNow, startTime));
          let elapsed = constants['sub2'](timer['t'], currentNow);
          ((constants['eq3'](null, socket) || isSocketHost) && elapsed < 0 && constants['callf'](someFunc),
            (startTime = currentNow),
            setElapsed(elapsed));
        },
        100,
      );
    } else {
      let _0x72ee0e = Date['now'](),
        _0x3e3645 = constants['add7'](timer['t'], Date['now']() - timer['updatedAt']);
      activeTimer = setInterval(function () {
        let _0x5bb7ee = Date['now']() - _0x72ee0e;
        ((_0x72ee0e = Date['now']()),
          paused || (_0x3e3645 += _0x5bb7ee),
          (timerObj['t'] = _0x3e3645),
          (timerObj['updatedAt'] = _0x72ee0e),
          ops.call(setElapsed, _0x3e3645));
      }, 100);
    }
  }

  function _0x173913(_0x4b5ecc, _0x29a8b3 = false) {
    if (
      ((_0x4b5ecc['named'] = new Set(_0x4b5ecc['named'])),
      constants['orderMode'] in _0x4b5ecc && _0x4b5ecc['orderMode']
        ? ((quiz['orderMode'] = true),
          (quiz['chaosMode'] = false),
          (quiz['typeDisorder'] = false),
          _0x2f9557(orderButton),
          _0x57dd20(regularButton),
          constants['EkIcu'](_0x57dd20, chaosButton))
        : ((quiz['orderMode'] = false),
          (quiz['chaosMode'] = false),
          _0x2f9557(regularButton),
          constants['EjTKk'](_0x57dd20, orderButton),
          _0x57dd20(chaosButton)),
      'chaosMode' in _0x4b5ecc &&
        _0x4b5ecc['chaosMode'] &&
        ((quiz['chaosMode'] = true),
        (quiz['orderMode'] = false),
        constants['PmenZ'](_0x2f9557, chaosButton),
        _0x57dd20(orderButton),
        constants['call9'](_0x57dd20, regularButton)),
      quiz['setQuiz'](_0x4b5ecc['quizName'], _0x4b5ecc['filters']),
      constants['typeSeed'] in _0x4b5ecc && (quiz.seed = _0x4b5ecc['typeSeed']),
      constants['typeDisorder'] in _0x4b5ecc && _0x4b5ecc['typeDisorder']
        ? ((quiz['orderMode'] = false), typeDisorderButtonOn.click())
        : typeDisorderButtonOff.click(),
      _0x4b5ecc['silhouettes'] && quiz['setSilhouettes'](),
      constants['in2'](constants['FjwQw'], _0x4b5ecc))
    ) {
      for (let _0x4a1a4b = 0; constants['ltlt'](_0x4a1a4b, _0x4b5ecc['revealedShadows'].length); _0x4a1a4b++)
        quiz['revealSingleShadow'](_0x4b5ecc['revealedShadows'][_0x4a1a4b]);
    }
    for (let _0x15316b of _0x4b5ecc['named']) quiz['addNamed'](_0x15316b);
    ((quiz.users = _0x4b5ecc.users),
      _0x46dbc4(quiz['getScore']()),
      _0x29a8b3 &&
        ((_0x4b5ecc['timer']['t'] += Date['now']() - _0x4b5ecc['timer']['savedAt']),
        (_0x4b5ecc['timer']['updatedAt'] = Date['now']() + Date['now']() - _0x4b5ecc['timer']['savedAt']),
        (timerObj = _0x4b5ecc['timer'])),
      _0x4b5ecc['giveup'] && constants.calll(_0x292768),
      _0x4b5ecc['paused'] && constants['call3'](_0x1634aa),
      startTimer(_0x4b5ecc['timer']));
  }

  (loadButton['addEventListener']('change', function (_0x56422e) {
    document.getElementById(constants['fileInput']).click();
  }),
    (loadButton['onclick'] = () => {
      document.getElementById('fileInput').click();
    }),
    document.getElementById('fileInput')['addEventListener']('change', function (_0x1c3aa7) {
      if (_0x1c3aa7['target']['files'].length > 0) {
        let _0x4c8f03 = _0x1c3aa7['target']['files'][0];
        (constants['call5'](_0x5de384, _0x4c8f03), (document.getElementById(constants['fileInput'])['value'] = ''));
      }
    }),
    (document.getElementById(constants['unpause'])['onclick'] = () => {
      (_0x1ffa5f(false), _0x3caacb());
    }),
    (pauseBtn['onclick'] = () => {
      (_0x1ffa5f(true), constants['callf2'](_0x1634aa));
    }),
    changeFooterPosition(),
    _0x46dbc4(0),
    _0x34a9b2(),
    (function () {
      const _0x24455b = {
        ENRqm: function (_0x2314cd, _0x2bfb3f) {
          return constants['eq'](_0x2314cd, _0x2bfb3f);
        },
        KvoXn: 'none',
        TxHpX: function (_0x51f94a, _0x19f875) {
          return constants['lt41'](_0x51f94a, _0x19f875);
        },
        WejrV: function (_0x25689c, _0x3cbd3) {
          return constants['notEquals'](_0x25689c, _0x3cbd3);
        },
        wxKsO: function (_0x4dc8f8, _0x11db99) {
          return _0x4dc8f8 !== _0x11db99;
        },
      };
      let _0x4bd580 = 0;
      (document['addEventListener']('dragover', function (_0x570ae4) {
        if (
          (_0x570ae4['preventDefault'](),
          (_0x24455b['ENRqm'](null, socket) || isSocketHost) && _0x24455b['WejrV']('none', quiz.name))
        ) {
          if (_0x24455b['TxHpX'](Date['now'](), _0x4bd580 + 3000)) {
            return;
          }
          ((_0x4bd580 = Date['now']()), showUserMessage('Drop\x20the\x20.quiz\x20file\x20anywhere\x20to\x20load'));
        }
      }),
        document['addEventListener'](constants['drop'], function (_0x54d60e) {
          if (
            (_0x54d60e['preventDefault'](),
            (null === socket || isSocketHost) && _0x24455b['wxKsO'](_0x24455b['KvoXn'], quiz.name))
          ) {
            let _0x2d7952 = _0x54d60e['dataTransfer']['files'];
            if (_0x2d7952.length > 0 && _0x2d7952[0].name['endsWith']('.quiz')) {
              let _0x21a66a = _0x2d7952[0];
              _0x5de384(_0x21a66a);
            }
          }
        }),
        (document.getElementById('loader').style.display = 'none'),
        (document.getElementById('loadboxguest').style.display = constants.none),
        (document.getElementById('playtext').style.opacity = '1'),
        (document.getElementById(constants['inputBar']).style.opacity = '1'),
        (document.getElementById(constants['pokemon']).disabled = false),
        (document.getElementById(constants['spinner']).style.display = 'none'),
        (document.getElementById('spinnerguest').style.display = 'none'),
        (document.getElementById('username-area').style.display = 'block'),
        document.getElementById(constants['missingEng']).click(),
        constants['exec'](changeFooterPosition),
        constants['exec2'](addTransitionCss),
        preloadSmallerImages());
    })());
}

roomId.length > 1
  ? (postMultiplayerServer('roomExists', {
      roomId: roomId,
    }).then((_0x2613ec) => {
      _0x2613ec['success'] || noSuchRoom();
    }),
    (document.getElementById('guest-info').style.display = 'block'),
    (document.getElementById('loadboxguest').style.display = 'block'),
    (document.getElementById('savemenu').style.display = 'none'),
    (document.getElementById('loadbox').style.display = 'none'),
    (document.getElementById('extrashadow').style.display = 'none'),
    (usernamePrompt.style.display = 'block'),
    (radioSilhouette.style.display = 'none'),
    (orderModeMenu.style.display = 'none'),
    (giveUpBtn.style.display = 'none'),
    (resetBtn.style.display = 'none'),
    (timerBtn.style.display = 'none'),
    (stopwatchBtn.style.display = 'none'),
    (pauseBtn.style.display = 'none'),
    (hostGame.style.display = 'none'),
    (document.getElementById('genselect').style.display = 'none'),
    (document.getElementById('typeshufflebox').style.display = 'none'),
    (document.getElementById('specialButton').style.display = 'none'),
    (document.getElementById('typeselect').style.display = 'none'),
    (document.getElementById('timers').style.display = 'none'),
    (document.getElementById('twitchbox').style.display = 'none'),
    (document.getElementById('fullQuizButton').style.display = 'none'),
    (document.getElementById('playtext').style.display = 'none'),
    (pauseBtn.style.display = 'none'),
    (document.getElementById('unpause').style.display = 'none'),
    (document.getElementById('pause-text').innerText = 'Paused\x20by\x20host'))
  : ((roomId = null), (document.getElementById('host-info').style.display = 'block'));
let visualizeButtonClick = function (_0x1f008a) {
    const _0x4c6340 = {
      DUlKI: 'smolbuttonxdark',
      vGAzV: function (_0x111adb, _0xffc093) {
        return _0x111adb !== _0xffc093;
      },
    };
    if (
      (_0x1f008a.classList.add('smolbuttonx'),
      darkMode && _0x1f008a.classList.add(_0x4c6340['DUlKI']),
      _0x4c6340['vGAzV']('', quiz['getStyleName']()))
    ) {
      let _0x202332 = quiz['getStyleName']();
      (_0x1f008a.classList.add('smolbuttonx' + _0x202332),
        darkMode && _0x1f008a.classList.add('smolbuttonxdark' + _0x202332));
    }
  },
  visualizeButtonUnclick = function (_0x3007ef) {
    const _0x59923c = {
      oxsEu: 'smolbuttonxdark',
    };
    if (
      (_0x3007ef.classList.remove('smolbuttonx'),
      _0x3007ef.classList.remove(_0x59923c['oxsEu']),
      '' !== quiz['getStyleName']())
    ) {
      let _0x4ba72e = quiz['getStyleName']();
      ('dark' == _0x4ba72e && (_0x4ba72e = 'evil'),
        _0x3007ef.classList.remove('smolbuttonx' + _0x4ba72e),
        _0x3007ef.classList.remove(_0x59923c['oxsEu'] + _0x4ba72e));
    }
  };

function addTransitionCss() {
  const _0x108ce6 = {
    Hagzj: 'box',
    MrLQu: 'transition-element',
    OQfsG: 'bgpattern2',
    RauhI: 'button',
    VILwW: function (_0x4f12fb, _0x3534f) {
      return _0x4f12fb >= _0x3534f;
    },
    asiZO: 'smolbutton',
    dRZgx: function (_0x391275, _0x5737b2) {
      return _0x391275 < _0x5737b2;
    },
    jchsI: 'twitchbar',
    lRDDt: 'bgpattern',
  };
  let _0x2279a6 = [];
  _0x2279a6.push(document.getElementById('body'));
  let _0x17c281 = [
    _0x108ce6['Hagzj'],
    _0x108ce6['RauhI'],
    _0x108ce6['asiZO'],
    'limelight',
    'greyer',
    'inlinebox',
    'spbutton',
    _0x108ce6['jchsI'],
    _0x108ce6['lRDDt'],
    _0x108ce6['OQfsG'],
  ];
  for (const _0x5555e8 of _0x17c281) {
    let _0x22fd69 = document.getElementsByClassName(_0x5555e8);
    for (let _0x3e1eb9 = 0; _0x3e1eb9 < _0x22fd69.length; _0x3e1eb9++) _0x2279a6.push(_0x22fd69[_0x3e1eb9]);
  }
  for (let _0x22a938 = 0; _0x108ce6['dRZgx'](_0x22a938, _0x2279a6.length); _0x22a938++)
    _0x2279a6[_0x22a938].classList.add(_0x108ce6['MrLQu']);
  let _0x50fdd4 = new Date();
  (_0x108ce6['VILwW'](_0x50fdd4['getHours'](), 0x12) || _0x50fdd4['getHours']() <= 0x7) &&
    setTimeout(() => {
      document.getElementById('darkon').click();
    }, 0xa);
}

function preloadSmallerImages() {
  const _0x556a53 = {
    aMAQD: function (_0x132a49, _0x124d72) {
      return _0x132a49 + _0x124d72;
    },
    lVHhB: function (_0x294729, _0x5e9750) {
      return _0x294729 < _0x5e9750;
    },
  };
  for (let _0x4072cc = 0; _0x556a53['lVHhB'](_0x4072cc, typeList.length); _0x4072cc++) {
    let _0x4a6529 = typeList[_0x4072cc].toUpperCase();
    new Image().src = _0x556a53['aMAQD']('/images/types/' + _0x4a6529, '.svg');
  }
}

let currentMessageTimeout = null;

function showUserMessage(_0xc4211d) {
  const _0x374346 = {
    ToHGY: 'wrongquiz',
    UVtWa: function (_0xc7faf4, _0x1abb6b) {
      return _0xc7faf4(_0x1abb6b);
    },
    aimfA: function (_0x4f9d2f, _0x874dd6) {
      return _0x4f9d2f !== _0x874dd6;
    },
  };
  _0x374346['aimfA'](null, currentMessageTimeout) && _0x374346['UVtWa'](clearTimeout, currentMessageTimeout);
  let _0x335a5c = document.getElementById(_0x374346['ToHGY']);
  ((_0x335a5c.innerHTML = _0xc4211d),
    _0x335a5c.classList.remove('snackbarshow'),
    _0x335a5c.classList.add('snackbarshow'),
    (currentMessageTimeout = setTimeout(function () {
      (_0x335a5c.classList.remove('snackbarshow'), _0x335a5c.classList.add('snackbar'));
    }, 3000)));
}

let _currentImageFadeIn = null,
  _currentImageFadeOut = null,
  _currentImageEnd = null;

function showImage(_0x3b8072) {
  const _0x5ce1bc = {
    EiiRU: 'message-img',
    Gmhmi: 'slow-transition-element',
    ODXYU: 'imagemessage',
    Udier: '.svg',
    WRiep: function (_0xe7402e, _0x1809d5) {
      return _0xe7402e(_0x1809d5);
    },
    dUGWT: function (_0x2d4b80, _0x3ec8d2, _0x363e90) {
      return _0x2d4b80(_0x3ec8d2, _0x363e90);
    },
    kikTb: 'visible',
    nKuga: '/images/types/',
    pWeeJ: 'block',
    zjmWe: 'transition-element',
  };
  let _0x50a393 = document.getElementById(_0x5ce1bc['ODXYU']),
    _0x218e04 = document.getElementById(_0x5ce1bc['EiiRU']);
  ((_0x50a393['style']['visibility'] = _0x5ce1bc['kikTb']),
    _0x50a393.classList.remove('slow-transition-element'),
    _0x50a393.classList.remove('transition-element'),
    (_0x50a393.style.opacity = 0),
    (_0x50a393.style.display = _0x5ce1bc['pWeeJ']),
    (_0x218e04.src = _0x5ce1bc['nKuga'] + _0x3b8072 + _0x5ce1bc['Udier']),
    null !== _currentImageFadeIn && _0x5ce1bc['WRiep'](clearTimeout, _currentImageFadeIn),
    null !== _currentImageFadeOut && _0x5ce1bc['WRiep'](clearTimeout, _currentImageFadeOut),
    null !== _currentImageEnd && clearTimeout(_currentImageEnd),
    (_currentImageFadeIn = setTimeout(function () {
      const _0x47614b = {
        MyCqZ: function (_0x3e1849, _0x2fecb7, _0x2fbfe3) {
          return _0x3e1849(_0x2fecb7, _0x2fbfe3);
        },
      };
      (_0x50a393.classList.remove(_0x5ce1bc['Gmhmi']),
        _0x50a393.classList.add(_0x5ce1bc['zjmWe']),
        (_0x50a393.style.opacity = 0.8),
        (_currentImageFadeOut = _0x5ce1bc['dUGWT'](
          setTimeout,
          function () {
            (_0x50a393.classList.add('slow-transition-element'),
              _0x50a393.classList.remove('transition-element'),
              (_0x50a393.style.opacity = 0),
              (_currentImageEnd = _0x47614b['MyCqZ'](
                setTimeout,
                function () {
                  _0x50a393.style.display = 'none';
                },
                1000,
              )));
          },
          250,
        )));
    }, 250)));
}

function remove_duplicates_safe(_0x3c333f) {
  for (var _0x55dea8 = {}, _0x42b831 = [], _0x27ead3 = 0; _0x27ead3 < _0x3c333f.length; _0x27ead3++)
    _0x3c333f[_0x27ead3] in _0x55dea8 ||
      (_0x42b831.push(_0x3c333f[_0x27ead3]), (_0x55dea8[_0x3c333f[_0x27ead3]] = true));
  return _0x42b831;
}

function standardizeName(_0xb222b8) {
  const _0x5a7d97 = {
    daTSP: 'NFKC',
    qrPBi: function (_0x3ca9d5, _0x110feb) {
      return _0x3ca9d5 - _0x110feb;
    },
    trmWu: 'viii',
  };
  return (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 =
    (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 =
      (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 =
        (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 =
          (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = (_0xb222b8 =
            (_0xb222b8 = (_0xb222b8 = (_0xb222b8 = _0xb222b8.replace(/\s/g, '')).replace(/-/g, '')).toLowerCase())[
              'normalize'
            ](_0x5a7d97['daTSP'])).replace(/é/g, 'e')).replace(/[èêëěęėē]/g, 'e')).replace(
            /[üùúûűũųůū]/g,
            'u',
          )).replace(/[äàáâãåǎąăæā]/g, 'a')).replace(/[öòóôõőøœ]/g, 'o')).replace(/[đďð]/g, 'd')).replace(
            /[ĝģğ]/g,
            'g',
          )).replace(/ĵ/g, 'j')).replace(/ķ/g, 'k')).replace(/ĥ/g, 'h')).replace(/ß/g, 'ss')).replace(
          /ŵ/g,
          'w',
        )).replace(/[çćĉč]/g, 'c')).replace(/[ïìíîıīį]/g, 'i')).replace(/[ĺļłľŀ]/g, 'l')).replace(
          /[ñńňņ]/g,
          'n',
        )).replace(/[ŕř]/g, 'r')).replace(/[śŝşšș]/g, 's')).replace(/[ťţþț]/g, 't')).replace(/[ýÿŷ]/g, 'y')).replace(
        /[źžż乙]/g,
        'z',
      )).replace(/[ａ-ｚ０-９]/g, function (_0x4c9ced) {
        return String['fromCharCode'](_0x5a7d97['qrPBi'](_0x4c9ced['charCodeAt'](0), 0xfee0));
      })).replace(/Ⅰ/g, 'i')).replace(/Ⅱ/g, 'ii')).replace(/Ⅲ/g, 'iii')).replace(/Ⅳ/g, 'iv')).replace(
      /Ⅴ/g,
      'v',
    )).replace(/Ⅵ/g, 'vi')).replace(/Ⅶ/g, 'ivii')).replace(/Ⅷ/g, _0x5a7d97['trmWu'])).replace(/Ⅸ/g, 'ix'))['replace'](
      /Ⅹ/g,
      'x',
    )).replace(/Ⅺ/g, 'xi')).replace(/Ⅻ/g, 'xii')).replace(/Ⅼ/g, 'l')).replace(/Ⅽ/g, 'c'))['replace'](
    /Ⅾ/g,
    'd',
  )).replace(/Ⅿ/g, 'm')).replace(/[^ぁ-んァ-ン가-힣a-z0-9-_ß０-９ａ-ｚー\u4e00-\u9fa5\uf91f\uf929Ⅰ-ↈ]/g, '')).replace(
    /[艷]/g,
    '豔',
  ));
}

function spellingHelp() {
  const _0x287a6c = {
    TfozU: 'You\x20can\x20also\x20type\x20\x27?\x27\x20to\x20reveal',
    guqgf: 'inline-block',
    pabQK: function (_0x58d1bd, _0x206c5e) {
      return _0x58d1bd(_0x206c5e);
    },
    snpwR: function (_0x349d46) {
      return _0x349d46();
    },
    yrXOc: function (_0x45d301, _0x6bd69d) {
      return _0x45d301(_0x6bd69d);
    },
  };
  isSpellingEnabled
    ? ((spellingElement.style.display = 'none'),
      _0x287a6c['pabQK'](visualizeButtonUnclick, spellingButton),
      _0x287a6c['snpwR'](hideHint),
      (isSpellingEnabled = false),
      inputField['focus']())
    : ((spellingElement.style.display = _0x287a6c['guqgf']),
      visualizeButtonClick(spellingButton),
      (isSpellingEnabled = true),
      _0x287a6c['yrXOc'](showUserMessage, _0x287a6c['TfozU']),
      inputField['focus']());
}

function hideHint() {
  const _0x11aa9d = {
    AOSjp: 'inline-block',
    gYWpG: 'none',
  };
  ((spellingCheck.style.display = _0x11aa9d['AOSjp']),
    (spellingHint.style.display = _0x11aa9d['gYWpG']),
    (spellingHint.innerHTML = ''));
}

let typeClasses = [
    'smolbuttonxdarktype',
    'smolbuttonxtype',
    'limetype',
    'limelighttype',
    'outlinetype',
    'topedgetype',
    'input-twitchtype',
    'input-twitchtype:disabled',
    'input-timertype',
    'smolbuttontype',
    'smolbuttonSwaptype',
    'smolbuttontype:hover',
    'inlineboxtype',
    'buttondarktype',
    'limelightdarktype',
    'inlineboxdarktype',
    'arrowtype',
  ],
  pokecolumns = [];
for (let e = 0; e < 5; e++) pokecolumns.push(document.getElementById('pokecolumn' + (e + 1)));
let regionToSingle = function (_0x1bc850) {
    const _0x15fc39 = {
      najgf: 'regionb',
    };
    (_0x1bc850.classList.remove('region'), _0x1bc850.classList.add(_0x15fc39['najgf']));
  },
  regionToAll = function (_0x58d324) {
    (_0x58d324.classList.add('region'), _0x58d324.classList.remove('regionb'));
  };

function resetQuiz() {
  quiz['reset']();
}

resetBtn['onclick'] = resetQuiz;
let emptyLeaderboard = function () {
  let _0x24bf2a = document.getElementById('leaderboard');
  for (; _0x24bf2a['firstChild'];) _0x24bf2a.removeChild(_0x24bf2a['firstChild']);
};

function changeFooterPosition() {
  const _0x419526 = {
    dPEHQ: function (_0x16da5d, _0x5d6157) {
      return _0x16da5d < _0x5d6157;
    },
    trpNk: 'relative',
    yJunt: function (_0x58846d, _0x19be9a) {
      return _0x58846d - _0x19be9a;
    },
  };
  _0x419526['dPEHQ'](main['scrollHeight'], _0x419526['yJunt'](window['innerHeight'], 0x45) - footer['scrollHeight'])
    ? (footer['style']['position'] = 'fixed')
    : (footer['style']['position'] = _0x419526['trpNk']);
}

function off() {
  const _0x570f7f = {
    KACdl: 'none',
    qVova: 'overlay',
  };
  document.getElementById(_0x570f7f['qVova']).style.display = _0x570f7f['KACdl'];
}

function off2() {
  const _0x4ba84f = {
    MALsB: 'startfull',
    QeMeg: 'none',
    UKHyQ: 'inputbox',
    crdtF: 'genselection',
    glfjE: 'starttype',
    oupwz: 'attentionshake',
  };
  ((document.getElementById('loadbox').style.display = _0x4ba84f['QeMeg']),
    (document.getElementById(_0x4ba84f['MALsB']).style.display = 'none'),
    (document.getElementById(_0x4ba84f['glfjE']).style.display = _0x4ba84f['QeMeg']),
    (document.getElementById(_0x4ba84f['crdtF']).style.display = _0x4ba84f['QeMeg']),
    (document.getElementById('typeselection').style.display = _0x4ba84f['QeMeg']),
    document.getElementById(_0x4ba84f['UKHyQ']).classList.add(_0x4ba84f['oupwz']),
    inputField['focus']());
}

function off3() {
  const _0x27a0cd = {
    dVDqV: 'none',
    kfKDG: 'promptchaos-enable',
    qvAGs: 'promptsilhouette',
    sGSnw: 'promptorder-disable',
  };
  ((document.getElementById('promptswitch').style.display = 'none'),
    (document.getElementById('prompttimer').style.display = 'none'),
    (document.getElementById('promptsilhouette').style.display = 'none'),
    (document.getElementById(_0x27a0cd['qvAGs']).style.display = 'none'),
    (document.getElementById('promptorder-enable').style.display = 'none'),
    (document.getElementById(_0x27a0cd['sGSnw']).style.display = _0x27a0cd['dVDqV']),
    (document.getElementById(_0x27a0cd['kfKDG']).style.display = 'none'));
}

function genselectmenu() {
  document.getElementById('genselection').style.display = 'block';
}

function typeselectmenu() {
  document.getElementById('typeselection').style.display = 'block';
}

function typeselectmenuInitial() {
  const _0x230cf3 = {
    FNaia: 'none',
    TTxkH: 'genselection',
  };
  ((document.getElementById(_0x230cf3['TTxkH']).style.display = _0x230cf3['FNaia']),
    (document.getElementById('typeselection').style.display = 'block'));
}

function twitchopen() {
  const _0x5f7bd0 = {
    VQECD: 'default',
    XzEXa: 'twitch-coll',
    hfuBt: 'inline-block',
  };
  ((document.getElementById(_0x5f7bd0['XzEXa']).style.display = _0x5f7bd0['hfuBt']),
    (document.getElementById('twitch-open').style.display = 'none'),
    (document.getElementById('twitch-bar')['style']['cursor'] = _0x5f7bd0['VQECD']));
}

function twitchclose() {
  const _0x5159fe = {
    SJfJd: 'inline-block',
    UPfNr: 'twitch-coll',
    rNMUq: 'twitch-bar',
    vxXwm: 'pointer',
  };
  ((document.getElementById(_0x5159fe['UPfNr']).style.display = 'none'),
    (document.getElementById('twitch-open').style.display = _0x5159fe['SJfJd']),
    (document.getElementById(_0x5159fe['rNMUq'])['style']['cursor'] = _0x5159fe['vxXwm']));
}

function orderopen() {
  const _0x36ec39 = {
    YFvym: 'order-coll',
    iYFrr: 'order-bar',
    nQjrp: 'inline-block',
  };
  ((document.getElementById(_0x36ec39['YFvym']).style.display = _0x36ec39['nQjrp']),
    (document.getElementById('order-open').style.display = 'none'),
    (document.getElementById(_0x36ec39['iYFrr'])['style']['cursor'] = 'default'));
}

function orderclose() {
  const _0x5be094 = {
    GmXpL: 'order-bar',
    Uertp: 'order-coll',
    uWdpx: 'none',
  };
  ((document.getElementById(_0x5be094['Uertp']).style.display = _0x5be094['uWdpx']),
    (document.getElementById('order-open').style.display = 'inline-block'),
    (document.getElementById(_0x5be094['GmXpL'])['style']['cursor'] = 'pointer'));
}

function gen0click() {
  const _0x5d7b19 = {
    RQvml: function (_0x11a2a, _0x5b1b7a) {
      return _0x11a2a === _0x5b1b7a;
    },
    lQKyD: function (_0x13e25a, _0x2a8c2c) {
      return _0x13e25a === _0x2a8c2c;
    },
    plueD: 'Full',
    tGQZe: 'gen0',
  };
  (_0x5d7b19['RQvml']('', quiz['getStyleName']()) && _0x5d7b19['lQKyD'](_0x5d7b19['plueD'], quiz.name)) ||
    document.getElementById(_0x5d7b19['tGQZe']).click();
}

function swapShiny() {
  const _0x48d716 = {
    TFBQS: 'smolbuttonx',
  };
  document.getElementById('shiny')['classList']['contains'](_0x48d716['TFBQS']) ? shinyOff() : shinyOn();
}

function shinyOn() {
  const _0x299ee2 = {
    esvVG: 'shiny',
  };
  (visualizeButtonClick(document.getElementById(_0x299ee2['esvVG'])), quiz['shinyOn']());
}

function shinyOff() {
  const _0x405c11 = {
    FmjBF: function (_0x1e47eb, _0x215134) {
      return _0x1e47eb(_0x215134);
    },
  };
  (_0x405c11['FmjBF'](visualizeButtonUnclick, document.getElementById('shiny')), quiz['shinyOff']());
}

(window['addEventListener'](
  'resize',
  function () {
    const _0x459c69 = {
      AgiIl: function (_0x567540) {
        return _0x567540();
      },
    };
    _0x459c69['AgiIl'](changeFooterPosition);
  },
  false,
),
  window['addEventListener'](
    'orientationchange',
    function () {
      const _0x1f8b50 = {
        hlWqM: function (_0x4ef3b2) {
          return _0x4ef3b2();
        },
      };
      _0x1f8b50['hlWqM'](changeFooterPosition);
    },
    false,
  ),
  (document.getElementById('shiny')['onclick'] = swapShiny),
  (recentSprite.src = '/sprites/unknown.png'),
  recentSprite['addEventListener'](
    'load',
    function () {
      const _0x3acadb = {
        XTfUh: function (_0x65f37d) {
          return _0x65f37d();
        },
      };
      _0x3acadb['XTfUh'](changeFooterPosition);
    },
    false,
  ));
let animationCanvasWidth,
  imageRain = function (_0x59e041, _0xb74956, _0x3ab7c5) {
    const _0x34dc85 = {
      DJUKU: '0px',
      OEfTZ: function (_0xa8cffc, _0x1057ef, _0x2bcfad) {
        return _0xa8cffc(_0x1057ef, _0x2bcfad);
      },
      amUcQ: function (_0x19e1fb, _0x3f0bf3, _0xb05210) {
        return _0x19e1fb(_0x3f0bf3, _0xb05210);
      },
      bemEh: function (_0x5ba000, _0x5e55b8, _0x142258) {
        return _0x5ba000(_0x5e55b8, _0x142258);
      },
      fczvL: function (_0x1e8e04, _0x46c5d5, _0x356cf4) {
        return _0x1e8e04(_0x46c5d5, _0x356cf4);
      },
      jJZSF: 'absolute',
      jJgaU: function (_0x55e88b, _0x12ec89) {
        return _0x55e88b + _0x12ec89;
      },
      sWirh: function (_0x40c3c7, _0x3064b3) {
        return _0x40c3c7 / _0x3064b3;
      },
      vaFoo: function (_0x3d8a5b, _0x13c4ec) {
        return _0x3d8a5b / _0x13c4ec;
      },
      xtCZa: function (_0x239d94, _0x22f3d7) {
        return _0x239d94 < _0x22f3d7;
      },
      yWCIx: function (_0x1a0bbb, _0xe5aa91) {
        return _0x1a0bbb * _0xe5aa91;
      },
    };
    let _0x2f72e4 = document.createElement('canvas');
    ((_0x2f72e4['style']['position'] = _0x34dc85['jJZSF']),
      (_0x2f72e4['style']['top'] = '0px'),
      (_0x2f72e4['style']['left'] = _0x34dc85['DJUKU']),
      (_0x2f72e4['style']['z-index'] = 0x3),
      (_0x2f72e4['width'] = document['documentElement']['clientWidth']),
      (_0x2f72e4['height'] = document['documentElement']['scrollHeight']),
      document.body.appendChild(_0x2f72e4));
    let _0x281b5b = _0x2f72e4['getContext']('2d'),
      _0x19bd11 = [];
    for (let _0x191ec4 = 0; _0x191ec4 < _0xb74956; _0x191ec4++) {
      let _0x1ce4c6 = _0x34dc85['OEfTZ'](
          randomIntFromInterval,
          -0xc8,
          _0x34dc85['jJgaU'](document['documentElement']['clientWidth'], 0xc8),
        ),
        _0x470a4a = randomIntFromInterval(-0x7d0, -0x1c2),
        _0x1660e9 = _0x34dc85['OEfTZ'](randomIntFromInterval, 0x1770, 0x2ee0),
        _0x3961bd = _0x34dc85['OEfTZ'](
          randomIntFromInterval,
          Math['round'](0.8 * _0x3ab7c5),
          Math['round'](_0x34dc85['yWCIx'](1.2, _0x3ab7c5)),
        ),
        _0x471771 = randomIntFromInterval(0, 0x168),
        _0x54f55f = _0x34dc85['bemEh'](randomIntFromInterval, -0x7d0, 0x7d0);
      _0x19bd11.push([_0x1ce4c6, _0x470a4a, _0x1660e9, _0x3961bd, _0x471771, _0x54f55f]);
    }
    let _0x27e3f4 = 0;
    for (let _0x449b41 = 0; _0x449b41 < 0x168; _0x449b41++) {
      (_0x34dc85['fczvL'](
        setTimeout,
        () => {
          _0x281b5b['clearRect'](0, 0, _0x2f72e4['width'], _0x2f72e4['height']);
          for (let _0x59aa47 = 0; _0x34dc85['xtCZa'](_0x59aa47, _0x19bd11.length); _0x59aa47++)
            ((_0x19bd11[_0x59aa47][1] += _0x34dc85['sWirh'](_0x19bd11[_0x59aa47][0x2], 1000)),
              (_0x19bd11[_0x59aa47][0x2] *= 1.005),
              _0x281b5b['save'](),
              _0x281b5b['translate'](_0x19bd11[_0x59aa47][0], _0x19bd11[_0x59aa47][1]),
              _0x281b5b['rotate'](_0x19bd11[_0x59aa47][0x4] * (Math['PI'] / 0xb4)),
              (_0x19bd11[_0x59aa47][0x4] += _0x19bd11[_0x59aa47][5] / 1000),
              _0x281b5b['drawImage'](
                _0x59e041,
                -_0x19bd11[_0x59aa47][0x3] / 0x2,
                _0x34dc85['vaFoo'](-_0x19bd11[_0x59aa47][0x3], 0x2),
                _0x19bd11[_0x59aa47][0x3],
                _0x19bd11[_0x59aa47][0x3],
              ),
              _0x281b5b['restore']());
        },
        _0x27e3f4,
      ),
        (_0x27e3f4 += 16.666666666666668));
    }
    _0x34dc85['amUcQ'](
      setTimeout,
      () => {
        document.body.removeChild(_0x2f72e4);
      },
      _0x27e3f4,
    );
  },
  animationCanvas = null,
  _animationCanvasTimeout = null,
  animationCanvasInterval = null,
  animationCanvasDuration = 0x1676,
  animationWidth = 0xcc,
  animationHeight = 0xa8,
  ongoingAnimations = [],
  refreshAnimationCanvas = function () {
    const _0x386188 = {
      JoNqJ: function (_0x364215, _0x18241b, _0x416a72) {
        return _0x364215(_0x18241b, _0x416a72);
      },
      LNRSv: function (_0x3cb4fe, _0x784b83) {
        return _0x3cb4fe < _0x784b83;
      },
      NRFKS: function (_0x75906b, _0x3db310) {
        return _0x75906b / _0x3db310;
      },
      NknEO: function (_0x44b782, _0x40faac) {
        return _0x44b782 / _0x40faac;
      },
      TmGSe: '0px',
      gOEzz: 'canvas',
      wfKCl: function (_0x10db63, _0x49af6a) {
        return _0x10db63 / _0x49af6a;
      },
    };
    (null !== _animationCanvasTimeout && clearInterval(_animationCanvasTimeout),
      null === animationCanvas &&
        ((animationCanvas = document.createElement(_0x386188['gOEzz'])),
        (animationCanvas['style']['position'] = 'absolute'),
        (animationCanvas['style']['top'] = _0x386188['TmGSe']),
        (animationCanvas['style']['left'] = _0x386188['TmGSe']),
        (animationCanvas['style']['z-index'] = 5),
        (animationCanvasWidth = document['documentElement']['clientWidth']),
        (animationCanvas['width'] = animationCanvasWidth),
        (animationCanvas['height'] = document['documentElement']['clientHeight']),
        document.body.appendChild(animationCanvas),
        (animationCanvasInterval = _0x386188['JoNqJ'](
          setInterval,
          () => {
            let _0x196c7c = animationCanvas['getContext']('2d');
            _0x196c7c['clearRect'](0, 0, animationCanvas['width'], animationCanvas['height']);
            for (let _0xe2039c = 0; _0xe2039c < ongoingAnimations.length; _0xe2039c++)
              _0x386188['LNRSv'](ongoingAnimations[_0xe2039c][1], animationCanvas['height']) &&
                ((ongoingAnimations[_0xe2039c][1] += ongoingAnimations[_0xe2039c][0x2] / 1000),
                (ongoingAnimations[_0xe2039c][0x2] *= 1.005),
                _0x196c7c['save'](),
                _0x196c7c['translate'](ongoingAnimations[_0xe2039c][0], ongoingAnimations[_0xe2039c][1]),
                _0x196c7c['rotate'](ongoingAnimations[_0xe2039c][0x3] * (Math['PI'] / 0xb4)),
                (ongoingAnimations[_0xe2039c][0x3] += ongoingAnimations[_0xe2039c][0x4] / 1000),
                _0x196c7c['drawImage'](
                  ongoingAnimations[_0xe2039c][5],
                  _0x386188['NRFKS'](-animationWidth, 0x2),
                  _0x386188['wfKCl'](-animationHeight, 0x2),
                  animationWidth,
                  animationHeight,
                ),
                _0x196c7c['restore']());
          },
          _0x386188['NknEO'](1000, 0x3c),
        ))),
      (_animationCanvasTimeout = setTimeout(() => {
        (animationCanvas['remove'](),
          (animationCanvas = null),
          (_animationCanvasTimeout = null),
          (ongoingAnimations = []),
          null !== animationCanvasInterval && clearInterval(animationCanvasInterval));
      }, animationCanvasDuration)));
  },
  animateInput = function (_0x4aabe7) {
    const _0x1341ad = {
      WtRDu: function (_0x3fd1dc, _0x1eaa71, _0x11012c) {
        return _0x3fd1dc(_0x1eaa71, _0x11012c);
      },
      wPpsm: function (_0x7049cb, _0x4f1d0b) {
        return _0x7049cb - _0x4f1d0b;
      },
    };
    refreshAnimationCanvas();
    let _0x194841 = _0x1341ad['WtRDu'](
        randomIntFromInterval,
        animationWidth / 0x2,
        _0x1341ad['wPpsm'](animationCanvasWidth, animationWidth / 0x2),
      ),
      _0x18c21f = randomIntFromInterval(-3500, 1.5 * -animationWidth),
      _0x353ccd = _0x1341ad['WtRDu'](randomIntFromInterval, 0x1b58, 0x251c),
      _0x4541a2 = _0x1341ad['WtRDu'](randomIntFromInterval, 0, 0x168),
      _0x55e53f = randomIntFromInterval(-0x7d0, 0x7d0);
    ongoingAnimations.push([_0x194841, _0x18c21f, _0x353ccd, _0x4541a2, _0x55e53f, quiz.spriteDictionary[_0x4aabe7]]);
  };
document.getElementById('accordion')['onclick'] = function () {
  const _0x231d01 = {
    CSFpk: 'block',
    Nxbit: function (_0x18793e, _0x3e5f5f) {
      return _0x18793e < _0x3e5f5f;
    },
    cErGj: 'arrow',
    ciqKD: function (_0x58c74d, _0x2e0f3b) {
      return _0x58c74d < _0x2e0f3b;
    },
    jkolG: function (_0x19ce7a, _0x1166a3) {
      return _0x19ce7a != _0x1166a3;
    },
    swCuS: 'none',
    xjMXo: 'panel',
  };
  if (_0x231d01['CSFpk'] == document.getElementById('panel').style.display) {
    ((document.getElementById(_0x231d01['xjMXo']).style.display = 'none'),
      document.getElementById(_0x231d01['cErGj']).classList.add('adown'),
      document.getElementById('arrow').classList.remove('aup'));
    let _0xfd5434 = document.getElementById('panel')['childNodes'];
    for (let _0x17a7cc = 0; _0x231d01['Nxbit'](_0x17a7cc, _0xfd5434.length); _0x17a7cc++)
      _0xfd5434[_0x17a7cc].style.display = 'block';
  } else {
    ((document.getElementById(_0x231d01['xjMXo']).style.display = _0x231d01['CSFpk']),
      document.getElementById(_0x231d01['cErGj']).classList.add('aup'),
      document.getElementById('arrow').classList.remove('adown'));
    let _0x4f63e9 = document.getElementById('panel')['childNodes'];
    for (let _0x2f350d = 0; _0x231d01['ciqKD'](_0x2f350d, _0x4f63e9.length); _0x2f350d++) {
      let _0xfbec96 = _0x4f63e9[_0x2f350d]['childNodes'][0]['childNodes'],
        _0x1adca0 = false;
      for (let _0x408611 = 0; _0x408611 < _0xfbec96.length; _0x408611++)
        if (_0x231d01['jkolG'](_0x231d01['swCuS'], _0xfbec96[_0x408611].style.display)) {
          _0x1adca0 = true;
          break;
        }
      _0x4f63e9[_0x2f350d].style.display = _0x1adca0 ? _0x231d01['CSFpk'] : _0x231d01['swCuS'];
    }
  }
  changeFooterPosition();
};
let sortDictionaryByValue = function (_0xedffb2) {
  let _0x5ba6c2 = Object['entries'](_0xedffb2);
  return (sorted = _0x5ba6c2['sort']((_0x5b7b5a, _0x17d999) => _0x17d999[1] - _0x5b7b5a[1]));
};

function creditspopup() {
  const _0x7c1901 = {
    kgoxl: 'credits',
    mopqM: 'show',
  };
  document.getElementById(_0x7c1901['kgoxl'])['classList']['toggle'](_0x7c1901['mopqM']);
}

((document.getElementById('darkon')['onclick'] = function () {
  const _0x257cc0 = {
    CnJxd: function (_0x1e8786, _0x56f9cb) {
      return _0x1e8786(_0x56f9cb);
    },
    GTuPa: 'button',
    ItuuG: 'smolbuttondark',
    KysQi: 'smolbuttonxdark',
    LHaLx: 'blend',
    MZCGe: 'buttondark',
    PaPIa: 'spbutton',
    Thlwo: 'smolbuttonx',
    YaxNP: function (_0xa90dbf, _0xfe3a7) {
      return _0xa90dbf < _0xfe3a7;
    },
    aukTC: 'inlinebox',
    ccgpC: 'darkoff',
    jGrqy: function (_0x28a28e, _0x5be414) {
      return _0x28a28e < _0x5be414;
    },
    qlNCD: 'darkon',
    qyUXS: function (_0x3ec53c, _0x52b9d2) {
      return _0x3ec53c < _0x52b9d2;
    },
    tPTKz: '/sprites/unknown-2.png',
    tZWSs: function (_0x5803b9, _0x5206a5) {
      return _0x5803b9(_0x5206a5);
    },
    uaNqh: 'inlineboxdark',
    ukCml: 'dark',
    vqsyo: 'body',
  };
  if (!darkMode) {
    ((darkMode = !darkMode),
      _0x257cc0['CnJxd'](visualizeButtonUnclick, document.getElementById(_0x257cc0['ccgpC'])),
      _0x257cc0['tZWSs'](visualizeButtonClick, document.getElementById(_0x257cc0['qlNCD'])),
      (document.getElementById(_0x257cc0['qlNCD']).style.display = 'none'),
      (document.getElementById('darkoff').style.display = 'inline'),
      document.getElementById(_0x257cc0['vqsyo']).classList.add('bodydark'));
    let _0x318602 = document.getElementsByClassName('box');
    for (let _0x160f96 = 0; _0x257cc0['YaxNP'](_0x160f96, _0x318602.length); _0x160f96++)
      _0x318602[_0x160f96].classList.add('boxdark');
    let _0x52d939 = document.getElementsByClassName('smolbutton');
    for (let _0x4e0147 = 0; _0x4e0147 < _0x52d939.length; _0x4e0147++)
      _0x52d939[_0x4e0147].classList.add(_0x257cc0['ItuuG']);
    let _0x58eb5b = document.getElementsByClassName(_0x257cc0['Thlwo']);
    for (let _0x47a5af = 0; _0x257cc0['qyUXS'](_0x47a5af, _0x58eb5b.length); _0x47a5af++)
      _0x58eb5b[_0x47a5af].classList.add(_0x257cc0['KysQi']);
    let _0xdd4491 = document.getElementsByClassName(_0x257cc0['GTuPa']);
    for (let _0x44e44e = 0; _0x44e44e < _0xdd4491.length; _0x44e44e++)
      _0xdd4491[_0x44e44e].classList.add(_0x257cc0['MZCGe']);
    let _0x395216 = document.getElementsByClassName('limelight');
    for (let _0x4cd0c4 = 0; _0x257cc0['YaxNP'](_0x4cd0c4, _0x395216.length); _0x4cd0c4++)
      _0x395216[_0x4cd0c4].classList.add('limelightdark');
    let _0x5eebf8 = document.getElementsByClassName('greyer');
    for (let _0x21d572 = 0; _0x21d572 < _0x5eebf8.length; _0x21d572++) _0x5eebf8[_0x21d572].classList.add('greyerdark');
    let _0x16296b = document.getElementsByClassName(_0x257cc0['aukTC']);
    for (let _0x1be6e7 = 0; _0x1be6e7 < _0x16296b.length; _0x1be6e7++)
      _0x16296b[_0x1be6e7].classList.add(_0x257cc0['uaNqh']);
    let _0x1fdd94 = document.getElementsByClassName(_0x257cc0['PaPIa']);
    for (let _0xbb1e80 = 0; _0xbb1e80 < _0x1fdd94.length; _0xbb1e80++) _0x1fdd94[_0xbb1e80].classList.add('buttondark');
    for (let _0x234da2 = 0; _0x234da2 < quiz['pokeballArray'].length; _0x234da2++)
      quiz['pokeballArray'][_0x234da2].src = _0x257cc0['tPTKz'];
    if (((recentSprite.src = _0x257cc0['tPTKz']), '' !== quiz['getStyleName']())) {
      (document.getElementById('body').classList.add('blenddark'),
        document.getElementById(_0x257cc0['vqsyo']).classList.remove(_0x257cc0['LHaLx']));
      for (let _0x2b927b = 0; _0x257cc0['jGrqy'](_0x2b927b, typeClasses.length); _0x2b927b++) {
        let _0x1ed631 = typeClasses[_0x2b927b];
        if (!_0x1ed631.includes(_0x257cc0['ukCml'])) {
          continue;
        }
        let _0x5544b7 = quiz['getStyleName'](),
          _0x40edc8 = document.getElementsByClassName(_0x1ed631.replace('type', ''));
        for (let _0x32d2c8 = 0; _0x32d2c8 < _0x40edc8.length; _0x32d2c8++)
          _0x40edc8[_0x32d2c8].classList.add(_0x1ed631.replace('type', _0x5544b7));
      }
    }
  }
}),
  (document.getElementById('darkoff')['onclick'] = function () {
    const _0x4736b4 = {
      BRlnQ: 'blenddark',
      DlLHK: 'body',
      HdZQB: 'inlineboxdark',
      IwmYT: 'smolbuttondark',
      LsGxZ: 'dark',
      OphgS: 'buttondark',
      UTFxo: 'darkoff',
      dVtJG: 'inline',
      djIbV: 'smolbutton',
      euKXt: function (_0x1dcab3, _0x2e3379) {
        return _0x1dcab3 < _0x2e3379;
      },
      kWEhF: function (_0x417bfe, _0x2ce8d6) {
        return _0x417bfe(_0x2ce8d6);
      },
      zMaUf: 'darkon',
      ziSTe: function (_0x510b8f, _0x234975) {
        return _0x510b8f < _0x234975;
      },
    };
    if (darkMode) {
      if (((darkMode = !darkMode), '' !== quiz['getStyleName']())) {
        (document.getElementById(_0x4736b4['DlLHK']).classList.remove(_0x4736b4['BRlnQ']),
          document.getElementById(_0x4736b4['DlLHK']).classList.add('blend'));
        for (let _0x3db8e5 = 0; _0x4736b4['euKXt'](_0x3db8e5, typeClasses.length); _0x3db8e5++) {
          let _0x2ab79e = typeClasses[_0x3db8e5];
          if (!_0x2ab79e.includes(_0x4736b4['LsGxZ'])) {
            continue;
          }
          let _0x442475 = quiz['getStyleName'](),
            _0x4e684c = (_0x2ab79e.replace('type', ''), document.getElementsByClassName(_0x2ab79e.replace('type', '')));
          for (let _0x586f60 = 0; _0x586f60 < _0x4e684c.length; _0x586f60++)
            _0x4e684c[_0x586f60].classList.remove(_0x2ab79e.replace('type', _0x442475));
        }
      }
      (_0x4736b4['kWEhF'](visualizeButtonUnclick, document.getElementById(_0x4736b4['zMaUf'])),
        visualizeButtonClick(document.getElementById('darkoff')),
        (document.getElementById(_0x4736b4['UTFxo']).style.display = 'none'),
        (document.getElementById(_0x4736b4['zMaUf']).style.display = _0x4736b4['dVtJG']),
        document.getElementById('body').classList.remove('bodydark'));
      let _0xa29faa = document.getElementsByClassName('box');
      for (let _0xad0f8b = 0; _0x4736b4['euKXt'](_0xad0f8b, _0xa29faa.length); _0xad0f8b++)
        _0xa29faa[_0xad0f8b].classList.remove('boxdark');
      let _0x404b4a = document.getElementsByClassName('button');
      for (let _0x18bddd = 0; _0x4736b4['euKXt'](_0x18bddd, _0x404b4a.length); _0x18bddd++)
        _0x404b4a[_0x18bddd].classList.remove(_0x4736b4['OphgS']);
      let _0xeba669 = document.getElementsByClassName(_0x4736b4['djIbV']);
      for (let _0x57358d = 0; _0x57358d < _0xeba669.length; _0x57358d++)
        _0xeba669[_0x57358d].classList.remove(_0x4736b4['IwmYT']);
      let _0x2cd548 = document.getElementsByClassName('smolbuttonx');
      for (let _0x4f67a0 = 0; _0x4f67a0 < _0x2cd548.length; _0x4f67a0++)
        _0x2cd548[_0x4f67a0].classList.remove('smolbuttonxdark');
      let _0x6c2cc7 = document.getElementsByClassName('limelight');
      for (let _0x4f5808 = 0; _0x4736b4['ziSTe'](_0x4f5808, _0x6c2cc7.length); _0x4f5808++)
        _0x6c2cc7[_0x4f5808].classList.remove('limelightdark');
      let _0x672b96 = document.getElementsByClassName('greyer');
      for (let _0x361d9e = 0; _0x361d9e < _0x672b96.length; _0x361d9e++)
        _0x672b96[_0x361d9e].classList.remove('greyerdark');
      let _0x1487af = document.getElementsByClassName('inlinebox');
      for (let _0x337e96 = 0; _0x4736b4['euKXt'](_0x337e96, _0x1487af.length); _0x337e96++)
        _0x1487af[_0x337e96].classList.remove(_0x4736b4['HdZQB']);
      let _0x3f8088 = document.getElementsByClassName('spbutton');
      for (let _0x311364 = 0; _0x4736b4['ziSTe'](_0x311364, _0x3f8088.length); _0x311364++)
        _0x3f8088[_0x311364].classList.remove(_0x4736b4['OphgS']);
      for (let _0x2a29c0 = 0; _0x2a29c0 < quiz['pokeballArray'].length; _0x2a29c0++)
        quiz['pokeballArray'][_0x2a29c0].src = '/sprites/unknown.png';
      recentSprite.src = '/sprites/unknown.png';
    }
  }));
let enabledLanguages = [],
  disableLanguage = function () {},
  enableLanguage = function (_0xf2cd71) {
    const _0x2ad28a = {
      CJKnP: function (_0x2552f7, _0x5f2d55) {
        return _0x2552f7(_0x5f2d55);
      },
      ieEcO: function (_0x5c225d, _0x12f4f1) {
        return _0x5c225d(_0x12f4f1);
      },
    };
    (enabledLanguages.push(_0xf2cd71.id),
      visualizeButtonClick(_0xf2cd71),
      (_0xf2cd71['onclick'] = function () {
        ('ENG' === _0xf2cd71.id && (langButtonsDict['ESP'].click(), langButtonsDict['ITA'].click()),
          _0x2ad28a['CJKnP'](disableLanguage, _0xf2cd71));
      }),
      false !== _updateTimeout && _0x2ad28a['ieEcO'](clearTimeout, _updateTimeout),
      (_updateTimeout = setTimeout(() => {
        (quiz['updateLanguages'](enabledLanguages), (_updateTimeout = false));
      }, 0x1f4)));
  },
  _updateTimeout = false;
disableLanguage = function (_0x44f467) {
  const _0x3c38e5 = {
    CsoZJ: function (_0x202271, _0x2c1bed) {
      return _0x202271(_0x2c1bed);
    },
    GcRHX: 'ENG',
    MBevU: function (_0x18228b, _0x5c15f6) {
      return _0x18228b === _0x5c15f6;
    },
    XEqCl: function (_0x2634d3, _0x35be57, _0x466276) {
      return _0x2634d3(_0x35be57, _0x466276);
    },
    lkube: function (_0x2633a1, _0x12f6aa) {
      return _0x2633a1 > _0x12f6aa;
    },
    mPNpE: function (_0x510e48, _0x4d3147) {
      return _0x510e48 !== _0x4d3147;
    },
  };
  if (_0x3c38e5['lkube'](enabledLanguages.length, 1)) {
    let _0x24dc7e = enabledLanguages.indexOf(_0x44f467.id);
    (_0x3c38e5['lkube'](_0x24dc7e, -1) && enabledLanguages['splice'](_0x24dc7e, 1),
      visualizeButtonUnclick(_0x44f467),
      (_0x44f467['onclick'] = function () {
        (_0x3c38e5['MBevU'](_0x3c38e5['GcRHX'], _0x44f467.id) &&
          (langButtonsDict['ESP'].click(), langButtonsDict['ITA'].click()),
          enableLanguage(_0x44f467));
      }),
      _0x3c38e5['mPNpE'](false, _updateTimeout) && _0x3c38e5['CsoZJ'](clearTimeout, _updateTimeout),
      (_updateTimeout = _0x3c38e5['XEqCl'](
        setTimeout,
        () => {
          (quiz['updateLanguages'](enabledLanguages), (_updateTimeout = false));
        },
        0x1f4,
      )));
  }
};
let langButtonsDict = {};
for (let e of allLanguages) {
  let t = document.createElement('div');
  ((t.innerHTML += e),
    t.classList.add('smolbutton'),
    t.classList.add('langbutton'),
    (t.id = e),
    (t['onclick'] = function () {
      enableLanguage(t);
    }),
    (langButtonsDict[e] = t),
    language_box.appendChild(t));
}
((langButtonsDict['ENG'].innerHTML = 'ENG\x20/\x20ESP\x20/\x20ITA'),
  (langButtonsDict['ENG']['onclick'] = function () {
    const _0x3c80cb = {
      zvDME: function (_0x8ec746, _0x2efb32) {
        return _0x8ec746(_0x2efb32);
      },
    };
    (enableLanguage(langButtonsDict['ENG']),
      enableLanguage(langButtonsDict['ESP']),
      _0x3c80cb['zvDME'](enableLanguage, langButtonsDict['ITA']));
  }),
  (langButtonsDict['ESP'].style.display = 'none'),
  (langButtonsDict['ITA'].style.display = 'none'),
  langButtonsDict['ENG'].click(),
  langButtonsDict['JPN'].click(),
  langButtonsDict['KOR'].click(),
  langButtonsDict['CHT'].click(),
  langButtonsDict['CHS'].click(),
  navigator['language'].includes('de') && langButtonsDict['GER'].click(),
  navigator['language'].includes('fr') && langButtonsDict['FRE'].click(),
  document['addEventListener']('keydown', function (_0x18296e) {
    const _0x127de1 = {
      adDYN: 'Enter',
      npQQD: function (_0x218245, _0x1d9cd8) {
        return _0x218245 !== _0x1d9cd8;
      },
      nuoBv: 'INPUT',
    };
    ((_0x127de1['adDYN'] !== _0x18296e['key'] &&
      _0x127de1['adDYN'] !== _0x18296e['code'] &&
      0xd !== _0x18296e['keyCode']) ||
      (inputField.value = ''),
      _0x127de1['npQQD'](_0x127de1['nuoBv'], document['activeElement']['tagName']) && inputField['focus']());
  }),
  (document.getElementById('sound-on')['onclick'] = () => {
    const _0x44a9dc = {
      Epucx: function (_0x4ec370, _0x483634) {
        return _0x4ec370(_0x483634);
      },
      yQlYI: 'sound-off',
    };
    ((soundEnabled = true),
      visualizeButtonUnclick(document.getElementById(_0x44a9dc['yQlYI'])),
      _0x44a9dc['Epucx'](visualizeButtonClick, document.getElementById('sound-on')));
  }),
  (document.getElementById('sound-off')['onclick'] = () => {
    const _0x310a48 = {
      cnfAR: function (_0x4c57e4, _0xf0d9f4) {
        return _0x4c57e4(_0xf0d9f4);
      },
      kPFGA: 'sound-on',
    };
    ((soundEnabled = false),
      _0x310a48['cnfAR'](visualizeButtonUnclick, document.getElementById(_0x310a48['kPFGA'])),
      _0x310a48['cnfAR'](visualizeButtonClick, document.getElementById('sound-off')));
  }),
  loadData());

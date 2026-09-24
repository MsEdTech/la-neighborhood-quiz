let map = null;
let streetLabels = null;
let geojsonLayer = null;
let score = 0;
let draggedItem = null;
let fullGeoData = null;
let currentRegionKey = null;

// Defined Region Lists
const REGIONS = {
  westside: {
    title: "Westside & Coastal",
    description: "Santa Monica, Venice, Brentwood, Westwood, Beverly Hills, Culver City, Del Rey, Westchester, etc.",
    center: [34.01, -118.42],
    zoom: 11.5,
    list: [
      "Bel-Air", "Beverly Crest", "Beverly Grove", "Beverly Hills", "Beverlywood", "Brentwood", 
      "Century City", "Cheviot Hills", "Culver City", "Del Rey", "Ladera Heights", "Mar Vista", 
      "Marina del Rey", "Pacific Palisades", "Palms", "Playa del Rey", "Playa Vista", 
      "Rancho Park", "Santa Monica", "Sawtelle", "Venice", "West Los Angeles", "Westchester", "Westwood"
    ]
  },
  mid_city: {
    title: "Mid-City & West Adams Corridor",
    description: "Mid-City, West Adams, Jefferson Park, Exposition Park, University Park, Pico-Union, etc.",
    center: [34.03, -118.31],
    zoom: 12.25,
    list: [
      "Adams-Normandie", "Arlington Heights", "Carthay", "Exposition Park", "Harvard Heights", 
      "Jefferson Park", "Mid-City", "Mid-Wilshire", "Pico-Union", "University Park", 
      "West Adams", "Westlake"
    ]
  },
  south_la: {
    title: "South LA & South-Central",
    description: "Leimert Park, Baldwin Hills, Crenshaw, Vermont Square, Watts, Florence-Firestone, Huntington Park, etc.",
    center: [33.97, -118.28],
    zoom: 11.75,
    list: [
      "Athens", "Baldwin Hills/Crenshaw", "Broadway-Manchester", "Central-Alameda", 
      "Chesterfield Square", "Florence", "Florence-Firestone", "Gramercy Park", 
      "Historic South-Central", "Huntington Park", "Hyde Park", "Leimert Park", "Manchester Square", 
      "South Park", "Unincorporated South Los Angeles", "Vermont Knolls", 
      "Vermont Square", "Vermont-Slauson", "Vermont Vista", "View Park-Windsor Hills", 
      "Watts", "Westmont", "Willowbrook"
    ]
  },
  gateway: {
    title: "Gateway & Southeast Cities",
    description: "East LA, Huntington Park, South Gate, Downey, Norwalk, Whittier, Montebello, Cerritos, etc.",
    center: [33.96, -118.12],
    zoom: 11,
    list: [
      "Artesia", "Bell", "Bell Gardens", "Cerritos", "Commerce", "Cudahy", "Downey", 
      "East Los Angeles", "Hawaiian Gardens", "Huntington Park", "La Mirada", "Lynwood", 
      "Maywood", "Montebello", "Norwalk", "Paramount", "Pico Rivera", "Santa Fe Springs", 
      "South Gate", "Vernon", "Walnut Park", "Whittier"
    ]
  },
  south_bay: {
    title: "South Bay & Harbor",
    description: "Inglewood, Hawthorne, Gardena, Compton, Torrance, Carson, West Carson, San Pedro, Long Beach, etc.",
    center: [33.85, -118.28],
    zoom: 10.75,
    list: [
      "Alondra Park", "Avalon", "Carson", "Compton", "El Segundo", "Gardena", "Harbor City", 
      "Harbor Gateway", "Hawthorne", "Hermosa Beach", "Inglewood", "Lawndale", "Lennox", 
      "Lomita", "Long Beach", "Manhattan Beach", "Palos Verdes Estates", "Rancho Palos Verdes", 
      "Redondo Beach", "Rolling Hills", "Rolling Hills Estates", "San Pedro", "Signal Hill", 
      "Torrance", "West Carson", "Wilmington"
    ]
  },
  central: {
    title: "Central LA & Hollywood",
    description: "Hollywood, K-Town, Downtown, Silver Lake, Griffith Park, Hancock Park, Windsor Square, etc.",
    center: [34.07, -118.28],
    zoom: 11.75,
    list: [
      "Atwater Village", "Boyle Heights", "Chinatown", "Downtown", "East Hollywood", 
      "Echo Park", "Elysian Park", "Elysian Valley", "Fairfax", "Griffith Park", 
      "Hancock Park", "Historic Filipinotown", "Hollywood", "Hollywood Hills", 
      "Koreatown", "Larchmont", "Los Feliz", "Silver Lake", "West Hollywood", "Windsor Square"
    ]
  },
  valley: {
    title: "San Fernando Valley",
    description: "Sherman Oaks, Encino, North Hills, Woodland Hills, Calabasas, Sylmar, San Fernando, etc.",
    center: [34.18, -118.50],
    zoom: 10.75,
    list: [
      "Agoura Hills", "Arleta", "Calabasas", "Canoga Park", "Chatsworth", "Encino", 
      "Granada Hills", "Hidden Hills", "Kagel Canyon", "Lake Balboa", "Mission Hills", 
      "North Hills", "North Hollywood", "Northridge", "Pacoima", "Panorama City", 
      "Porter Ranch", "Reseda", "San Fernando", "Sherman Oaks", "Studio City", 
      "Sun Valley", "Sylmar", "Tarzana", "Toluca Lake", "Universal City", 
      "Valley Glen", "Valley Village", "Van Nuys", "Warner Center", "West Hills", 
      "Westlake Village", "Winnetka", "Woodland Hills"
    ]
  },
  northeast: {
    title: "Northeast LA & San Gabriel Valley",
    description: "Highland Park, Pasadena, Glendale, Burbank, Alhambra, Monterey Park, Arcadia, Monrovia, etc.",
    center: [34.14, -118.12],
    zoom: 10.75,
    list: [
      "Alhambra", "Altadena", "Arcadia", "Burbank", "Cypress Park", "Eagle Rock", 
      "El Sereno", "Glassell Park", "Glendale", "Hermon", "Highland Park", 
      "La Cañada Flintridge", "La Crescenta-Montrose", "Lincoln Heights", "Monrovia", 
      "Montecito Heights", "Monterey Park", "Mount Washington", "Pasadena", "Rosemead", 
      "San Gabriel", "San Marino", "Shadow Hills", "Sierra Madre", "South Pasadena", 
      "South San Gabriel", "Sunland", "Temple City", "Tujunga"
    ]
  }
};

const geojsonUrl = 'https://raw.githubusercontent.com/datadesk/mapping-la-data/master/geojson/la-county-neighborhoods-v6.geojson';

function normalizeName(str) {
  return (str || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

document.addEventListener('DOMContentLoaded', () => {
  renderRegionCards();
  
  fetch(geojsonUrl)
    .then(res => res.json())
    .then(data => { fullGeoData = data; })
    .catch(err => console.error("Error fetching GeoJSON:", err));

  document.getElementById('back-btn').addEventListener('click', showSelectionScreen);
  document.getElementById('retry-btn').addEventListener('click', () => {
    hideVictoryModal();
    if (currentRegionKey) loadRegionQuiz(currentRegionKey);
  });
  document.getElementById('change-region-btn').addEventListener('click', () => {
    hideVictoryModal();
    showSelectionScreen();
  });
});

function renderRegionCards() {
  const container = document.getElementById('region-cards-container');
  container.innerHTML = '';

  Object.keys(REGIONS).forEach(key => {
    const region = REGIONS[key];
    const card = document.createElement('div');
    card.className = 'region-card';
    card.innerHTML = `
      <h3>${region.title}</h3>
      <p>${region.description}</p>
    `;
    card.addEventListener('click', () => loadRegionQuiz(key));
    container.appendChild(card);
  });
}

function showSelectionScreen() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('selection-screen').classList.remove('hidden');
  hideVictoryModal();
  score = 0;
}

function hideVictoryModal() {
  document.getElementById('victory-modal').classList.add('hidden');
}

function showVictoryModal(regionTitle, totalScore) {
  document.getElementById('modal-msg').textContent = `You correctly placed all ${totalScore} neighborhoods in ${regionTitle}!`;
  document.getElementById('victory-modal').classList.remove('hidden');
}

function loadRegionQuiz(regionKey) {
  currentRegionKey = regionKey;
  const region = REGIONS[regionKey];
  document.getElementById('selection-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('region-title').textContent = `${region.title} Quiz`;

  if (!map) {
    map = L.map('map', {
      zoomSnap: 0.25,
      zoomDelta: 0.25
    });
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    streetLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      pane: 'overlayPane'
    }).addTo(map);

    streetLabels.on('tileload', function(e) {
      e.tile.style.mixBlendMode = 'multiply';
      e.tile.style.filter = 'contrast(180%) brightness(85%)';
    });
  }

  map.setView(region.center, region.zoom);

  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  if (fullGeoData) {
    setupMapWithData(region, fullGeoData);
  } else {
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(data => {
        fullGeoData = data;
        setupMapWithData(region, data);
      });
  }
}

function setupMapWithData(region, data) {
  score = 0;
  document.getElementById('score').textContent = score;
  const loadedNeighborhoods = [];

  const normalizedRegionList = region.list.map(normalizeName);

  const filteredFeatures = data.features.filter(feature => {
    const nameProp = feature.properties.name || feature.properties.singular || '';
    const norm = normalizeName(nameProp);

    return normalizedRegionList.includes(norm);
  });

  const filteredGeoJSON = {
    type: "FeatureCollection",
    features: filteredFeatures
  };

  geojsonLayer = L.geoJSON(filteredGeoJSON, {
    style: function() {
      return {
        color: '#00e5ff',
        fillColor: '#00b0ff',
        fillOpacity: 0.18,
        weight: 3
      };
    },
    onEachFeature: function(feature, layer) {
      const rawName = feature.properties.name || feature.properties.singular || '';
      
      const matchedConfigName = region.list.find(item => normalizeName(item) === normalizeName(rawName)) || rawName;
      
      loadedNeighborhoods.push(matchedConfigName);

      layer.on('add', () => {
        const el = layer.getElement();
        if (el) {
          el.addEventListener('dragover', (e) => e.preventDefault());
          
          el.addEventListener('mouseenter', () => {
            if (!layer.isMatched) {
              layer.setStyle({ fillOpacity: 0.35, weight: 4, color: '#ffffff' });
            }
          });
          el.addEventListener('mouseleave', () => {
            if (!layer.isMatched) {
              layer.setStyle({ fillOpacity: 0.18, weight: 3, color: '#00e5ff' });
            }
          });

          el.addEventListener('drop', (e) => {
            e.preventDefault();
            const activeBtn = document.querySelector(`.draggable-btn[data-normalized="${normalizeName(draggedItem)}"]`);

            if (normalizeName(draggedItem) === normalizeName(matchedConfigName)) {
              layer.isMatched = true;
              layer.setStyle({ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.55, weight: 3 });
              layer.bindTooltip(matchedConfigName, { permanent: true, direction: 'center', className: 'neighborhood-label' }).openTooltip();
              if (activeBtn) activeBtn.classList.add('matched');

              score++;
              document.getElementById('score').textContent = score;

              if (score === loadedNeighborhoods.length) {
                setTimeout(() => showVictoryModal(region.title, loadedNeighborhoods.length), 300);
              }
            } else {
              layer.setStyle({ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 4 });
              if (activeBtn) {
                activeBtn.classList.add('wrong');
                setTimeout(() => activeBtn.classList.remove('wrong'), 400);
              }
              setTimeout(() => {
                if (!layer.isMatched) {
                  layer.setStyle({ color: '#00e5ff', fillColor: '#00b0ff', fillOpacity: 0.18, weight: 3 });
                }
              }, 400);
            }
          });
        }
      });
    }
  }).addTo(map);

  if (geojsonLayer.getBounds().isValid()) {
    map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20] });
  }

  const bank = document.getElementById('bank');
  bank.innerHTML = '';
  document.getElementById('total').textContent = loadedNeighborhoods.length;

  loadedNeighborhoods.sort().forEach(name => {
    const btn = document.createElement('div');
    btn.className = 'draggable-btn';
    btn.textContent = name;
    btn.draggable = true;
    btn.setAttribute('data-name', name);
    btn.setAttribute('data-normalized', normalizeName(name));

    btn.addEventListener('dragstart', () => { draggedItem = name; btn.classList.add('dragging'); });
    btn.addEventListener('dragend', () => { btn.classList.remove('dragging'); draggedItem = null; });

    bank.appendChild(btn);
  });
}
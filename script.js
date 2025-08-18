const DOM = {
    modal: document.getElementById("elementModal"),
    closeButton: document.querySelector(".close-button"),
    elementLinks: document.querySelectorAll(".element"),
    sBlockBtn: document.getElementById("s-block-btn"),
    pBlockBtn: document.getElementById("p-block-btn"),
    dBlockBtn: document.getElementById("d-block-btn"),
    fBlockBtn: document.getElementById("f-block-btn"),
    resetBtn: document.getElementById("reset-btn"),
    allElements: document.querySelectorAll(".element"),
    searchInput: document.getElementById('searchInput'),
    resultsContainer: document.getElementById('resultsContainer'),
    clearBtn: document.getElementById('clearBtn'),
    searchContainer: document.getElementById('searchContainer'),
    suggestionsContainer: document.getElementById('suggestionsContainer'),
};

let elementsData = []; // This will hold our data once it's loaded

// Asynchronously load the JSON data
async function loadElementsData() {
    try {
        const response = await fetch('elements.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        elementsData = await response.json();
        console.log('Elements data loaded successfully.');
    
    } catch (error) {
        console.error('Could not load elements data:', error);
        DOM.resultsContainer.innerHTML = '<p class="error">Failed to load periodic table data.</p>';
    }
}

// Open the modal
function openModal() {
    DOM.modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    DOM.modal.style.display = "none";
}

// Highlights a specific block on the periodic table.
function highlightBlock(blockClass) {
    DOM.allElements.forEach(element => {
        // Reset all highlighting and dimming classes
        element.classList.remove('s_group_active', 'p_group_active', 'd_group_active', 'f_group_active');
        element.classList.remove('dim-element');
        element.style.border = ''; // Also remove border highlight from search
        element.classList.remove('highlighted');
        if (blockClass) {
            if (element.classList.contains(blockClass)) {
                element.classList.add(`${blockClass}_active`);
            } else {
                element.classList.add('dim-element');
            }
        }
    });
}

// Function to load and display element data in the modal
function loadElementDataIntoModal(symbol) {
    const element = elementsData.find(el => el.symbol.toLowerCase() === symbol.toLowerCase());
    
    if (!element) {
        document.getElementById("modal-name").textContent = "Element Not Found";
        return;
    }

    // Update the element symbol with superscript atomic number and subscript atomic mass
    const atomicNumberForSymbol = element.atomicNumber || "";
    const atomicMassForSymbol = element.atomicMass || "";
    document.getElementById("modal-symbol").innerHTML =
        `<sup class="atomic-num-symbol">${atomicNumberForSymbol}</sup>${element.symbol}<sub class="atomic-mass-symbol">${atomicMassForSymbol}</sub>`;
    
    document.getElementById("modal-name").textContent = element.name;
    document.getElementById("modal-group").textContent = element.group || "N/A";
    document.getElementById("modal-category").textContent = element.category || "N/A";

    let discoveredByText = element.discoveredBy || "N/A";
    let discoveryYearText = "N/A";
    if (element.discoveredBy) {
        const yearMatch = element.discoveredBy.match(/\((\d{4})\)/);
        if (yearMatch && yearMatch[1]) {
            discoveryYearText = yearMatch[1];
            discoveredByText = element.discoveredBy.replace(/\s*\(\d{4}\)\s*/, '').trim();
        }
    }

    document.getElementById("modal-discovered").textContent = discoveredByText;
    document.getElementById("modal-discovery-year").textContent = discoveryYearText;

    // Helper function to handle property display
    const setElementTextAndShow = (id, value, parentRowId = null, unit = '') => {
        const elementSpan = document.getElementById(id);
        const parentRow = parentRowId ? document.getElementById(parentRowId) : null;
        if (value !== null && value !== undefined && value !== "") {
            elementSpan.textContent = `${value}${unit}`;
            if (parentRow) parentRow.style.display = "block";
        } else {
            elementSpan.textContent = "N/A";
            if (parentRow) parentRow.style.display = "none";
        }
    };

    setElementTextAndShow("modal-density", element.density, "modal-density-row", " g/cm³");
    setElementTextAndShow("modal-melting-point", element.meltingPoint, "modal-melting-point-row", " °C");
    setElementTextAndShow("modal-boiling-point", element.boilingPoint, "modal-boiling-point-row", " °C");
    setElementTextAndShow("modal-appearance", element.appearance, "modal-appearance-row");

    const isotopesCardsContainer = document.getElementById("modal-isotopes-cards-container");
    const isotopesHeading = document.getElementById("modal-isotopes-heading");
    isotopesCardsContainer.innerHTML = "";
    if (element.isotopes && element.isotopes.length > 0) {
        isotopesHeading.style.display = "block";
        element.isotopes.forEach(isotope => {
            const isotopeCard = document.createElement("div");
            isotopeCard.className = "isotope-card";
            const isotopeName = document.createElement("h4");
            isotopeName.textContent = isotope.isotope || "Isotope";
            isotopeCard.appendChild(isotopeName);
            if (isotope.abundance) {
                const abundanceP = document.createElement("p");
                abundanceP.innerHTML = `<strong>Abundance:</strong> ${isotope.abundance}`;
                isotopeCard.appendChild(abundanceP);
            }
            if (isotope.halfLife) {
                const halfLifeP = document.createElement("p");
                halfLifeP.innerHTML = `<strong>Half-life:</strong> ${isotope.halfLife}`;
                isotopeCard.appendChild(halfLifeP);
            }
            isotopesCardsContainer.appendChild(isotopeCard);
        });
    } else {
        isotopesHeading.style.display = "none";
    }

    let detailLink = document.getElementById('modal-detail-link');
    if (!detailLink) {
        detailLink = document.createElement('a');
        detailLink.id = 'modal-detail-link';
        detailLink.className = 'detail-link-btn';
        document.querySelector('.modal-content').appendChild(detailLink);
    }
    detailLink.href = `element-details.html?symbol=${element.symbol}`;
    detailLink.textContent = `View more about ${element.name}`;

    const keyPropertiesSection = document.getElementById("modal-key-properties-section");
    const keyPropertiesList = document.getElementById("modal-key-properties-list");
    keyPropertiesList.innerHTML = "";
    if (element.key_properties && element.key_properties.length > 0) {
        keyPropertiesSection.style.display = "block";
        element.key_properties.forEach(prop => {
            const listItem = document.createElement("li");
            if (typeof prop === 'string') {
                listItem.textContent = prop;
            } else if (typeof prop === 'object' && prop !== null) {
                listItem.textContent = Object.entries(prop).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`).join(', ');
            }
            keyPropertiesList.appendChild(listItem);
        });
    } else {
        keyPropertiesSection.style.display = "none";
    }

    const usesSection = document.getElementById("modal-uses-section");
    const usesList = document.getElementById("modal-uses-list");
    usesList.innerHTML = "";
    if (element.uses && element.uses.length > 0) {
        usesSection.style.display = "block";
        element.uses.forEach(use => {
            const listItem = document.createElement("li");
            listItem.textContent = use;
            usesList.appendChild(listItem);
        });
    } else {
        usesSection.style.display = "none";
    }
}

function filterElements(query) {
    if (!query) {
        return []; // Return empty array if no query
    }
    const lowerCaseQuery = query.toLowerCase();

    // First, try to find an exact match by name or symbol
    const exactMatch = elementsData.find(element => 
        element.symbol.toLowerCase() === lowerCaseQuery ||
        element.name.toLowerCase() === lowerCaseQuery
    );
    if (exactMatch) {
        return [exactMatch];
    }
    
   
    return elementsData.filter(element => {
        const nameMatch = element.name.toLowerCase().startsWith(lowerCaseQuery);
        const symbolMatch = element.symbol.toLowerCase().startsWith(lowerCaseQuery);
        return nameMatch || symbolMatch;
    });
}

// Renders the search results to the HTML
function renderElements(elements) {
    DOM.resultsContainer.innerHTML = '';
    if (elements.length === 0) {
        DOM.resultsContainer.innerHTML = '<p class="no-results">No elements found.</p>';
        return;
    }
    elements.forEach(element => {
        const elementCard = document.createElement('div');
        elementCard.classList.add('element-card');
        elementCard.innerHTML = `
            <div class="element-symbol">${element.symbol}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-atomic-number">${element.atomicNumber}</div>
        `;
        elementCard.addEventListener('click', () => {
            loadElementDataIntoModal(element.symbol);
            openModal();
        });
        DOM.resultsContainer.appendChild(elementCard);
    });
}

// This function highlights a single element on the periodic table
function highlightPeriodicTableElement(symbol) {
    // First, remove any existing highlights
    DOM.allElements.forEach(element => {
        element.style.border = '';
        element.classList.remove('highlighted');
    });

    if (symbol) {
        const elementToHighlight = document.querySelector(`[data-symbol="${symbol}"]`);
        
        if (elementToHighlight) {
            const parentCell = elementToHighlight.closest('.element');
            if (parentCell) {
                parentCell.style.border = '2px solid red';
                parentCell.classList.add('highlighted');
                parentCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

// Function to handle category searches
const handleCategorySearch = (query) => {
    const categoryMap = {
        'metals': ['metal'],
        'metal': ['metal'],
        'gases': ['gas'],
        'gas': ['gas'],
        'lanthanide': ['lanthanide'],
        'lanthanides': ['lanthanide'],
        'actinide': ['actinide'],
        'actinides': ['actinide'],
        'alkali metal': ['alkali metal'],
        'alkali metals': ['alkali metal'],
        'alkalimetal': ['alkali metal'],
        'alkalimetals': ['alkali metal'],
        'alkaline earth metal': ['alkaline earth metal'],
        'alkaline earth metals': ['alkaline earth metal'],
        'alkalineearthmetal': ['alkaline earth metal'],
        'alkalineearthmetals': ['alkaline earth metal'],
        'transitionmetal': ['transition metal'],
        'transitionmetals': ['transition metal'],
        'posttransitionmetal': ['post-transition metal'],
        'posttransitionmetals': ['post-transition metal'],
        'transition metal': ['transition metal'],
        'transition metals': ['transition metal'],
        'post-transition metal': ['post-transition metal'],
        'post-transition metals': ['post-transition metal'],
        'noble gas': ['noble gas'],
        'noble gases': ['noble gas'],
        'metalloid': ['metalloid'],
        'metalloids': ['metalloid'],
        'halogen': ['halogen'],
        'halogens': ['halogen'],
        'nonmetals': ['nonmetal'],
        'nonmetal': ['nonmetal'],
    };

    const cleanedQuery = query.toLowerCase().trim();
    const targetCategories = categoryMap[cleanedQuery.replace(/\s/g, '').replace(/s$/, '')] || categoryMap[cleanedQuery];

    if (targetCategories) {
        highlightPeriodicTableElement(null); // Clear previous highlights

        const filteredElements = elementsData.filter(element => {
            const categoryMatch = targetCategories.some(targetCat => 
                (element.category || '').toLowerCase().includes(targetCat)
            );
            return categoryMatch;
        });

        if (filteredElements.length > 0) {
            filteredElements.forEach(element => {
                const elementCell = document.querySelector(`[data-symbol="${element.symbol}"]`);
                if (elementCell) {
                    const parentCell = elementCell.closest('.element');
                    if (parentCell) {
                        parentCell.style.border = '2px solid red';
                        parentCell.classList.add('highlighted');
                    }
                }
            });
            DOM.resultsContainer.innerHTML = `<p class="search-info">Highlighted all elements in the '${query}' category.</p>`;
        } else {
            DOM.resultsContainer.innerHTML = `<p class="no-results">No elements found for '${query}'.</p>`;
        }
        return true; // Indicates a category was found and handled
    }
    return false; // Indicates no category was handled
};

// This function handles all search logic
function handleSearch(query) {
    const isCategoryHandled = handleCategorySearch(query);

    if (!isCategoryHandled) {
        // Filter the elements based on the query.
        const matchingElements = filterElements(query);

        if (matchingElements.length === 1) {
            // If only one element matches, highlight it on the table.
            highlightPeriodicTableElement(matchingElements[0].symbol);
            DOM.resultsContainer.innerHTML = `<p class="search-info">Element '${matchingElements[0].name}' highlighted.</p>`;
        } else if (matchingElements.length > 1) {
            // If multiple elements match, render them as cards in the search results.
            highlightPeriodicTableElement(null); // Clear any single highlights
            renderElements(matchingElements);
        } else {
            // No matches found.
            highlightPeriodicTableElement(null); // Clear any previous highlights
            DOM.resultsContainer.innerHTML = '<p class="no-results">Element or category not found.</p>';
        }
    }
}

function showSuggestions(query) {
    DOM.suggestionsContainer.innerHTML = '';
    
    if (query.length < 2) {
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const suggestions = elementsData.filter(element => 
        element.name.toLowerCase().startsWith(lowerCaseQuery) ||
        element.symbol.toLowerCase().startsWith(lowerCaseQuery)
    );

    suggestions.slice(0, 5).forEach(element => { // Limit to 5 suggestions
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = `${element.name} (${element.symbol})`;
        suggestionItem.addEventListener('click', () => {
            DOM.searchInput.value = element.name;
            handleSearch(element.name);
            DOM.suggestionsContainer.innerHTML = ''; // Clear suggestions
        });
        DOM.suggestionsContainer.appendChild(suggestionItem);
    });
}

// Event listeners
function setupEventListeners() {
    // Modal events
    DOM.closeButton.addEventListener("click", closeModal);
    window.addEventListener("click", (event) => {
        if (event.target === DOM.modal) {
            closeModal();
        }
    });

    // Element click events
    DOM.elementLinks.forEach(elementBox => {
        elementBox.addEventListener("click", (event) => {
            const symbolLink = elementBox.querySelector("a");
            if (symbolLink) {
                event.preventDefault();
                const symbol = symbolLink.dataset.symbol;
                loadElementDataIntoModal(symbol);
                openModal();
            }
        });
    });

    // Block highlight events
    DOM.sBlockBtn.addEventListener("click", () => highlightBlock("s_group"));
    DOM.pBlockBtn.addEventListener("click", () => highlightBlock("p_group"));
    DOM.dBlockBtn.addEventListener("click", () => highlightBlock("d_group"));
    DOM.fBlockBtn.addEventListener("click", () => highlightBlock("f_group"));
    DOM.resetBtn.addEventListener("click", () => highlightBlock(null));

    // Search input events
    DOM.searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase().trim();
        if (query.length > 0) {
            showSuggestions(query);
            handleSearch(query);
        } else {
            DOM.suggestionsContainer.innerHTML = '';
            highlightPeriodicTableElement(null);
            DOM.resultsContainer.innerHTML = '';
        }
    });

    DOM.searchInput.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = DOM.searchInput.value.toLowerCase().trim();
            DOM.suggestionsContainer.innerHTML = '';
            handleSearch(query);
        }
    });

    DOM.clearBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        DOM.resultsContainer.innerHTML = '';
        DOM.suggestionsContainer.innerHTML = '';
        highlightPeriodicTableElement(null);
    });
}

// Initialize the script
document.addEventListener("DOMContentLoaded", async () => {
    await loadElementsData();
    setupEventListeners();
});

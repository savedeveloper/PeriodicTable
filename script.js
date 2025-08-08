const modal = document.getElementById("elementModal");
const closeButton = document.querySelector(".close-button");
const elementLinks = document.querySelectorAll(".element");
const sBlockBtn = document.getElementById("s-block-btn");
const pBlockBtn = document.getElementById("p-block-btn");
const dBlockBtn = document.getElementById("d-block-btn");
const fBlockBtn = document.getElementById("f-block-btn");
const resetBtn = document.getElementById("reset-btn");
const allElements = document.querySelectorAll(".element");
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const clearBtn = document.getElementById('clearBtn');
const toggleSearchBtn = document.getElementById('toggleSearchBtn'); // New button
const searchContainer = document.getElementById('searchContainer'); // Assuming you have a container for search elements

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
        // Initial render, showing all elements when the page loads
        renderElements(elementsData);
    } catch (error) {
        console.error('Could not load elements data:', error);
        resultsContainer.innerHTML = '<p class="error">Failed to load periodic table data.</p>';
    }
}

// Call the function to load the data when the script starts
document.addEventListener("DOMContentLoaded", loadElementsData);

// Open the modal
function openModal() {
    modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    modal.style.display = "none";
}

// Handles the click on an element card in the search results
function handleElementClick(symbol) {
    loadElementDataIntoModal(symbol);
    openModal();
}

// Highlights Block
function highlightBlock(blockClass) {
    allElements.forEach(element => {
        // Reset all highlighting and active classes
        element.classList.remove('s_group_active', 'p_group_active', 'd_group_active', 'f_group_active');
        element.classList.remove('dim-element');

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
async function loadElementDataIntoModal(symbol) {
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

// Add click event listeners to all element links
elementLinks.forEach(elementBox => {
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

// Event listeners for buttons
closeButton.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
sBlockBtn.addEventListener("click", () => {
    highlightBlock("s_group");
});
pBlockBtn.addEventListener("click", () => {
    highlightBlock("p_group");
});
dBlockBtn.addEventListener("click", () => {
    highlightBlock("d_group");
});
fBlockBtn.addEventListener("click", () => {
    highlightBlock("f_group");
});
resetBtn.addEventListener("click", () => {
    highlightBlock(null);
});

// This function filters the elements based on the search query
function filterElements(query) {
    if (!query) {
        return elementsData;
    }
    const lowerCaseQuery = query.toLowerCase();
    return elementsData.filter(element => {
        const nameMatch = element.name.toLowerCase().includes(lowerCaseQuery);
        const symbolMatch = element.symbol.toLowerCase().includes(lowerCaseQuery);
        const atomicNumberMatch = String(element.atomicNumber).includes(lowerCaseQuery);
        const atomicMassMatch = String(element.atomicMass).includes(lowerCaseQuery);
        const categoryMatch = (element.category || '').toLowerCase().includes(lowerCaseQuery);
        return nameMatch || symbolMatch || atomicNumberMatch || atomicMassMatch || categoryMatch;
    });
}

// This function renders the results to the HTML
function renderElements(elements) {
    resultsContainer.innerHTML = '';
    if (elements.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No elements found.</p>';
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
            handleElementClick(element.symbol);
        });
        resultsContainer.appendChild(elementCard);
    });
}

function highlightPeriodicTableElement(symbol) {
    // First, remove any existing highlights from all elements
    allElements.forEach(element => {
        element.style.border = ''; // Remove the border
        element.classList.remove('highlighted');
    });

    // If a symbol is provided, find and highlight the corresponding element
    if (symbol) {
        const elementToHighlight = document.querySelector(`[data-symbol="${symbol}"]`);
        
        if (elementToHighlight) {
            // Get the parent cell to apply the highlight
            const parentCell = elementToHighlight.closest('.element');
            if (parentCell) {
                parentCell.style.border = '2px solid red'; // Apply the red border
                parentCell.classList.add('highlighted');
                
                // Optional: Scroll the element into view
                parentCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}


// Event listener for the search input
searchInput.addEventListener('input', (event) => {
    const query = event.target.value;
    const filteredResults = filterElements(query);
    renderElements(filteredResults);
});

// Event listener for the clear button
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderElements(elementsData);
});

// This listener handles the search as you type
searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase().trim();
    
    if (query === '') {
        // If search is empty, remove all highlights
        highlightPeriodicTableElement(null);
        resultsContainer.innerHTML = ''; // Clear search results display
        return;
    }

    // This is where you would do your live filtering if you wanted it.
    // For now, we'll just remove any results so the table is clear.
    resultsContainer.innerHTML = '';
});


// Event listener for the 'Enter' key press
searchInput.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); 
        
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            // If search is empty, remove all highlights and clear results
            highlightPeriodicTableElement(null);
            resultsContainer.innerHTML = '';
            return;
        }

        // Find the element data based on the query
        const matchingElement = elementsData.find(el => 
            el.symbol.toLowerCase() === query ||
            el.name.toLowerCase() === query
        );
        
        if (matchingElement) {
            // If a match is found, highlight it on the periodic table
            highlightPeriodicTableElement(matchingElement.symbol);
            
            // You can also display a simple confirmation message in the resultsContainer
            resultsContainer.innerHTML = `<p class="search-info">Element '${matchingElement.name}' highlighted.</p>`;
        } else {
            // If no match, show a 'not found' message and remove any highlights
            highlightPeriodicTableElement(null); // This resets any existing highlights
            resultsContainer.innerHTML = '<p class="no-results">Element not found.</p>';
        }
    }
});

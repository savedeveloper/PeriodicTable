const modal = document.getElementById("elementModal");
const closeButton = document.querySelector(".close-button");
const elementLinks = document.querySelectorAll(".element");
const sBlockBtn = document.getElementById("s-block-btn");
const pBlockBtn = document.getElementById("p-block-btn");
const dBlockBtn = document.getElementById("d-block-btn");
const fBlockBtn = document.getElementById("f-block-btn");
const resetBtn = document.getElementById("reset-btn");
const allElements = document.querySelectorAll(".element");

// Open the modal
function openModal() {
    modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    modal.style.display = "none";
}

// Event listener for close button
closeButton.addEventListener("click", closeModal);

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Highlights Block
function highlightBlock(blockClass) {
    // First, reset all highlighting and active classes
    allElements.forEach(element => {
        element.classList.remove('s_group_active', 'p_group_active', 'd_group_active', 'f_group_active');
        element.classList.remove('dim-element');
    });

    // If a block is specified, highlight it with the new color and dim the others
    if (blockClass) {
        allElements.forEach(element => {
            if (element.classList.contains(blockClass)) {
                // Add the new, distinct color class
                element.classList.add(`${blockClass}_active`);
            } else {
                // Dim the elements outside the selected block
                element.classList.add('dim-element');
            }
        });
    }

}

// Function to load and display element data in the modal
async function loadElementDataIntoModal(symbol) {
    const response = await fetch("elements.json");
    const elements = await response.json();
    const element = elements.find(el => el.symbol.toLowerCase() === symbol.toLowerCase());

    if (!element) {
        document.getElementById("modal-name").textContent = "Element Not Found";
        return;
    }

    // Update the element symbol with superscript atomic number and subscript atomic mass
    const atomicNumberForSymbol = element.atomicNumber || ""; // Use empty string if N/A
    const atomicMassForSymbol = element.atomicMass || ""; // Use empty string if N/A

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
        // If the link doesn't exist, create it
        detailLink = document.createElement('a');
        detailLink.id = 'modal-detail-link';
        detailLink.className = 'detail-link-btn';
        document.querySelector('.modal-content').appendChild(detailLink);
    }
    // Set the link's URL to the new details page with the element's symbol
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
        // Find the 'a' tag within the clicked 'td' element
        const symbolLink = elementBox.querySelector("a");
        if (symbolLink) {
            event.preventDefault(); // Prevent default link behavior
            const symbol = symbolLink.dataset.symbol;
            loadElementDataIntoModal(symbol);
            openModal();
        }
    });
});

// Event Listeners for buttons
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
    highlightBlock(null); // Reset all highlighting
});

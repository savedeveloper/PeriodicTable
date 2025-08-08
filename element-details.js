// This script will run on the element-details.html page
document.addEventListener('DOMContentLoaded', () => {
    // Function to parse the URL and get the element symbol
    const getElementSymbolFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('symbol');
    };

    // Function to fetch element data and populate the page
    const loadElementData = async () => {
        const symbol = getElementSymbolFromUrl();
        if (!symbol) {
            console.error('No element symbol found in URL.');
            return;
        }

        try {
            const response = await fetch('elements.json');
            const data = await response.json();
            const element = data.find(el => el.symbol === symbol);

            if (element) {
                // Populate the header
                document.getElementById('element-symbol').textContent = element.symbol;
                document.getElementById('element-name').textContent = element.name;
                document.title = `${element.name} (${element.symbol}) - Details`;

                // Populate interesting facts
                const factsList = document.getElementById('facts-list');
                factsList.innerHTML = ''; // Clear previous content
                if (element.interesting_facts && element.interesting_facts.length > 0) {
                    element.interesting_facts.forEach(fact => {
                        const listItem = document.createElement('li');
                        listItem.textContent = fact;
                        factsList.appendChild(listItem);
                    });
                } else {
                    factsList.innerHTML = '<li>No interesting facts available.</li>';
                }

                // Populate common uses
                const usesList = document.getElementById('uses-list');
                usesList.innerHTML = ''; // Clear previous content
                if (element.common_uses && element.common_uses.length > 0) {
                    element.common_uses.forEach(use => {
                        const listItem = document.createElement('li');
                        listItem.textContent = use;
                        usesList.appendChild(listItem);
                    });
                } else {
                    usesList.innerHTML = '<li>No common uses available.</li>';
                }

                // Populate compounds
                const compoundsList = document.getElementById('compounds-list');
                compoundsList.innerHTML = ''; // Clear previous content

                if (element.compounds && element.compounds.length > 0) {
                    element.compounds.forEach(compound => {
                        const listItem = document.createElement('li');

                        // Compound Name
                        const compoundName = document.createElement('strong');
                        compoundName.textContent = compound.compound;

                        // Compound Formula
                        const compoundFormula = document.createElement('span');
                        compoundFormula.className = 'formula';
                        // Use innerHTML so MathJax can process the LaTeX string
                        compoundFormula.innerHTML = compound.formula;

                        // Compound Properties
                        const compoundProperties = document.createElement('p');
                        compoundProperties.className = 'properties';
                        compoundProperties.textContent = compound.properties;

                        // Append the elements to the list item
                        listItem.appendChild(compoundName);
                        listItem.appendChild(compoundFormula);
                        listItem.appendChild(compoundProperties);

                        compoundsList.appendChild(listItem);
                    });
                } else {
                    compoundsList.innerHTML = '<li>No known compounds listed.</li>';
                }

                    MathJax.typesetPromise([compoundsList]).then(() => {
                    // Optional: Code to run after typesetting is complete.
                    console.log('MathJax typeset complete for compounds list.');
                });

            } else {
                console.error(`Element with symbol ${symbol} not found.`);
            }
        } catch (error) {
            console.error('Error fetching element data:', error);
        }
    };

    loadElementData();
});

document.addEventListener('DOMContentLoaded', function() {

// Search/filter event (input)
document.getElementById('search-input').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('nav a').forEach(link => {
        const text = link.textContent.toLowerCase();
        link.parentElement.style.display = text.includes(query) ? '' : 'none';
    });
});

// Dark mode toggle event (change)
document.getElementById('dark-toggle').addEventListener('change', function(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// ...existing code...
    //this will intialize the app when the DOM is fully loaded
    // Initialize variables
    let destinations = {};
    let currentDestination = 'Mount_Kenya';

    // this will fetch the destination data from db.json
    // and populate the destinations object
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            destinations = data.destinations;
            // this will intialize the first destination
            // and update the UI accordingly
            updateDestination(currentDestination);
            
            // Set up navigation after data is loaded
            setupNavigation();
        })
        .catch(error => {
            console.error('Error loading destination data:', error);
            document.getElementById('wikipedia-content').innerHTML = 
                '<p>Could not load destination data. Please try again later.</p>';
        });

    // this will step up the navigation links
    function setupNavigation() {
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentDestination = this.getAttribute('data-destination');
                
                // we will update the active link 
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
                
                updateDestination(currentDestination);
            });
        });
    }

    // function to update the UI with the selected destination
    function updateDestination(destinationKey) {
        const destination = destinations[destinationKey];
        if (!destination) {
            console.error('Destination not found:', destinationKey);
            return;
        }

        const titleElem = document.getElementById('destination-title');
        if (titleElem) titleElem.textContent = destination.title || '';

        const taglineElem = document.getElementById('destination-tagline');
        if (taglineElem) taglineElem.textContent = destination.tagline || '';

        const heroElem = document.getElementById('hero-image');
        if (heroElem && destination.heroImage) {
            heroElem.style.backgroundImage = `url(${destination.heroImage})`;
        }

        const aboutTitleElem = document.getElementById('about-title');
        if (aboutTitleElem) aboutTitleElem.textContent = destination.title || '';

        // fetch data from wikipedia 
        fetchWikipediaContent(destination.title);

        // Update gallery
        const gallery = document.getElementById('gallery');
        if (gallery && Array.isArray(destination.images)) {
            gallery.innerHTML = '';
            destination.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = destination.title || '';
                gallery.appendChild(img);
            });
        }

        // Update travel tips
        const tipsContainer = document.getElementById('travel-tips-content');
        if (tipsContainer && Array.isArray(destination.tips)) {
            tipsContainer.innerHTML = '<ul>' + destination.tips.map(tip => `<li>${tip}</li>`).join('') + '</ul>';
        }
    }

    // Function to fetch Wikipedia content
    function fetchWikipediaContent(title) {
        const contentContainer = document.getElementById('wikipedia-content');
        contentContainer.innerHTML = '<p>Loading information from Wikipedia...</p>';
        
        // Wikipedia API endpoint
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${title}&origin=*`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                const content = pages[pageId].extract;
                
                // Format and display the content
                const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
                let htmlContent = '';
                
                // this will Show first 3 paragraphs
                for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
                    htmlContent += `<p>${paragraphs[i]}</p>`;
                }
                
                // we are going to Add "Read more" link to Wikipedia
                htmlContent += `<p class="read-more"><a href="https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}" target="_blank">Read more on Wikipedia</a></p>`;
                
                contentContainer.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error('Error fetching Wikipedia data:', error);
                contentContainer.innerHTML = '<p>Could not load information from Wikipedia. Please try again later.</p>';
            });
    }
});
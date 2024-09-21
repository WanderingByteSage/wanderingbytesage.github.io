// Example conferences (this can come from the API)
const conferences = [
    { id: "SEC", name: "Southeastern Conference" },
    { id: "ACC", name: "Atlantic Coast Conference" },
    { id: "BigTen", name: "Big Ten Conference" },
    { id: "Pac12", name: "Pac-12 Conference" },
    { id: "Big12", name: "Big 12 Conference" }
    // Add more conferences as needed...
  ];
  
  // Populate the conference checkboxes dynamically
  function populateConferenceFilters() {
    const conferenceDiv = document.getElementById('conferenceFilters');
    conferences.forEach(conference => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = conference.id;
      checkbox.value = conference.id;
  
      // Set "Big Ten" as the default checked checkbox
      if (conference.id === "BigTen") {
        checkbox.checked = true; // Default checked for Big Ten
      }
  
      // Add event listener for immediate filtering on change
      checkbox.addEventListener('change', filterGames);
  
      const label = document.createElement('label');
      label.htmlFor = conference.id;
      label.innerText = conference.name;
  
      // Append checkbox and label to the div
      conferenceDiv.appendChild(checkbox);
      conferenceDiv.appendChild(label);
      conferenceDiv.appendChild(document.createElement('br'));
    });
  }
  
  async function filterGames() {
    // Get selected conferences
    const selectedConferences = [];
    conferences.forEach(conference => {
      const checkbox = document.getElementById(conference.id);
      if (checkbox.checked) {
        selectedConferences.push(checkbox.value);
      }
    });
  
    // Fetch data from the ESPN API
    //const apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20240921';
    const apiUrl = 'sample.json';  // Path to the saved JSON file
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      const games = data.events;
      const tableBody = document.querySelector('#scoresTable tbody');
  
      // Clear the table
      tableBody.innerHTML = '';
  
      // Filter games by selected conferences
      const filteredGames = games.filter(game => {
        const competition = game.competitions[0];
        const group = competition && competition.groups && competition.groups[0];
        const gameConference = group ? group.name : null;
  
        // Only include games that match the selected conferences
        return selectedConferences.includes(gameConference);
      });
  
      // Insert filtered games into the table
      filteredGames.forEach(game => {
        const competition = game.competitions[0];
        const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
        const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');
        
        const homeTeam = homeCompetitor && homeCompetitor.team ? homeCompetitor.team.displayName : 'N/A';
        const awayTeam = awayCompetitor && awayCompetitor.team ? awayCompetitor.team.displayName : 'N/A';
        const homeScore = homeCompetitor && homeCompetitor.score ? homeCompetitor.score : 'N/A';
        const awayScore = awayCompetitor && awayCompetitor.score ? awayCompetitor.score : 'N/A';
        const kickoffTime = competition ? new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const gameConference = group ? group.name : 'Unknown Conference';
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${homeTeam}</td>
          <td>${awayTeam}</td>
          <td>${homeScore}</td>
          <td>${awayScore}</td>
          <td>${kickoffTime}</td>
          <td>${gameConference}</td>
        `;
        tableBody.appendChild(row);
      });
  
    } catch (error) {
      console.error('Error fetching the games:', error);
    }
  }
  
  
  // Call populateConferenceFilters() on page load
  populateConferenceFilters();
  
  // Initial load with the default selected filters (Big Ten)
  filterGames();
  
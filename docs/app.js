// Example conferences (this can come from the API)
const CONFERENCES = [
  { id: "8", name: "Southeastern Conference" },
  { id: "1", name: "Atlantic Coast Conference" },
  { id: "5", name: "Big Ten Conference" },
  { id: "9", name: "Pac-12 Conference" },
  { id: "4", name: "Big 12 Conference" },
  // { id: "Other", name: "Other" }, ??
  // Add more conferences as needed...
];

const RANKING = [
  { id: "All", name: "All" },
  { id: "Ranked", name: "Ranked" },
  { id: "NonRanked", name: "Non-Ranked"}
];

const QUARTER = [
  { id: "1st", name: "1st" },
  { id: "2nd", name: "2nd" },
  { id: "3rd", name: "3rd" },
  { id: "4th", name: "4th" },
];

const CLOSE_GAME = [
  { id: "Close Game", name: "Yes" },
  { id: "All", name: "All" },
];

// populate all filters
function populateAllFilters(){
  populateConferenceFilters();
  populateRankingFilters();  
}

// create sortable table
function sortableHeaders() {
  // Select the table
  const table = document.getElementById("scoresTable");
  const headers = table.querySelectorAll("th");

  // Keep track of the sorting state for each column
  const sortStates = Array.from(headers).map(() => 0); // 0: default, 1: ascending, -1: descending

  headers.forEach((header, index) => {
    header.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));

      // Toggle sort state
      sortStates[index] = ((sortStates[index] + 2) % 3) - 1; // Cycles through -1, 0, 1

      // Sort the rows
      rows.sort((a, b) => {
        const aStatus = a.getAttribute('data-status');
        const bStatus = b.getAttribute('data-status');

        const statusOrder = {
          'in-progress': -1,
          'upcoming': 0,
          'finished': 1
        };

        const aStatusOrder = statusOrder[aStatus] || 0; // Default to 0 (upcoming) if not found
        const bStatusOrder = statusOrder[bStatus] || 0;
      
        // If the statuses are different, prioritize the status order
        if (aStatusOrder !== bStatusOrder) {
          return aStatusOrder - bStatusOrder;
        }

        const aValue = a.children[index].textContent;
        const bValue = b.children[index].textContent;

        if (sortStates[index] === 0) {
          // Default order by first column
          return a.children[0].textContent.localeCompare(b.children[0].textContent);
        } else {
          // Check if the values are numbers
          const aNum = parseFloat(aValue);
          const bNum = parseFloat(bValue);
      
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortStates[index] * (aNum - bNum); // Sort by number
          } else {
            return sortStates[index] * aValue.localeCompare(bValue); // Sort by text
          }
        }
      });

      // Clear and re-append the sorted rows
      tbody.innerHTML = "";
      rows.forEach((row) => tbody.appendChild(row));

      // Update header styles to indicate sort direction
      headers.forEach((h, i) => {
        h.classList.remove("asc", "desc");
        if (i === index) {
          if (sortStates[i] === 1) h.classList.add("asc");
          if (sortStates[i] === -1) h.classList.add("desc");
        }
      });
    });
  });
}

// Populate the conference checkboxes dynamically
function populateConferenceFilters() {
  const conferenceFilters = document.getElementById('filter_Conference');

  const conferenceFiltersHeader = document.createElement('th');
  conferenceFiltersHeader.innerText = 'Conference';
  conferenceFiltersHeader.classList.add('filter-group-header');

  conferenceFilters.classList.add('filter-group');
  conferenceFilters.appendChild(conferenceFiltersHeader);

  CONFERENCES.forEach((singleConference) => {
    const rowConference = document.createElement('tr');

    // enable checkbox: ${singleConference.id === "5" ? "checked" : ""} 
    rowConference.innerHTML = `
      <td><input type="checkbox" id="conf-${singleConference.id}" value="${singleConference.id}">
      <label for="conf-${singleConference.id}">${singleConference.name}</label></td>
      `;
    rowConference.addEventListener("change", filterGames);
    conferenceFilters.appendChild(rowConference);
  });
}

// Set up Ranking checkboxes dynamically
function populateRankingFilters() {
  const rankingFilters = document.getElementById("filter_Rankings");

  const rankingFiltersHeader = document.createElement('th');
  rankingFiltersHeader.innerText = 'Rankings';
  rankingFiltersHeader.classList.add('filter-group-header');

  rankingFilters.classList.add('filter-group');
  rankingFilters.appendChild(rankingFiltersHeader);

  RANKING.forEach((singleRanking) => {
    const rowRanking = document.createElement('tr');

    if (singleRanking.id === "Ranked") {
      rowRanking.innerHTML = `
      <td><input type="radio" checked=true id="ranking-${singleRanking.id}" value="${singleRanking.id}" name="ranking">
      <label for="ranking-${singleRanking.id}">${singleRanking.name}</label></td>
    `;
    } else {
      rowRanking.innerHTML = `
      <td><input type="radio" id="ranking-${singleRanking.id}" value="${singleRanking.id}" name="ranking">
      <label for="ranking-${singleRanking.id}">${singleRanking.name}</label></td>
    `;
    }

    rowRanking.addEventListener("change", filterGames);
    rankingFilters.appendChild(rowRanking);
  });
}

// Example of adding a third checkbox set for categories like A, B, and C
/*
  function populateCategoryFilters() {
    const categoryFilterDiv = document.getElementById('categoryFilters');
    
    categoryFilterDiv.style.display = 'flex';
    categoryFilterDiv.style.flexWrap = 'wrap';
  
    const categories = ['A', 'B', 'C'];
    categories.forEach(category => {
      const categoryCheckbox = document.createElement('input');
      categoryCheckbox.type = 'checkbox';
      categoryCheckbox.id = 'category-' + category;
      categoryCheckbox.value = category;
  
      categoryCheckbox.addEventListener('change', filterGames);
  
      const categoryLabel = document.createElement('label');
      categoryLabel.htmlFor = 'category-' + category;
      categoryLabel.innerText = category;
  
      categoryFilterDiv.appendChild(categoryCheckbox);
      categoryFilterDiv.appendChild(categoryLabel);
    });
  }
  */

// Filter games based on selected checkboxes
async function filterGames() {
  // (1) Get selected conferences
  const selectedConferences = [];
  CONFERENCES.forEach((singleConference) => {
    const conferenceCheckbox = document.getElementById("conf-" + singleConference.id);

    if (conferenceCheckbox && conferenceCheckbox.checked) {
      selectedConferences.push(conferenceCheckbox.value);
    }
  });

  // (2) Get selected rankings
  const selectedRankings = [];
  RANKING.forEach((singleRanking) => {
    const rankingCheckbox = document.getElementById("ranking-" + singleRanking.id);

    if (rankingCheckbox && rankingCheckbox.checked) {
      selectedRankings.push(rankingCheckbox.value);
    }
  });

  // (3) Goes here...

  // Fetch data from the ESPN API
   const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20240926-20240929';
  // const apiUrl = "https://wanderingbytesage.github.io/sample.json"; // Adjust the path if necessary
  //  const apiUrl = "https://wanderingbytesage.github.io/scoreboard.json"; // Adjust the path as necessary

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);

    const games = data.events;
    const tableBody = document.querySelector("#scoresTable tbody");

    // Clear the table
    tableBody.innerHTML = "";

    const filterByConference = selectedConferences.length > 0;
    const filterByRanking = selectedRankings.length > 0;

    // Filter games by selected conferences and rankings
    const filteredGames = games.filter((game) => {
      // Loop through all games and access home and away teams in each game's 'competitors' array
      const gameStatus = game.status.type.name;
      const gameCompetitors = game.competitions[0].competitors; // Assuming every game has competitions and competitors
      const homeTeam = gameCompetitors[0].team;
      const homeTeam_Rank = gameCompetitors[0].curatedRank.current || "";
      const homeTeam_Conference = homeTeam.conferenceId || "";
      const awayTeam = gameCompetitors[1].team;
      const awayTeam_Rank = gameCompetitors[1].curatedRank.current || "";
      const awayTeam_Conference = awayTeam.conferenceId || "";

      // Conference filtering
      const conferenceFilterMatch =
        !filterByConference ||
        selectedConferences.includes(homeTeam_Conference) ||
        selectedConferences.includes(awayTeam_Conference);

      // Ranking filtering
      const rankingFilterMatch = filterByRanking && 
        selectedRankings.includes('Ranked') ? ( homeTeam_Rank < 99 || awayTeam_Rank < 99 ) : 
        selectedRankings.includes('NonRanked') ? ( homeTeam_Rank === 99 && awayTeam_Rank === 99 ) : 
        true;

      // Only return games if all filters match (or are skipped)
      return conferenceFilterMatch && rankingFilterMatch;
    });

    // Log the number of games returned
    const numberOfGames = filteredGames.length;
    console.log(`Number of games found: ${numberOfGames}`);

    // Check if no games were found
    if (numberOfGames === 0) {
      console.log("No games match the selected filters.");
    }

    // Insert filtered games into the table
    filteredGames.forEach((game) => {
      const homeTeam = game.competitions[0].competitors.find(
        (c) => c.homeAway === "home"
      ).team.displayName;
      const awayTeam = game.competitions[0].competitors.find(
        (c) => c.homeAway === "away"
      ).team.displayName;
      const homeScore =
        game.competitions[0].competitors.find((c) => c.homeAway === "home")
          .score || "N/A";
      const awayScore =
        game.competitions[0].competitors.find((c) => c.homeAway === "away")
          .score || "N/A";
      const kickoffTime = new Date(game.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const shortDetail = game.competitions[0].status.type.shortDetail;
      const broadcast = game.competitions[0].broadcasts[0].names;

      // Determine the game status
      let gameStatus;
      if (gameStatus === '"STATUS_IN_PROGRESS') {
        gameStatus = "in-progress";
      } else if (gameStatus === 'STATUS_FINAL') {
        gameStatus = "finished"; 
      } else {
        gameStatus = "upcoming"; 
      }

      const row = document.createElement("tr");
      row.setAttribute("data-status", gameStatus);
      row.innerHTML = `
          <td class="team-name">${homeTeam}</td>
          <td class="team-name">${awayTeam}</td>
          <td class="score">${homeScore}</td>
          <td class="score">${awayScore}</td>
          <td class="kickoff-time">${kickoffTime}</td>
          <td class="clock">${shortDetail}</td>
          <td class="network">${broadcast}</td>
        `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching the games:", error);
  }
}

// Call populate functions to initialize the filters on page load
populateAllFilters();
filterGames();
sortableHeaders();
// populateCategoryFilters();  // Uncomment to add the third set of filters

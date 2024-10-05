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

  function getAPIDateRange() {
    const today = new Date();
    const currentDay = today.getDay();

    let dateFrom = new Date(today);
    let dateTo = new Date(today);

    // Sun = 0; Mon = 1; Tues = 2; Wed = 3; Thurs = 4; Fri = 5; Sat = 6
    // If today = [Sun,Mon] then still return prior week; otherwise return current/upcoming week
    let lowerBoundDay;  // Tuesday
    if (today.getDay() < 2) {  // Sun = 0; Mon = 1
      lowerBoundDay = -5 - currentDay;
    } else {
      lowerBoundDay = -(currentDay - 2);
    }
    
    const upperBoundDate = (8 - currentDay) % 7 // || 0;  // If Monday, out 7 days
  
    dateFrom.setDate(today.getDate() + lowerBoundDay);
    dateTo.setDate(today.getDate() + upperBoundDate);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2,'0');
      return `${year}${month}${day}`;
    }

    return {
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo)
    }
  }


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

  try {
    // Generate API Key and Fetch data from the ESPN API
    const { dateFrom, dateTo } = getAPIDateRange();
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${dateFrom}-${dateTo}`; // LIVE
    //const apiUrl = "https://wanderingbytesage.github.io/scoreboard.json"; // DEBUG

    const response = await fetch(apiUrl);
    const data = await response.json();

    const games = data.events;
    const tableBody = document.querySelector("#scoresTable tbody");

    // Clear the table
    tableBody.innerHTML = "";

    const filterByConference = selectedConferences.length > 0;
    const filterByRanking = selectedRankings.length > 0;

    // Filter games by selected conferences and rankings
    // This is NOT to display, just reduce the dataset per filters. Display comes later.
    const filteredGames = games.filter((game) => {
      const gameStatus = game.status.type.name;
      const gameCompetitors = game.competitions[0].competitors; // Assuming every game has competitions and competitors
      const homeTeam_Name = gameCompetitors.find((c) => c.homeAway === "home").team.displayName || "N/A";
      const homeTeam_Rank = gameCompetitors.find((c) => c.homeAway === "home").curatedRank.current || "";
      //const homeTeam_Rank = gameCompetitors[0].curatedRank.current || "";
      const homeTeam_Conference = homeTeam_Name.conferenceId || "";
      const awayTeam_Name = gameCompetitors.find((c) => c.homeAway === "away").team.displayName || "N/A";
      const awayTeam_Rank = gameCompetitors.find((c) => c.homeAway === "away").curatedRank.current || "";
      //const awayTeam_Rank = gameCompetitors[1].curatedRank.current || "";
      const awayTeam_Conference = awayTeam_Name.conferenceId || "";

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

    // Append ranks to teams
    //const displayHomeTeamName = homeTeam_Rank && homeTeam_Rank <= 25 ? `${homeTeam_Name} (${homeTeam_Rank})` : `${homeTeam_Name}`;

    // Insert filtered games into the table
    // Display adjustments here.
    filteredGames.forEach((f_games) => {
      const homeTeam = f_games.competitions[0].competitors.find((c) => c.homeAway === "home");
      const awayTeam = f_games.competitions[0].competitors.find((c) => c.homeAway === "away");
      const homeScore = f_games.competitions[0].competitors.find((c) => c.homeAway === "home").score || "N/A";
      const awayScore = f_games.competitions[0].competitors.find((c) => c.homeAway === "away").score || "N/A";
      const homeTeam_Name = homeTeam.team.displayName || "N/A";
      const awayTeam_Name = awayTeam.team.displayName || "N/A";
      const homeTeam_Rank = homeTeam.curatedRank.current && homeTeam.curatedRank.current != 99 ? homeTeam.curatedRank.current : "";
      const awayTeam_Rank = awayTeam.curatedRank.current && awayTeam.curatedRank.current != 99 ? awayTeam.curatedRank.current : "";
      const kickoffTime = new Date(f_games.date).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", });
      const shortDetail = f_games.competitions[0].status.type.shortDetail;
      const broadcast = f_games.competitions[0].broadcasts[0].names;

      // alterations
      const homeTeam_DisplayName = homeTeam_Rank != '' ? `${homeTeam_Name} (${homeTeam_Rank})` : homeTeam_Name;
      const awayTeam_DisplayName = awayTeam_Rank != '' ? `${awayTeam_Name} (${awayTeam_Rank})` : awayTeam_Name;

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
          <td class="team-name">${homeTeam_DisplayName}</td>
          <td class="team-name">${awayTeam_DisplayName}</td>
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

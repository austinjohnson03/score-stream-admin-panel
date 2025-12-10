const apiSelection = document.getElementById('apiSelection');
const functionSelection = document.getElementById('functionSelection');
functionSelection.innerHTML = "<option value=\"\">Select Function</option>";

const funcMap = {
    "CBBD": [
        "None", "Conference History", "Conferences", "Draft Picks", "Draft Positions", "Draft Teams", "Broadcasts",
        "Game Players", "Game Teams", "Games", "Lines", "Providers", "Lineup Stats by Game", "Lineups by Team Season",
        "Play Types", "Plays", "Plays by Date", "Plays by Player ID", "Plays by Team", "Plays by Tournament",
        "Substitutions by Game", "Substitutions by Player ID", "Substitutions by Team", "Rankings",
        "Adjusted Efficiency", "SRS", "Recruits", "Player Season Shooting Stats", "Player Season Stats",
        "Team Season Shooting Stats", "Team Season Stats", "Team Roster", "Teams", "Venues"
    ],
    "CFBD": ["None"]
};

apiSelection.addEventListener('change', () => {
    const selectedIndex = apiSelection.value;
    functionSelection.innerHTML = "<option value=\"\">Select Function</option>";

    if (selectedIndex) {
        const selection = funcMap[selectedIndex];
        selection.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            functionSelection.appendChild(option);
        });
    }
});


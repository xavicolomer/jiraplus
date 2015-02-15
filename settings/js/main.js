var sites;

$(document).ready(function() {
    loadInitialData();
});

function loadInitialData() {
    chrome.storage.sync.get('sites', onSitesLoaded);
}
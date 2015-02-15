var sites;

document.addEventListener("initJIRAPlus", function(data) {
    loadInitialData();
});

function loadInitialData() {
    if (typeof sites === 'undefined') {
        console.log("Adding JIRA plus to: " + window.location.href);
        chrome.storage.sync.get('sites', onScriptsSitesLoaded);
    }
}

function onScriptsSitesLoaded(data) {
    sites = data['sites'];
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("onSitesLoaded", true, true, sites);
    window.dispatchEvent(event);
    document.dispatchEvent(event);
}



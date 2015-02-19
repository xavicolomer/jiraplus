var sites;

document.addEventListener("initJIRAPlus", function(data) {
    loadInitialData();
});

function loadInitialData() {
    if (typeof sites === 'undefined') {
        
        chrome.storage.sync.get('sites', onScriptsSitesLoaded);
    }
}

function isAllowedSite() {
    var key, site
    if (typeof(currentSite) !== 'undefined')
        return currentSite;

    for (key in sites) {
        site = sites[key];
        if (window.location.href.indexOf(site.url) === 0) {
            currentSite = site;
            return site;
        }
    }

    return false;
}

function onScriptsSitesLoaded(data) {
    sites = data['sites'];

    if (isAllowedSite()) {
        console.log("Adding JIRA plus to: " + window.location.href);
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent("onSitesLoaded", true, true, sites);
        window.dispatchEvent(event);
        document.dispatchEvent(event);
    }
}



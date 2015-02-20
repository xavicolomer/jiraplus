var currentSite, sites;

init();

function init() {
    chrome.storage.sync.get('sites', onSitesLoadedInjectData);
}

function isAllowedSite(url) {
    var key, site
    if (typeof(currentSite) !== 'undefined')
        return currentSite;

    for (key in sites) {
        site = sites[key];
        if (url.indexOf(site.url) === 0) {
            currentSite = site;
            return site;
        }
    }

    return false;
}

function onSitesLoadedInjectData(data) {
    sites = data['sites'];

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        var site, lastError = chrome.runtime.lastError;
        
        if (sites && isAllowedSite(tab.url)) {
            if (lastError) {
                console.log(lastError.message);
                return;
            }

            if (changeInfo.status == 'complete') {
                if (tab.url.indexOf('http') == 0) {
                    chrome.tabs.executeScript(null, {
                        code:"var s = document.createElement('script');s.src = chrome.extension.getURL('common/js/common.js');s.onload = function() { this.parentNode.removeChild(this);};(document.head||document.documentElement).appendChild(s);"
                    },
                    function(result) {
                        if (chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError);
                            return;
                        }
                    });

                    chrome.tabs.executeScript(null, {
                        code:"var s = document.createElement('script');s.src = chrome.extension.getURL('script.js');s.onload = function() { this.parentNode.removeChild(this);};(document.head||document.documentElement).appendChild(s);"
                    },
                    function(result) {
                        if (chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError);
                            return;
                        }
                    });
                }
            }
        }
    });

    chrome.contextMenus.onClicked.addListener(onClickHandler);

    chrome.tabs.onActivated.addListener(function(activeInfo) {
        buildContextMenus();
    });
}

function buildContextMenus() {
    if (sites) {
        var variablePerSitePatterns, allowedSitesPatterns, key, element, variable;

        chrome.contextMenus.removeAll(function () {
            variablePerSitePatterns = [];
            allowedSitesPatterns = [];

            for (key in sites) {
                site = sites[key];
                allowedSitesPatterns.push(sites[key].url + "*");

                if (typeof(site.variables) !== 'undefined') {
                    variablePerSitePatterns.push(sites[key].url + "*");
                }
            }

            chrome.contextMenus.create({ "title": "HeJIRA", "contexts": ["all"], "id": "hejira", "documentUrlPatterns": allowedSitesPatterns });
            chrome.contextMenus.create({ "title": "Variables", "contexts": ["all"], "parentId": "hejira", "id": "hejira-vars-" + site.id, "documentUrlPatterns": variablePerSitePatterns });

            for (key in sites) {
                if (typeof(sites[key].variables) !== 'undefined') {
                    for (element in sites[key].variables) {
                        variable = sites[key].variables[element];
                        chrome.contextMenus.create({ "title": variable.title, "contexts": ["all"], "id": variable.key, "parentId": "hejira-vars-" + sites[key].id, "documentUrlPatterns": [sites[key].url + "*"] });
                    }
                }
            }
        });
    }
}

function onClickHandler(info, tab) {
    var element, variable;
    if (sites) {
        for (key in sites) {
            if (typeof(sites[key].variables) !== 'undefined') {
                for (element in sites[key].variables) {
                    variable = sites[key].variables[element];
                    if (variable.key === info.menuItemId) {
                        pasteVariable(variable);
                        return;
                    }
                }
            }
        }
    }
}

function pasteVariable(variable) {
    chrome.tabs.executeScript(null, {
        code:"var s = document.createElement('script');s.innerText = 'insertAtCaret(\"" + variable.key + "\");';s.onload = function() { this.parentNode.removeChild(this);};(document.head||document.documentElement).appendChild(s);"
    },
    function(result) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            return;
        }
    });
}
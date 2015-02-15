init();

function init() {
    chrome.storage.sync.get('sites', onSitesLoadedInjectData);
}

function onSitesLoadedInjectData(data) {
    sites = data['sites'];

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        var lastError = chrome.runtime.lastError;
        if (lastError) {
            console.log(lastError.message);
            return;
        }

        if (changeInfo.status == 'complete') {
            if (tab.url.indexOf('http') == 0) {
                chrome.tabs.executeScript(null, {code:"var s = document.createElement('script');s.src = chrome.extension.getURL('common/js/common.js');s.onload = function() { this.parentNode.removeChild(this);};(document.head||document.documentElement).appendChild(s);"});
                chrome.tabs.executeScript(null, {code:"var s = document.createElement('script');s.src = chrome.extension.getURL('script.js');s.onload = function() { this.parentNode.removeChild(this);};(document.head||document.documentElement).appendChild(s);"});
            }
        }
    });
}

function buildContextMenus(sites) {
    var patterns, key, site;
    chrome.contextMenus.removeAll(function () {
        patterns = [];
        for (key in sites) {
            site = sites[key];
            patterns.push(sites[key].url + "*");
        }

        chrome.contextMenus.create({ "title": "JIRA+", "contexts": ["all"], "id": "jiraplus" });

        /*for (var key in sites) {
            if (typeof sites[key].actions !== 'undefined' &&  Object.getOwnPropertyNames(sites[key].actions).length !== 0) {
                chrome.contextMenus.create({ "title": "actions", "contexts": ["all"], "parentId": "jiraplus", "id": "jira-actions" });
            
                for (var id in sites[key].actions) {
                    chrome.contextMenus.create({ "title": sites[key].actions[id].trigger, "contexts": ["all"], "parentId": "jira-actions", "id": id });
                }
            }

            if (typeof sites[key].variables !== 'undefined' &&  Object.getOwnPropertyNames(sites[key].variables).length !== 0) {
                chrome.contextMenus.create({ "title": "variables", "contexts": ["all"], "parentId": "jiraplus", "id": "jira-variables" });
            
                for (var id in sites[key].variables) {
                    chrome.contextMenus.create({ "title": sites[key].variables[id].trigger, "contexts": ["all"], "parentId": "jira-variables", "id": id });
                }
            }
        }*/
    });
}



/*
chrome.contextMenus.onClicked.addListener(onClickHandler);

var StR = "STEPS TO REPRODUCE:\\n\\nEXPECTED RESULT:\\n\\nACTUAL RESULT:\\n\\nADDITIONAL INFORMATION:";

function buildInfo() {
    loadInitialData();
    var ver = window.navigator.appVersion.match(/Chrome\/([0-9.]+?) /)[1];
    var browser = 'Browser: Chrome ' + ver + '\\n\\n';

    return browser + StR;
}

function onClickHandler(info, tab) {
    switch (info.menuItemId) {
        case "pasteStR":
            pasteStR();
            break;
        
        default:
            break;
    }
}

function pasteStR() {
    chrome.tabs.executeScript({
        code: 'var domElement = document.activeElement; domElement.value = "' + buildInfo() + '";'
    });
}

function createContextMenus() {
    chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({ "title": "JIRA+", "contexts": ["all"], "id": "jiraplus" });
        chrome.contextMenus.create({ "title": "Paste StR", "contexts": ["all"], "parentId": "jiraplus", "id": "pasteStR" });
        
        for (key in repositories) {
            //chrome.contextMenus.create({ "title": "Paste " + repositories[key].name + " Info", "contexts": ["all"], "parentId": "jiraplus", "id": key });
        }

        chrome.contextMenus.create({ "title": "Refresh Repositories", "contexts": ["all"], "parentId": "jiraplus", "id": "refresh" });
    });
}*/



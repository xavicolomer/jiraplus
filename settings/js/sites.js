var sites;

addSitesEventListeners();

function addSitesEventListeners() {
    $(document).on('click', '.sites #add-btn', function() {
        var html = templ('site_form_templ', getEmptySite());
        openDialog(html);
    });

    $(document).on('click', '.sites #edit-btn', function() {
        var site, html;
        site = sites[getCurrentSite()];
        html = templ('site_form_templ', site);
        openDialog(html);
    });

    $(document).on('click', '.sites li', function() {
        selectSite($(this).attr('id'));
    });

    $(document).on('click', '.sites #download-btn', function() {
        var site, data, a;
        site = sites[getCurrentSite()];
        data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(site));

        a = document.createElement('a');
        a.href = "data:" + data;
        a.download = site.id + '.json';
        a.click();
    });

    $(document).on('change', '.sites #upload-files-dialog', function(event) {
        var files, reader, i, file;
        files = event.target.files; 

        for (i = 0; i < files.length; i++) {
            file = files[i];
            reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    $.ajax({
                        dataType: "json",
                        url: e.target.result,
                        data: {},
                        success: parseJSONSite
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }
    });

    $(document).on('click', '.sites #remove-btn', function() {
        var site = sites[getCurrentSite()];

        if (typeof site !== 'undefined') {
            delete(sites[getCurrentSite()]);
            chrome.storage.sync.set({ 'sites': sites }, onSiteSavedToDisk);
            removeVariablesSection();
            removeActionsSection();
        }
    });

    $(document).on('click', '#site-form .submit-btn', function() {
        var site;

        if (isSitesFormValid()) {
            site = getSiteObjectFromForm();

            if (typeof site.oldKey !== 'undefined' && site.oldKey !== "" && site.oldKey !== site.id) {
                delete(sites[site.oldKey]);
            }
            
            if (typeof sites[site.id] !== 'undefined') {
                site = sites[site.id];
            } else {
                sites[site.id] = site;
            }
            
            delete(site.oldKey);
            chrome.storage.sync.set({ 'sites': sites }, onSiteSavedToDisk);
            closeDialog();
        }
    });
}

function parseJSONSite(data) {
    try {
        if (typeof sites === 'undefined') {
            sites = {};
        }

        if (typeof data.id === 'undefined') {
            return;
        }

        sites[data.id] = data;
        chrome.storage.sync.set({ 'sites': sites }, onSiteSavedToDisk);
    } catch (e) {
        throw 'Could not read json file.';
    }
}

function getEmptySite() {
    var site = {};
    site.name = "";
    site.id = "";
    site.url = "";
    site.description = "";
    return site;
}

function getSiteObjectFromForm() {
    var site = {};
    site.name = $('#site-form input[name="name"]').val();
    site.oldKey = $('#site-form input[name="oldKey"]').val();

    if (site.oldKey === "") {
        site.id = slugify(site.name);
    } else {
        site.id = site.oldKey;
    }
    
    site.url = $('#site-form input[name="url"]').val();
    site.description = $('#site-form textarea[name="description"]').val();
    site.created = new Date().getTime();
    return site;
}

function getCurrentSite() {
    return $('.sites li.selected').attr('id');
}

function onSiteSavedToDisk() {
    chrome.storage.sync.get('sites', onSitesLoaded);
}

function onSitesLoaded(data) {
    sites = data['sites'];
    
    if (!sites) {
        sites = {};
    }

    if (Object.keys(sites).length === 0) {
        $('#download-btn').hide();
        $('#remove-btn').hide();
        $('#edit-btn').hide();
    } else {
        $('#download-btn').show();
        $('#remove-btn').show();
        $('#edit-btn').show();
    }
    
    refreshSites();
}

function isSitesFormValid() {
    return true;
}

function selectSite(site_id) {
    $('.sites li.selected').toggleClass('selected');
    $('.sites li#' + site_id).toggleClass('selected');
    loadSiteVariables();
    loadSiteActions();
}

function refreshSites() {
    var html, sortable, key, i;
    if (Object.keys(sites).length === 0) {
        $('.sites .content').html('Please add a new site.');
        return;
    }

    html = '<ul>';

    sortable = [];
    for (key in sites) {
        sortable.push([sites[key].created, sites[key]]);
    }
    sortable = sortable.sort(function(a, b) { return a[1].created - b[1].created})
    
    for (i = 0; i < sortable.length; ++i) {
        html += '<li class="item" id="' + sortable[i][1].id + '"><a href="#">' + sortable[i][1].name + '</a></li>'
    }

    html += '</ul>';

    $('.sites .content').html(html);
    selectSite($('.sites li').first().attr('id'));
}

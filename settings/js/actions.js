addActionsEventListeners();

function addActionsEventListeners() {
    $(document).on('click', '.actions #add-btn', function() {
        var html = tmpl('actions_form_tmpl', createEmptyAction());
        openDialog(html);
    });

    $(document).on('change', '#action-selector', function(e) {
        var action = actions[$(this).val()];
        $('#action-form textarea').attr('placeholder', action.placeholder);
    });

    $(document).on('click', '.actions .edit-btn', function() {
        var key, site, action, html;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            action = site['actions'][key];
            action.actions = buildActionsSelector(key);
            html = tmpl('actions_form_tmpl', action);
            openDialog(html);
        }
    });

    $(document).on('click', '.actions .delete-btn', function() {
        var key, site;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            delete(sites[site.id]['actions'][key]);
            chrome.storage.sync.set({ 'sites': sites }, onActionSavedToDisk);
        }
    });

    $(document).on('click', '.actions .bug-btn', function() {
        var key, site, action;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            action = site['actions'][key];
            window.open('https://regex101.com/?regex=' + action.value + '&options=gm', "_blank");
        }
    });

    $(document).on('click', '.actions .play-btn', function() {
        var key, site, action, variables, html;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            action = site['actions'][key];
            variables = precalculateAllVariablesForSite(getCurrentSite());

            action.preview = triggerActionForSite(action, getCurrentSite());
            html = tmpl('action_preview_tmpl', action);
            openDialog(html);
        }
    });

    $(document).on('click', '#action-form .submit-btn', function() {
        var site, action;
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && isActionsFormValid()) {
            action = getActionObjectFromForm();

            if (typeof site['actions'] === 'undefined') {
                site['actions'] = {};
            } else {
                if (typeof action.oldKey !== 'undefined' && action.oldKey !== "") {
                    delete(site.actions[action.oldKey]);
                }   
            }
            delete(action.oldKey);
            delete(action.actions);

            sites[getCurrentSite()]['actions'][action.trigger] = action;
            chrome.storage.sync.set({ 'sites': sites }, onActionSavedToDisk);
            closeDialog();
        }
    });
}

function triggerActionForSite(action, targetSite) {
    var site, action, subst, re, variables, text;

    site = sites[targetSite];
    
    if (typeof site === 'undefined') {
        throw 'Template not available';
        return;
    }

    if (typeof site.actions[action.trigger] === 'undefined') {
        throw 'You have not defined a trigger for this action';
        return;
    }

    action = site.actions[action.trigger];
    switch (actions[action.trigger].type) {
        case "template":
            subst = '%cr%';
            re = /(\n)/gmi; 
            variables = precalculateAllVariablesForSite(targetSite);
            action.value = action.value.replace(re, subst);

            if (action.value.indexOf('<%=') > 0) {
                text = tmpl(action.value, variables);
            } else {
                text = action.value;
            }

            subst = '\n';
            re = /(%cr%)/gmi;
            text = text.replace(re, subst);
            action.value = action.value.replace(re, subst);
            return text;
            break;
        default:
            return action.value;
    }
}

function onActionSavedToDisk() {
    loadSiteActions();
}

function createEmptyAction() {
    var action = {};
    action.trigger = "";
    action.key = "";
    action.value = "";
    action.actions = buildActionsSelector();
    return action;
}

function getActionObjectFromForm() {
    var action = {};
    action.trigger = $('#action-selector').val();
    action.oldKey = $('#action-form input[name="oldKey"]').val();
    action.value = $('#action-form textarea').val();
    action.created = new Date().getTime();
    return action;
}

function isActionsFormValid() {
    return true;
}

function loadSiteActions() {
    var site, html, action, row;
    removeActionsSection();

    site = sites[getCurrentSite()];
    html = tmpl('actions_block_tmpl', {});
    $('.variables.block').after(html);

    for (key in site['actions']) {
        if (key === "undefined") {
            delete[actions[key]];
        } else {
            action = actions[key];
            row = tmpl('action_row_tmpl', action);
            $('.actions-list .header').after(row);
        }
    }
}

function removeActionsSection() {
    $('.actions.block').remove();
}

function buildActionsSelector(selected) {
    var html, key, selectedAttr;
    html = '<option value="">Select your option</option>';
    for (key in actions) {
        selectedAttr = '';
        if (typeof selected !== 'undefined' && key === selected) {
            selectedAttr = ' selected '
        }
        html += '<option value="' + key + '" ' + selectedAttr + '>' + actions[key].title + '</option>'
    }
    return html;
}

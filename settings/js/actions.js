addActionsEventListeners();

function addActionsEventListeners() {
    $(document).on('click', '.actions #add-btn', function() {
        var action, html;

        action = createEmptyAction();
        html = tmpl('actions_form_tmpl', action);
        openDialog(html, 400, 600);
    });

    $(document).on('change', '#action-selector', function(e) {
        $('#values').html(tmpl('action_' + $(this).val() + '_tmpl', { value: "", modifiers: "" }));
    });

    $(document).on('click', '.actions .edit-btn', function() {
        var key, site, action, html;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            action = site['actions'][key];
            action.actions = buildSelector({ dictionary: allowedActions, field: 'description', preselectedOption: action.action });
            action.targets = buildSelector({ dictionary: allowedTargets, preselectedOption: action.target });
            action.issueTypes = buildSelector({ dictionary: allowedIssueTypes, preselectedOption: action.type });
            html = tmpl('actions_form_tmpl', action);
            openDialog(html, 400, 600);

            $('#values').html(tmpl('action_' + action.action + '_tmpl', action.data));
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
            window.open('https://regex101.com/?regex=' + action.data.value + '&options=' + action.data.modifiers, "_blank");
        }
    });

    $(document).on('click', '.actions .play-btn', function() {
        var key, site, action, variables, html;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['actions'] !== 'undefined' && typeof site['actions'][key] !== 'undefined') { 
            action = site['actions'][key];
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
            action.key = generateUUID();

            if (typeof site['actions'] === 'undefined') {
                site['actions'] = {};
            } else {
                if (typeof action.oldKey !== 'undefined' && action.oldKey !== "") {
                    delete(site.actions[action.oldKey]);
                }   
            }
            delete(action.oldKey);
            delete(action.actions);
            delete(action.targets);
            delete(action.issueTypes);

            sites[getCurrentSite()]['actions'][action.key] = action;
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

    myAction = site.actions[action.key];
    switch (myAction.action) {
        case "template":
            return applyTemplate(myAction.data.value, site);
            break;
        default:
            return myAction.data.value;
    }
}

function onActionSavedToDisk() {
    loadSiteActions();
}

function createEmptyAction() {
    var action = {};
    action.action = "";
    action.target = "";
    action.type = "";
    action.key = "";
    action.actions = buildSelector({ dictionary: allowedActions, field: 'description' });
    action.targets = buildSelector({ dictionary: allowedTargets });
    action.issueTypes = buildSelector({ dictionary: allowedIssueTypes });
    return action;
}

function getActionObjectFromForm() {
    var action = {};
    action.action = $('#action-selector').val();
    action.type = $('#type-selector').val();
    action.target = $('#target-selector').val();
    action.data = {};

    switch (action.action) {
        case 'validation':
            action.data.modifiers = $('#action-form input[name="modifiers"]').val();
            action.data.value = $('#action-form textarea').val();
            break;
        case 'template':
            action.data.value = $('#action-form textarea').val();
            break;
    }

    action.oldKey = $('#action-form input[name="oldKey"]').val();
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
            delete[site['actions'][key]];
        } else {
            action = site.actions[key];
            row = tmpl('action_row_tmpl', action);
            $('.actions-list .header').after(row);
        }
    }
}

function removeActionsSection() {
    $('.actions.block').remove();
}

function buildActionsSelector(selected) {
    var html, key, selectedAttr, i;
    
    html = '<option value="">Select your option</option>';
    for (key in allowedActions) {
        selectedAttr = '';
        if (typeof selected !== 'undefined' && key === selected) {
            selectedAttr = ' selected '
        }
        html += '<option value="' + key + '" ' + selectedAttr + '>' + allowedActions[key].description + '</option>'
    }
    return html;
}

function buildSelector(options) {
    var html, key, selectedAttr, i, text, sourceDictionary, preselectedOption, textAttr;

    sourceDictionary = options.dictionary;
    preselectedOption = "";
    if (typeof(options.preselectedOption) !== 'undefined') {
        preselectedOption = options.preselectedOption;
    }
    textAttr = "";
    if (typeof(options.field) !== 'undefined') {
        textAttr = options.field;
    }
    
    html = '<option value="">Select your option</option>';
    for (key in sourceDictionary) {
        selectedAttr = '';
        if (typeof preselectedOption !== 'undefined' && key === preselectedOption) {
            selectedAttr = ' selected '
        }
        text = key;
        if (typeof(textAttr) !== 'undefined' && textAttr !== "") {
            text = sourceDictionary[key][textAttr];
        }
        html += '<option value="' + key + '" ' + selectedAttr + '>' + text + '</option>'
    }
    return html;
}

function buildActionsSelectorOld(selected) {
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

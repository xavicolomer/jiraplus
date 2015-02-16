addVarsEventListeners();

function addVarsEventListeners() {
    $(document).on('click', '.variables #add-btn', function() {
        var html = tmpl('variable_form_tmpl', createEmptyVariable());
        openDialog(html);
    });

    $(document).on('click', '.variables .edit-btn', function() {
        var key, site, variable, html;

        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['variables'] !== 'undefined' && typeof site['variables'][key] !== 'undefined') { 
            variable = site['variables'][key];
            html = tmpl('variable_form_tmpl', variable);
            openDialog(html);
        }
    });

    $(document).on('click', '.variables .delete-btn', function() {
        var key, site;
        key = $(this).parents('tr').find('input[name="key"]').val();
        site = sites[getCurrentSite()];
        if (typeof site !== 'undefined' && typeof site['variables'] !== 'undefined' && typeof site['variables'][key] !== 'undefined') { 
            delete(sites[getCurrentSite()]['variables'][key]);
            chrome.storage.sync.set({ 'sites': sites }, onVariableSavedToDisk);
        }
    });

    $(document).on('click', '#variable-form .submit-btn', function() {
        var site = getCurrentSite();
        if (typeof site !== 'undefined' && isVarsFormValid()) {
            var variable = getVariableObjectFromForm();
            if (typeof sites[site].variables === 'undefined') {
                sites[site].variables = {};
            } else {
                if (typeof variable.oldKey !== 'undefined'  && variable.oldKey !== "") {
                    delete(sites[site].variables[variable.oldKey]);
                }   
            }

            delete(variable.oldKey);

            sites[site].variables[variable.key] = variable;
            chrome.storage.sync.set({ 'sites': sites }, onVariableSavedToDisk);
            closeDialog();
        }
    });
}

function onVariableSavedToDisk() {
    loadSiteVariables();
}

function createEmptyVariable() {
    var variable = {};
    variable.title = "";
    variable.key = "";
    variable.value = "";
    return variable;
}

function getVariableObjectFromForm() {
    var variable = {};
    variable.title = $('#variable-form input[name="name"]').val();
    variable.id = slugify(variable.title);
    variable.key = $('#variable-form input[name="key"]').val();
    variable.value = $('#variable-form input[name="value"]').val();
    variable.oldKey = $('#variable-form input[name="oldkey"]').val();
    variable.created = new Date().getTime();
    return variable;
}

function isVarsFormValid() {
    return true;
}

function loadSiteVariables() {
    var site, html, variable, row;
    removeVariablesSection();

    site = sites[getCurrentSite()];
    html = tmpl('variables_block_tmpl', {});
    $('.sites.block').after(tmpl('variables_block_tmpl', variable));

    for (key in systemVars) {
        variable = systemVars[key];
        variable.value = variable.callback();
        variable.type = 'system';
        row = tmpl('variables_row_tmpl', variable);
        $('.variables-list .header').after(row);
    }
    
    if (site) {
        for (key in site['variables']) {
            variable = site['variables'][key];
            variable.type = 'user';
            row = tmpl('variables_row_tmpl', variable);
            $('.variables-list').append(row);
        }
    }
}

function removeVariablesSection() {
    $('.variables.block').remove();
}


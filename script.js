var sites, currentSite, tempHandler;

document.addEventListener("onSitesLoaded", function(data) {
    sites = data.detail;
});

init();

function init() {
    var event = document.createEvent('Event');
    event.initEvent('initJIRAPlus');
    document.dispatchEvent(event);    
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

function onFocusOnDefectDescription() {
    var key, action, site = isAllowedSite();
    if (site) {
        for (key in site.actions) {
            action = site.actions[key];
            if (action.trigger === 'prefill-defect-description') {
                jQuery('textarea[name="description"]').val(applyTemplate(action.value, site.id));
            }
        }
    }
}

jQuery(document).on('focusin', 'form input', function() { 
    var type = jQuery(this).parents('#create-subtask-dialog').find('#issuetype-field').val().toLowerCase();
    if (jQuery.inArray(type, ['defect', 'sub-task', 'bug']) === -1) {
        return;
    }

    var key, action, site = isAllowedSite();
    if (site) {
        for (key in site.actions) {
            action = site.actions[key];
            if (action.trigger === 'validate-defect-description') {
                jQuery.each(jQuery('form').data('events'), function(i, e) {
                    if (i === 'submit') {
                        if (e.length && typeof(tempHandler) === 'undefined') {
                            tempHandler = e[0].handler;
                            disableFormSubmit(jQuery(this).parents('form'));
                        }
                    }
                });
            }
        }
    }
});

function enableFormSubmit(form) {
    jQuery(form).removeAttr('onsubmit');
    jQuery(form).on('submit', tempHandler);
}

function disableFormSubmit(form) {
    jQuery(form).off('submit');
    jQuery(form).attr('onsubmit', 'return false;');
}

jQuery(document).on('keyup', 'form input, form textarea[name="description"]', function(event) { 
    var re, results, key, action, site = isAllowedSite();
    if (site) {
        for (key in site.actions) {
            action = site.actions[key];
            if (action.trigger === 'validate-defect-description') {
                re = new RegExp(action.value, "gm");
                results = re.exec(jQuery('form textarea[name="description"]').val())
                jQuery('form textarea[name="description"]').next('.error.jiraplus').remove();
                if (results !== null) {
                    enableFormSubmit(jQuery(this).parents('form'));
                } else {
                    jQuery('form textarea[name="description"]').after('<div class="error jiraplus" data-field="summary">Your description does not fit the criteria.</div>');
                    disableFormSubmit(jQuery(this).parents('form'));
                }
            }
        }
    }
});

jQuery(document).on('submit', 'form', function() { 
    tempHandler = undefined;
});

jQuery(document).on('focus', 'textarea[name="description"]', function() { 
    if (jQuery('textarea[name="description"]').val() === '') {
        var type = jQuery(this).parents('#create-subtask-dialog').find('#issuetype-field').val().toLowerCase();
        switch (type) {
            case 'defect':
            case 'sub-task':
                onFocusOnDefectDescription();
                break;

            default:
                break;
        }
    } 
});
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

jQuery(document).on('change', '#issuetype-field', function() {
    tempHandler = undefined;
});

jQuery(document).on('focusin', 'form input', function() {
    var key, action, type, siteIssues, site = isAllowedSite();
    if (site) {
        if (jQuery(this).parents('form').find('#issuetype-field').length) {
            type = jQuery(this).parents('form').find('#issuetype-field').val().toLowerCase();

            for (key in site.actions) {
                action = site.actions[key];
                if (action.action == 'validation' && action.type === type) {
                    jQuery.each(jQuery('form').data('events'), function(i, e) {
                        if (i === 'submit') {
                            if (e.length && typeof(tempHandler) === 'undefined') {
                                tempHandler = e[0].handler;
                                disableFormSubmit(jQuery(this).parents('form'));
                            }
                        }
                    });
                    return;
                }
            }
        }
    }
});

jQuery(document).on('keyup', 'form input, form textarea', function(event) { 
    jQuery('.error.jiraplus').remove();
    var re, results, key, action, selector, site = isAllowedSite();
    if (site) {
        for (key in site.actions) {
            action = site.actions[key];
            if (action.action === 'validation') {
                re = new RegExp(action.data.value, action.data.modifiers);
                selector = allowedTargets[action.target]["selector"];
                results = re.exec(jQuery('form ' + selector).val());
                if (results !== null) {
                    enableFormSubmit(jQuery(this).parents('form'));
                } else {
                    jQuery('form ' + selector).after('<div class="error jiraplus" data-field="summary">Your field has not been validated by JIRA+</div>');
                    disableFormSubmit(jQuery(this).parents('form'));
                }
            }
        }
    }
});

jQuery(document).on('focus', 'form input, form textarea', function() { 
    var type, action, site = isAllowedSite();

    if (jQuery(this).parents('form').find('#issuetype-field').length) {
        if (jQuery(this).val() === '') {
            type = jQuery(this).parents('form').find('#issuetype-field').val().toLowerCase();
            for (key in site.actions) {
                action = site.actions[key];
                if (action.type === type && action.action === 'template' && jQuery(allowedTargets[action.target].selector)[0] == jQuery(this)[0]) {
                    jQuery(this).val(applyTemplate(action.data.value, site.id));
                }
            }
        } 
    }
    
});

jQuery(document).on('submit', 'form', function() { 
    tempHandler = undefined;
});

function enableFormSubmit(form) {
    jQuery(form).removeAttr('onsubmit');
    jQuery(form).on('submit', tempHandler);
}

function disableFormSubmit(form) {
    jQuery(form).off('submit');
    jQuery(form).attr('onsubmit', 'return false;');
}











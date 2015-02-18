var allowedActions = { 
        "template": 
        {
            "description" : "Template"
        },
        "validation":
        {
            "description" : "Validate"
        }
    };

var allowedTargets = {
        "description": {
            "selector": '#description'
        },
        "summary": {
            "selector": '#summary'
        }
    };

var allowedIssueTypes = {
        "defect": {},
        "sub-tasks": {},
        "functional requirement": {},
    };

var systemVars = {
        'browser': {   
            title: 'Browser Version', 
            system: true, 
            callback:browserVersion,
            key: 'browser'
        }};


function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function applyTemplate(text, site) {
    variables = precalculateAllVariablesForSite(site);
    var subst = '%cr%';
    var re = /(\n)/gmi; 
    var result = text.replace(re, subst);
    if (result.indexOf('<%=') > 0) {
        result = templ(result, variables);
    }
    var subst = '\n';
    var re = /(%cr%)/gmi;
    result = result.replace(re, subst);
    return result;
}

function precalculateAllVariablesForSite(site) {
    var variables = {};

    if (typeof site !== 'undefined') {
        for (var key in systemVars) {
            var variable = systemVars[key];
            variables[key] = variable.callback();
        }
        
        if (site) {
            for (key in sites[site]['variables']) {
                var variable = sites[site]['variables'][key];
                variables[key] = variable.value;
            }
        }
    }

    return variables;
}

function browserVersion() {
    var ver = window.navigator.appVersion.match(/Chrome\/([0-9.]+?) /)[1];
    var data = 'Chrome ' + ver + '\\n\\n';
    return 'Chrome ' + ver;
}

(function(){
    var cache = {};
 
    this.templ = function templ(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            templ(document.getElementById(str).innerHTML) :
     
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
       
            // Convert the template into pure JavaScript
            str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
        + "');}return p.join('');");
   
        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
})();
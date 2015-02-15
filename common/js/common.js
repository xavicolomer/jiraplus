var actions = {
    'prefill-defect-description': {
        'key': 'prefill-defect-description',
        'type': 'template',
        'title': 'Defect Prefill Form Description',
        'description': 'Will be executed when the user focuses on defect description',
        'placeholder': 'Your template (you can use <%=variable%>)'
    },
    'validate-defect-description': {
        'key': 'validate-defect-description',
        'type': 'validation',
        'title': 'Defect Description Validation',
        'description': 'The description will be validated with a REGEX before submitting',
        'placeholder': 'A regex validation formula'
    }
};

function applyTemplate(text, site) {
    variables = precalculateAllVariablesForSite(site);
    var subst = '%cr%';
    var re = /(\n)/gmi; 
    var result = text.replace(re, subst);
    if (result.indexOf('<%=') > 0) {
        result = tmpl(result, variables);
    }
    var subst = '\n';
    var re = /(%cr%)/gmi;
    result = result.replace(re, subst);
    return result;
}

function precalculateAllVariablesForSite(site) {
    var site = sites[site];
    var variables = {};

    if (typeof site !== 'undefined') {
        for (var key in system_vars) {
            var variable = system_vars[key];
            variables[key] = variable.callback();
        }
        
        if (site) {
            for (key in site['variables']) {
                var variable = site['variables'][key];
                variables[key] = variable.value;
            }
        }
    }

    return variables;
}

var system_vars = {
        'browser': {   
            title: 'Browser Version', 
            system: true, 
            callback:browserVersion,
            key: 'browser'
        }};

function browserVersion() {
    var ver = window.navigator.appVersion.match(/Chrome\/([0-9.]+?) /)[1];
    var data = 'Chrome ' + ver + '\\n\\n';
    return 'Chrome ' + ver;
}

(function(){
    var cache = {};
 
    this.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
     
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
$(document).ready(function() {
    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);
});

function slugify(text)
{
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function openDialog(html, width, height) {
    closeDialog();
    
    if (typeof(width) === 'undefined') {
        width = 350;
    }

    if (typeof(height) === 'undefined') {
        height = 380;
    }

    $('body').append('<div class="overlay"><div class="lightbox" style="height:' + height + 'px;width:' + width + 'px;">' + html + '</div></div>');
    $(document).keyup(closeDialog);
}

function closeDialog(event) {
    if (event) {
        if (event.keyCode == 27) { 
            $('body .overlay').remove();
            $(document).unbind("keyup", closeDialog);
        }  
    } else {
        $('.overlay').remove();
    }
} 

$(document).on('click', '.about', function() {
    var html = templ('about_templ', {});
    openDialog(html, 700, 570);
})

$(document).on('click', '.twitter', function() {
    window.open('http://twitter.com/share?text=' + 'heJIRA: A Chrome extension to prefill and validate JIRA forms' + '&url=https://chrome.google.com/webstore/detail/hejira/miecliambfmbibhngdhdifobofglcfjo&hashtags=jira,useful,development', "_blank")
})

$(document).on('click', '.close-btn', function() {
    closeDialog();
})
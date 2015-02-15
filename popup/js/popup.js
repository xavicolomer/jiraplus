$(document).ready(function() {
    addEventListeners();
});

function addEventListeners() {
    $(document).on('click', '#settings-btn', function () {
        chrome.tabs.create({url: 'chrome-extension://' + chrome.runtime.id + '/settings/settings.html'});
    });
}
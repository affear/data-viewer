(function(document) {
    'use strict';

    document.addEventListener('polymer-ready', function() {

        var DEFAULT_ROUTE = "live";
        var template = document.querySelector('#t');
        var pages = document.querySelector('#pages');
        var cache = {};
        var ajax;

        template.pages = [{
            title: "Live Simulation",
            hash: "live",
            icon: "trending-up",
            url: 'pages/sim-live.html'
        },
        {
            title: "Simulations History",
            hash: "history",
            icon: "toc",
            url: "pages/sim-history.html"
        }];
        template.pageTitle = template.pages[0];
        template.addEventListener('template-bound', function(e) {
            this.route = this.route || DEFAULT_ROUTE;
            ajax = document.querySelector('#ajax');
        });

        template.menuItemSelected = function(e, detail, sender) {
            if (detail.isSelected) {
                this.async(function() {
                    if (!cache[ajax.url]) {
                        ajax.go();
                    }
                    document.querySelector('core-scaffold').closeDrawer();
                    document.title = template.selectedPage.page.title;
                });
            }
        }
        template.onResponse = function(e, detail, sender) {
            var article = detail.response.querySelector('article');
            cache[ajax.url] = article.URL; // Primitive caching by URL.
            var pages = document.querySelector('#pages');
            this.injectBoundHTML(article.innerHTML, pages.selectedItem.firstElementChild);
        };

    });
})(wrap(document))

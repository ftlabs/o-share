/*global require,module*/

var DomDelegate = require('dom-delegate'),
    oDom = require('o-dom'),
    TextCopyHelper = require('./TextCopyHelper');

function ShareLinks(rootEl) {
    "use strict";

    var rootDomDelegate,
        shareObj = this,
        openWindows = {};

    function dispatchCustomEvent(name, data) {
        if (document.createEvent && rootEl.dispatchEvent) {
            var event = document.createEvent('Event');
            event.initEvent(name, true, true);
            if (data) {
                event.detail = data;
            }
            rootEl.dispatchEvent(event);
        }
    }

    function handleClick(ev) {
        ev.preventDefault();
        var actionEl = oDom.getClosestMatch(ev.target, 'li'),
            url;
        if (actionEl && actionEl.querySelector('a[href]')) {
            url = actionEl.querySelector('a[href]').href;
            if (actionEl.getAttribute('data-o-share-action') === "url") {
                shareUrl(url, actionEl);
            } else {
                shareSocial(url);
            }
        }
    }

    function shareUrl(url, parentEl) {
        if (!url || !parentEl || parentEl.hasAttribute("aria-selected")) {
            return;
        }
        parentEl.setAttribute('aria-selected', 'true');
        new TextCopyHelper({
            message: "Copy this link for sharing",
            text: url,
            parentEl: parentEl,
            onCopy: function() {
                dispatchCustomEvent('oTabs.copy', {
                    share: shareObj,
                    action: "url",
                    url: url
                });
            },
            onClose: function() {
                parentEl.removeAttribute('aria-selected');
            }
        });
        dispatchCustomEvent('oTabs.open', {
            share: shareObj,
            action: "url",
            url: url
        });
    }

    function shareSocial(url) {
        if (url) {
            if (openWindows[url] && !openWindows[url].closed) {
                openWindows[url].focus();
            } else {
                openWindows[url] = window.open(url, url, 'width=646,height=436');
            }
            dispatchCustomEvent('oTabs.open', {
                share: shareObj,
                action: "social",
                url: url
            });
        }
    }

    function init() {
        rootDomDelegate = new DomDelegate(rootEl);
        rootDomDelegate.on('click', handleClick);
        rootEl.setAttribute('data-o-share--js', '');
        dispatchCustomEvent('oShare.ready', {
            share: shareObj
        });
    }

    function destroy() {
        rootEl.removeAttribute('data-o-share--js');
        rootDomDelegate.destroy();
    }

    init();

    this.shareUrl = destroy;
    this.shareViaSocialMedia = destroy;
    this.destroy = destroy;
}

ShareLinks.prototype.createAllIn = function(el) {
    "use strict";
    var shareLinks = [], sEls, c, l;
    el = el || document.body;
    if (el.querySelectorAll) {
        sEls = el.querySelectorAll('[data-o-component=o-share]:not([data-o-share--js])');
        for (c = 0, l = sEls.length; c < l; c++) {
            shareLinks.push(new ShareLinks(sEls[c]));
        }
    }
    return shareLinks;
};

module.exports = ShareLinks;
// ==UserScript==
// @name         ITCMhelper.fixGamebox
// @namespace    ITCMhelper
// @version      0.1.1
// @description  Fix itcm game box.
// @author       narci <jwch11@gmail.com>
// @match        *://itcm.co.kr/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @updateURL    https://raw.githubusercontent.com/NarciSource/ITCMhelper/master/ITCMhelper.fixGamebox.meta.js
// @downloadURL  https://raw.githubusercontent.com/NarciSource/ITCMhelper/master/ITCMhelper.fixGamebox.user.js
// @grant        GM.xmlHttpRequest
// @connect      store.steampowered.com
// @license      MIT
// ==/UserScript==

if (!localStorage["profileinfo"]) {
    loadDynamicstore();
} else {
    fixTag(
        JSON.parse(localStorage["profileinfo"])
    );
}

if( $('div.steam_read_selected').length) {
    if( $('.itcm-game-toolbox').length === 0) {
        $('<div>', {
            class: 'itcm-game-toolbox',
            css: {'display': 'flex',
                  'position': 'absolute',
                  'margin': '0px 0px 0px 735px',
                  'padding': '5px 10px 3px 0px',
                  'background': 'rgb(51, 51, 51)',
                  'border-radius': '0px 20px 20px 0px' }
        }).insertBefore($('div.steam_read_selected'));
    }

    $('<div>', {
        class: 'fa fa-wrench',
        css: {'padding-left': '10px',
                'color': 'white',
                'font-size': '15px',
                'line-height': '20px',
                'cursor': 'pointer' },
        on: {
            mouseenter: function() {
                $(this).animate({ deg: 360 }, {
                    duration: 600,
                    step: function(now) {
                        $(this).css({ transform: `rotate(${now}deg)` });
                    },
                    complete: function() {
                        $(this)[0].deg=0;
                    }
                });
            },
            click: loadDynamicstore
        }
    }).appendTo($('.itcm-game-toolbox'));
}

function loadDynamicstore() {
    GM.xmlHttpRequest({
        method: "GET",
        dataType: "json",
        url: "https://store.steampowered.com/dynamicstore/userdata/",
        onload : result => {
            localStorage["profileinfo"] = result.response;
            fixTag( JSON.parse(result.response) );
        },
        onerror : error=> console.log(error)
    });
}
    
function fixTag(profileinfo) {
    $('.no_mi_app, .mi_app')
        .each((_,app)=> {
            let [match, div, id] = /steampowered\.com\/(\w+)\/(\d+)/.exec(
                $(app).find('.item_content .name').attr('href')
            );
            id = Number(id);

            if ($(app).hasClass('no_mi_app')) {
                if (div === "app" && profileinfo.rgOwnedApps.includes(id)) {
                    $(app).removeClass('no_mi_app')
                            .addClass('mi_app')
                            .siblings('.mi_app_live').eq(1).after($(app));

                }
                if (div === "package" && profileinfo.rgOwnedPackages.includes(id)) {
                    $(app).removeClass('no_mi_app')
                            .addClass('mi_app')
                            .siblings('.mi_app_live').eq(1).after($(app));
                }
            }
            if ($(app).hasClass('mi_app')) {
                if (div === "app" && !profileinfo.rgOwnedApps.includes(id)) {
                    $(app).removeClass('mi_app')
                            .addClass('no_mi_app')
                            .siblings('.mi_app_live').eq(0).after($(app));

                }
                if (div === "package" && !profileinfo.rgOwnedPackages.includes(id)) {
                    $(app).removeClass('mi_app')
                            .addClass('no_mi_app')
                            .siblings('.mi_app_live').eq(0).after($(app));
                }
            }


            if (profileinfo.rgWishlist.includes(id)) {
                $(app).css({background:'#ffdb52'});
            }

            if (Object.keys(profileinfo.rgIgnoredApps).includes(String(id))) {
                $(app).css({background:'gainsboro'});
            }
        });
}
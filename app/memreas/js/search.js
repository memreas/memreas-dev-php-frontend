$(document).ready(function() {
    var throttledRequest = _.debounce(function(query, process)
    {
        var users;
        ajaxRequest('findtag', [{tag: "tag", value: query}]
                , function(data) {
                    var q = $('#search').val();
                    users = [];
                    map = {};
                    var objs = jQuery.parseJSON(data);

                    switch (q.charAt(0))
                    {
                        case '@':
                            $.each(objs.search, function(i, obj) {
                                map[obj.username] = obj;
                                users.push(obj.username);
                            });
                            break;
                        case '!':
                            $.each(objs.search, function(i, obj) {
                                map[obj.name] = obj;
                                users.push(obj.name);
                            });
                            break;
                        case '#':
                            $.each(objs.search, function(i, obj) {
                                map[obj.name] = obj;
                                users.push(obj.name);
                            });
                            break;

                    }
                    process(users);
                });
    }, 300);


    $('#search').typeahead({
        source: function(query, process) {
            throttledRequest(query, process);
        },
        updater: function(item) {
            var target = '#search-result ul .mCSB_container';
            var action = 'findtag';
            var param = [{tag: "tag", value: this.query}];
            var q = this.query;
            var page = 1;
            var totalPage = 1;
            switch (item.charAt(0)) {
                case '@':
                    var reqhandler = function(data) {
                        $(".tabcontent-detail").hide();
                        $("#search-result").show();
                        $(target).empty();

                        var objs = jQuery.parseJSON(data);
                        $('#search-count').text(objs.count);
                        $.each(objs.search, function(i, obj) {
                            personalSearchLi(target, obj);
                        });
                        $('.btn-friends').click(function() {
                            addFriend($(this).attr('id'));
                        });
                        $('#search-result ul').removeClass().addClass('personresults scrollClass');
                        ajaxScrollbarElement(".mCSB_container");


                    }
                    break;
                case '!':
                    var action = 'findevent';
                    //  var param  = [{tag: "tag", value: this.query}]; 
                    var reqhandler = function(data) {
                        $(".tabcontent-detail").hide();
                        $("#search-result").show();
                        $(target).empty();
                        var objs = jQuery.parseJSON(data);
                        $('#search-count').text(objs.count);
                        totalPage = objs.totalPage;
                        $.each(objs.search, function(i, obj) {
                            eventSearchLi(target, obj);
                        });
                        $('#search-result ul').removeClass().addClass('memreas_results scrollClass');
                        ajaxScrollbarElement(".mCSB_container");
                    }
                    break;
                case '#':
                    var action = 'findevent';
                    var param = [{tag: "tag", value: this.query}];
                    var reqhandler = function(data) {
                        var objs = jQuery.parseJSON(data);
                        $.each(objs.search, function(i, obj) {
                            showSearchResult(target, obj);
                        });
                    }

                    break;
            }




            ajaxRequest(action, param, reqhandler);
            $(".btn-event-n").click(function() {

                page = page + 1;
                var param = [{tag: "tag", value: q},
                    {tag: "page", value: page.toString()},
                ];
                ajaxRequest(action, param, reqhandler);




                if (page > totalPage - 1) {
                    $(".btn-event-n").hide();
                    $(".btn-event-p").show();
                    return;
                } else {
                    $(".btn-event-p").show();
                }

            });



            $(".btn-event-p").click(function() {
                page = page - 1;
                var param = [{tag: "tag", value: q},
                    {tag: "page", value: page.toString()},
                ];
                ajaxRequest(action, param, reqhandler);
                if (page == 1) {
                    $(".btn-event-p").hide();
                    $(".btn-event-n").show();
                } else {
                    $(".btn-event-n").show();
                }
            });

            $(".btn-event-p").hide();

            return item;
        },
        highlighter: function(item) {
            return h(item);
        }
    });
});

var h = function(item) {

    switch (item.charAt(0)) {
        case '@':
            var photo = map[item].profile_photo;
            var name = map[item].username;
            break;
        case '!':
            var photo = map[item].event_photo;
            var name = map[item].name;
            break;
    }
    html = '<div class="typeahead">';
    html += '<div class="sd-pic"><a class="pull-left" href="#"><img src=' + photo + ' /></a>'
    html += '<div class="sd-title">';
    html += '<p class="sd-heading">' + name + '</p>';
    html += '</div>';
    html += '</div>';
    html = '<div class="bond"><img src="' + photo + '"><strong>' + name + '</strong></div>';
    return html;



}
function personalSearchLi(target, item) {


    var photo = item.profile_photo;
    var name = $.trim(item.username);
    var op = '<li><figure class="pro-pics"><img src="'
            + photo + '" alt=""></figure><div class="user-names">'
            + name + '</div><button class="btn-friends" id="'
            + name + '">add friend</button></li>';
    $(target).append(op);
}
function eventSearchLi(target, item) {
    var event_img = item.event_photo;
    var name = $.trim(item.name);

    var op = '<li>'
            + '<div class="event_img"><img src="'
            + event_img + '" alt=""></div><aside class="event_name">'
            + name + '</aside><div class="event_like"><span>'
            + item.like_count + '</span></div><div class="event_comment"><span>' + item.comment_count + '</span></div>'
            + ' <div class="event_members">';
    if (item.friends.length > 0) {
        $.each(item.friends, function(i, friend) {
            op += '<div class="event_gallery_pro"><img src="' + friend.profile_photo + '"></div>'
        });
    }



    op += '</div></li>';
    $(target).append(op);
}

function addFriend(name) {
    var user_id = $("input[name=user_id]").val();
    var photo = map[name].profile_photo;
    var selFriends = [];
    selFriends[0] = {
        tag: 'friend',
        value: [
            {tag: 'friend_name', value: name.replace("@", "")},
            {tag: 'network_name', value: 'memeras'},
            {tag: 'profile_pic_url', value: photo}
        ]
    };
    ajaxRequest(
            'addfriendtoevent',
            [
                {tag: 'user_id', value: user_id},
                {tag: 'event_id', value: ''},
                {tag: 'friends', value: selFriends}
            ],
            function(ret_xml) {
                // parse the returned xml.
                var status = getValueFromXMLTag(ret_xml, 'status');
                var message = getValueFromXMLTag(ret_xml, 'message');
                if (status.toLowerCase() == 'success') {

                    jsuccess('your friends added successfully.');
                    //$(".popupContact li").each (function(){ $(this).removeClass ('setchoosed');});
                }
                else
                    jerror(message);
            }
    );




}


	
$(document).ready(function() { 			
			var throttledRequest = _.debounce(function(query, process)
			{
				var users;
				ajaxRequest('findtag',[{tag: "tag", value: query}]
				, function(data){
					users = [];
					map = {};
					var objs = jQuery.parseJSON( data );
					$.each(objs.search, function (i, obj) {
					map[obj.username] = obj;
					users.push(obj.username);
					});
				process(users);
				});
			}, 300);


$('#search').typeahead({
  
	source: function (query, process) {
		throttledRequest(query, process);
		},
	updater: function (item) {
		ajaxRequest('findtag',[{tag: "tag", value: this.query}]
					, function(data){
						var target ='#search-result ul .mCSB_container';
						$(".tabcontent-detail").hide();
						$("#search-result").show();
	                    $(target).empty();
	                    var objs = jQuery.parseJSON( data );
	                    $('#search-count').text(objs.count);
						$.each(objs.search, function (i, obj) {
							showSearchResult(target,obj);
						});
						$('.btn-friends').click(function() {
							addFriend($(this).attr('id'));
	     				});
										
					}
				);
			ajaxScrollbarElement(".mCSB_container");
			return item ;
		},
	highlighter: function(item){
			var photo = map[item].profile_photo;
			var name  = map[item].username;
			html = '<div class="typeahead">';
			html += '<div class="media"><a class="pull-left" href="#"><img src=' + photo + ' /></a>'
			html += '<div class="media-body">';
			html += '<p class="media-heading">' + name + '</p>';
			html += '</div>';
			html += '</div>';
			return html;
	
		}
        });
}); 

function showSearchResult(target,item){
	var photo = item.profile_photo;
	var name = $.trim(item.username);
	var op = '<li><figure class="pro-pics"><img src="'
		+ photo + '" alt=""></figure><div class="user-names">'
		+ name + '</div><button class="btn-friends" id="'
		+name+'">add friend</button></li>';
		$(target).append(op);
   
	
	}

  function addFriend(name){
      var user_id = $("input[name=user_id]").val();
      var photo = map[name].profile_photo;
var selFriends  = [];
   selFriends[0] = {
          tag: 'friend',
          value: [
                { tag: 'friend_name',     value: name.replace("@","") },
                { tag: 'network_name',    value: 'memeras' },
                { tag: 'profile_pic_url',   value: photo }
              ]
        };
    ajaxRequest(
        'addfriendtoevent',
        [
            { tag: 'user_id',         value: user_id },
            { tag: 'event_id',         value: '' },
            { tag: 'friends',         value: selFriends }
        ],
        function(ret_xml) {
            // parse the returned xml.
            var status   = getValueFromXMLTag(ret_xml, 'status');
            var message  = getValueFromXMLTag(ret_xml, 'message');
            if (status.toLowerCase() == 'success') {

                jsuccess('your friends added successfully.');
                //$(".popupContact li").each (function(){ $(this).removeClass ('setchoosed');});
            }
            else jerror(message);
        }
    );
  
  }

	
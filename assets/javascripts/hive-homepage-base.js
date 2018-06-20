var renderTopicList = function (type, parentDomId, json) {
  var parentContainer = $(parentDomId);

  var renderTopicAge = function (topic) {
    var lastPostedAtString = topic.last_posted_at || topic.created_at;

    var lastPostedAt = Date.parse(lastPostedAtString);

    var delta = Math.round((+new Date - lastPostedAt) / 1000);

    var minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7,
        year = day * 365;

    var age;

    if (delta < minute) {
      age = delta + 's';
    } else if (delta < 2 * minute) {
      age = '1m'
    } else if (delta < hour) {
      age = Math.floor(delta / minute) + 'm';
    } else if (Math.floor(delta / hour) == 1) {
      age = '1h'
    } else if (delta < day) {
      age = Math.floor(delta / hour) + 'h';
    } else if (delta < year) {
      age = Math.floor(delta / day) + 'd';
    } else if (delta > year) {
      age = Math.floor(delta / year) + 'y';
    }

    return age;
  }

  var renderTopicTitle = function (topic) {
    return "<h4 class='hive-topic__title'>" +
      "<a href='/t/" + topic.slug + "/" + topic.id + "'>" + topic.title + "</a>" +
    "</h4>";
  }

  var renderTopicTags = function (topic) {
    if (topic.tags == undefined) {
      return '';
    }
    var tags = [];
    topic.tags.forEach(function(tag) {
      tags.push("<a href='/tags/" + tag +  "' class='discourse-tag simple'>" + tag + "</a>")
    });

    return tags.join(",&nbsp;");
  }

  var renderTopic = function (topic) {

    var renderTopicPosters = function () {
      var posters = '';
      topic.posters.slice(0, 5).forEach(function(poster) {
        json.users.forEach(function(user) {
          if (poster.user_id == user.id) {
            posters += "<a href='/u/" + user.username + "'>" +
              "<img alt='" + user.username + "' src='" + user.avatar_template.replace('{size}','370') + "' class='avatar'>" +
            "</a>"
          }
        });
      });
      return posters;
    }

    return "<div class='hive-topic'>" +
      "<div class='hive-topic__col hive-topic__col--title'>" +
        renderTopicTitle(topic) +
        "<div class='hive-topic__tags'>" +
          renderTopicTags(topic) +
        "</div>" +
      "</div>" +
      "<div class='hive-topic__col hive-topic__col--posters'>" +
        renderTopicPosters() +
      "</div>" +
      "<div class='hive-topic__col hive-topic__col--age'>" +
        renderTopicAge(topic) +
      "</div>" +
    "</div>";
  }

  var renderNewTopic = function (topic) {

    var renderTopicOriginalPoster = function () {
      var poster = '';
      poster = topic.posters[0];
      json.users.forEach(function(user) {
        if (poster.user_id == user.id) {
          poster = "<a href='/u/" + user.username + "' class='hive-topic__avatar'>" +
            "<img alt='" + user.username + "' src='" + user.avatar_template.replace('{size}','370') + "' class='avatar'>" +
          "</a>"
        }
      });
      return poster;
    }

    return "<div class='hive-topic'>" +
      "<div class='hive-row  hive-row--main'>" +
        "<div class='hive-topic__col hive-topic__col--avatar'>" +
          renderTopicOriginalPoster() +
        "</div>" +
        "<div class='hive-topic__col hive-topic__col--title'>" +
          renderTopicTitle(topic) +
          "<div class='hive-topic__tags'>" +
            renderTopicTags(topic) +
          "</div>" +
        "</div>" +
      "</div>" +
      "<div class='hive-row  hive-row--info'>" +
        "<div class='hive-topic__age'>" +
          renderTopicAge(topic) +
        "</div>" +
        "<div class='hive-topic__info'>" +
          "<span class='comments'><i class='fa fa-comments'></i>" + topic.reply_count + "</span>" +
          "<span class='reviews'><i class='fa fa-eye'></i>" + topic.views + "</span>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  renderCategory = function (category) {

    var renderCatTitle = function (category) {
      return "<h4 class='hive-topic__title'>" +
        "<a href='/c/" + category.slug + "/" + category.id + "'>" + category.name + "</a>" +
      "</h4>";
    }

    return "<div class='hive-topic'>" +
      "<div class='hive-topic__col hive-topic__col--title'>" +
        renderCatTitle(category) +
        "<div class='hive-topic__desc'>" +
          category.description +
        "</div>" +
      "</div>" +
      "<div class='hive-topic__col   hive-topic__col--count'>" +
        category.topic_count +
      "</div>" +
    "</div>";
  }

  var renderNewTopicList = function () {
    var unansweredTopics = json.topic_list.topics.filter(function(topic) {
      return topic.reply_count == 0;
    }).map(function(topic) { return topic; });

    var newTopicsToDom = '';
    unansweredTopics.slice(0, 4).forEach(function(topic) {
      newTopicsToDom += renderNewTopic(topic);
    });
    parentContainer.html("<div class='wrap'>" + newTopicsToDom + "</div>");
  }

  var renderCategoriesList = function () {
    var categoriesToDom = '';
    json.category_list.categories.slice(0, 4).forEach(function(category) {
      categoriesToDom += renderCategory(category);
    });
    parentContainer.html(categoriesToDom);
  }

  if (type=='latest') {
    return renderNewTopicList();
  }

  if (type=='categories') {
    return renderCategoriesList();
  }

  var topicsToDom = '';
  json.topic_list.topics.slice(0, 5).forEach(function(topic) {
    topicsToDom += renderTopic(topic);
  });
  parentContainer.html(topicsToDom);
}

$(function() {

  var contentToLoad = ['hot', 'categories', 'latest'];
  var loadedContent = [];

  var checkBlockAvailability = function () {
    if (loadedContent.length == contentToLoad.length) {
      $('#hive-outlet').addClass('ready');
    }
  }

  var getTopicList = function (type) {
    $.getJSON( type )
      .done(function( json ) {
        renderTopicList(type, "#hive-topic-list--" + type, json);
        loadedContent.push(type);
        checkBlockAvailability();
      })
      .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
    });
  };

  var hive = $('#hive-outlet');

  if (hive) {
    hive.removeClass('hidden');
    contentToLoad.forEach(function(contentType) {
      getTopicList(contentType);
    });
  }

});

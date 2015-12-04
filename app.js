// this function takes the question object returned by StackOverflow 
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
						 'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
							question.owner.display_name +
						'</a>' +
				'</p>' +
				'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { tagged: tags,
					site: 'stackoverflow',
					order: 'desc',
					sort: 'creation'};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
		.done(function(result){
			var searchResults = showSearchResults(request.tagged, result.items.length);

			$('.search-results').html(searchResults);

			$.each(result.items, function(i, item) {
				var question = showQuestion(item);
				$('.results').append(question);
			});
			console.log(result);
		})
		.fail(function(jqXHR, error){
			var errorElem = showError(error);
			$('.search-results').append(errorElem);
		});
};

var userInput = function(event){
  event.preventDefault();
  var userRequest = $("#search").val();
  connectToEndpoint(userRequest);
}

var displayResults = function(result, responseContainer){
  responseContainer.appendTo($('.container'));
    var displayName = result.user.display_name,
        link = result.user.link,
        pic = result.user.profile_image,
        score = result.score,
        postCount = result.post_count;
    responseContainer.find('.link').attr('href', link);
    responseContainer.find('.profile-image').attr('src', pic);
    responseContainer.find('.display-name').text(displayName);
    responseContainer.find('.post-count').text(postCount);
    responseContainer.find('.score').text(score);
}

// Connect to StackExchange Endpoint
function connectToEndpoint(tag){
  var endpoint = "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/all_time";
  var request = {
    tag: tag,
    site: "stackoverflow"
  }
  $.ajax({
    url: endpoint,
    data: request,
    dataType: "jsonp",
    type: "GET"
  })
  .done(function(data){
    console.log(data);
    var numberofItems = data.items.length;
    if(numberofItems < 1){
      $("<p>This tag returned no results. Try another search?</p>").appendTo($(".add-stuff"));
    }else {
      $.each(data.items, function(index, value){
        var responseContainer = $(".templates .tag-return-response").clone();
        displayResults(value, responseContainer);
      });
    }
  })
  .fail(function(){
    console.log("Totally Failed");
    $("<p>Whoops! Something went wrong. Try again!</p>").appendTo($(".add-stuff"));
  })
}


$(document).ready( function() {
	$('.unanswered-getter').submit( function(){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	$(".inspiration-getter").on("submit", userInput);
});
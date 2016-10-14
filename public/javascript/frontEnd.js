window.Instagram = {
    /**
     * Store application settings
     */
    config: {},

    BASE_URL: 'https://api.instagram.com/v1',

    init: function( opt ) {
        opt = opt || {};

        this.config.access_token = opt.access_token;
    },

    /**
     * Get a list of recently tagged media.
     */
    tagsByName: function( name, callback ) {
        var endpoint = this.BASE_URL + '/tags/' + name + '/media/recent?count=33&access_token=' + this.config.access_token;
        this.getJSON( endpoint, callback );
    },

    //ajax promise, so that we do not make multiple calls on same page
    paginate: function(url){
        return $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
        });
    },

    recurseToDate: function(url, date){
        return Instagram.paginate(url).then(function(response){
        var lastPhotoOnPage = response.data[response.data.length -1];
        var lastDateOnPage = new Date(parseInt(lastPhotoOnPage.created_time) *1000);
        console.log("end date: "+ date);
        console.log("recurseDate: "+ lastDateOnPage);

            if(lastDateOnPage <= date){
                return response;
            }
            else{
                console.log("inside recurse");
                return Instagram.recurseToDate(response.pagination.next_url, date)
            }
        });
    },

    findEndDate: function(response, endDate){
        var lastPhotoOnPage = response.data[response.data.length -1];
        var lastDateOnPage = new Date(parseInt(lastPhotoOnPage.created_time) *1000);
        console.log("end date: " + endDate);
        console.log("last date on page: "+ lastDateOnPage);
        if(lastDateOnPage > endDate){
            return false;
        }
        else return true;
    },


    getJSON: function( url, callback ) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
        }).done(function( response ) {
                if ( typeof callback === 'function' ) callback( response );
        }).fail (function (){
                alert("Error accessing Instagram");
        });
    },


    findStartDate: function (){

            isAtStartDate = Instagram.loopThroughPhotos(response, start, end);
            console.log("Inside when!");

    },

    parseDate: function(date){
        var dateArray = date.split("/");
        if(dateArray.length != 3){
            return null;
        }

        var formattedDate = new Date(dateArray[2] + "-" + parseInt(dateArray[0], 10) + "-" + parseInt(dateArray[1], 10)); //parseInt, 10 removes leading zeros
        return formattedDate;
    },

    /**
    *returns -1 if before startDate, 1 if after endDate, and 0 if photo date is between.
    * recall that we are going through dates backwards (back in time), so endDate will be seen before startDate.
    */
    compareToDates: function(date, startDate, endDate){
        if(date <= endDate && date >= startDate){
            return 0;
        }

        if(date > endDate){
            return 1;
        }

        if(date < startDate){
            return -1;
        }

        //should never get here
        else return false;


    },

    /**
    *
    *Loops through each photo on a page and checks if the date matches the query
    *If it matches, add the photo to our allPhotoResults array, otherwise keep looping
    *or return because we went too far.
    */
    loopThroughPhotos: function(response, startDate, endDate){
        var dateComparison;

        for( var i = 0; i<response.data.length;i++){
            console.log(response.data[i]);
            var date = new Date(parseInt(response.data[i].created_time) *1000);
            dateComparison = this.compareToDates(date, startDate, endDate);
            console.log("dateCompare: " + dateComparison);
            console.log("photo date: " + date);

            //if date is within time range, add to photos to post
            if(dateComparison == 0){

                allPhotoResults.push(response.data[i]);
                console.log("allPhotoResults: " +allPhotoResults.length);
            }

            //earlier than start date means we found last photo, return immediately
            if(dateComparison < 0){
                alert("That's all the photos with the requested hashtag and dates");
                return dateComparison;
            }


        }

        return dateComparison;
    },

    photoHTML: function(imageURL, username, date, i){
        return "\
                      <div class = 'photo'>\
                           <img class='image' src='"+imageURL+"' alt='image"+i+"' />\
                           <p>\
                                posted on: "+(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+"<br />\
                                posted by: <a href='https://www.instagram.com/'"+ username +"'/?hl=en>'" + username + "'</a>'\
                            </p />\
                        </div />\
                    "
    },

    //don't need iframe. pretty sure <video> will work
    videoHTML: function(videoURL, username, date, i){
        return "\
            <div class = 'photo'>\
                <iframe class='image' width='350' height='330' src='"+videoURL+"' alt='image"+i+"'> </iframe>\
                    <p>\
                       posted on: "+(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+"<br />\
                       posted by: <a href='https://www.instagram.com/'"+ username +"'/?hl=en>'" + username + "'</a>'\
                    </p />\
             </div />\
                    "
    },

    /**
    *Posts images to webpage, 33 at a time
    */
    postImages: function(){
        console.log(allPhotoResults.length);
        if(allPhotoResults.length == 0){
            alert("Sorry, no results to display");
        }
        //the div where I will post all the pictures, initialized so I can append the images later
        var $instagram = $('#instagram');
        $instagram.html('');

        //variable used to post pictures to web
        var photosToPost = [];

        if(allPhotoResults.length <= 33){
            photosToPost = allPhotoResults;
            allPhotoResults = [];
        }

        else{
            for(var index = 0;index<33;index++){
                photosToPost.push(allPhotoResults[index]);
            }
            //remove the first 33 images from the results because they have been posted
            allPhotoResults = allPhotoResults.slice(33, allPhotoResults.length);
        }



        for(var i=0; i<photosToPost.length;i++){
            var photoToPost = photosToPost[i];
            console.log(photoToPost);

            var date = new Date(parseInt(photoToPost.created_time) *1000);
            var username = photoToPost.user.username;

            //can be photo or video, but we'll call both "image"
            var imageURL;
            if(photoToPost.type == "image"){
                imageURL = photoToPost.images.low_resolution.url;
                $instagram.append(Instagram.photoHTML(imageURL, username, date, i));
            }
            else {
                imageURL = photoToPost.videos.low_bandwidth.url;
                $instagram.append(Instagram.videoHTML(imageURL, username, date, i));
            }               

        }
    }
};

Instagram.init({
    access_token: '272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d'
});


$(document ).click(function (){

    //empty array of photos we will add to if they fit the requirements. global var
    allPhotoResults = [];

    $( '#form').on('submit', function (e){
        e.preventDefault();

        console.log("SUBMITTED");

        var tagName = $('#hashtag').val();        
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();

        //using as global vars
        start = Instagram.parseDate(startDate)
        end = Instagram.parseDate(endDate);

        console.log(start);
        console.log(end);

        if(start === null | end === null){
            alert("Please enter date in form 'MM/DD/YYYY'");
            return;
        }

        if(end < start){
            alert("Please enter an end date that occurs after the start date");
            return;
        }
                        
        
        Instagram.tagsByName (tagName, function(response){
            //nextURL to paginate to, only 33 pics per url
            nextURL = response.pagination.next_url;

            //check the first 33 images to see if pagination is necessary
            //end date comes before start date because we go backwards in time
            var isAtEndDate = Instagram.findEndDate(response, end);
            isAtStartDate = 0;         


            //finds end date recursively, then loops through photo
            $.when(Instagram.recurseToDate(nextURL, end)).then(function (response){
                nextURL = response.pagination.next_url;
                isAtStartDate = Instagram.loopThroughPhotos(response, start, end);
                Instagram.postImages();           
            });           

        });

    });
}); 

$(document).ready(function() {
    $(window).scroll(function(){ 
        if ($(window).scrollTop() >= ($(document).height() - $(window).height() - 100)){

            if(!isAtStartDate == 0){
                Instagram.paginate(nextURL, function(nextResponse){
                console.log(nextResponse);
                console.log("start date: " + isAtStartDate);
                console.log("next url: " + nextURL);
                isAtStartDate = Instagram.loopThroughPhotos(nextResponse, start, end);
                nextURL = nextResponse.pagination.next_url;
                Instagram.postImages();
                });
            }
            else{
                alert("That's all the images!");
                return;
            }
        }
    });
});
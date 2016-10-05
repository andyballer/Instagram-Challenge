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
        var endpoint = this.BASE_URL + '/tags/' + name + '/media/recent?access_token=' + this.config.access_token;
        this.getJSON( endpoint, callback );
    },

    paginate: function(url, callback){
        this.getJSON(url, callback);
    },

    getJSON: function( url, callback ) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            success: function( response ) {
                if ( typeof callback === 'function' ) callback( response );
            }
        });
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
    *loops through each photo on a page and checks if the date matches the query
    */
    loopThroughPhotos: function(response, startDate, endDate){
        var dateComparison;
        for( var i = 0; i<response.data.length;i++){
            var date = new Date(parseInt(response.data[i].created_time) *1000);
            dateComparison = this.compareToDates(date, startDate, endDate);

            if(dateComparison == 0){
                photosToPost.push(response.data[i]);
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
    }
};

Instagram.init({
    access_token: '272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d'
});


/**
$(document ).ready(function (){
    Instagram.tagsByName(function (response) {
        var $instagram = $( '#instagram');
        for( var i = 0; i<response.data.length;i++){
            var imageURL = response.data[i].images.standard_resolution.url;
            $instagram.append( '<img src ="' + imageURL + '" />');
        }
    });
**/
$(document ).ready(function (){

    //empty array of photos we will add to if they fit the requirements. global var
    photosToPost = [];

    $( '#form').on('submit', function (e){
        e.preventDefault();

        var tagName = $('#hashtag').val();
        
        
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();

        var start = Instagram.parseDate(startDate)
        var end = Instagram.parseDate(endDate);
        if(start === null | end === null){
            alert("Please enter date in form 'MM/DD/YYYY'");
            return;
        }

        if(end < start){
            alert("Please enter an end date that occurs after the start date");
            return;
        }
                        
        
        Instagram.tagsByName (tagName, function(response){
            //nextURL to paginate to, only 20 pics per url
            var nextURL;

            //find dates requested 

            //check the first 20 images to see if pagination is necessary
            var isAtStartDate = Instagram.loopThroughPhotos(response, start, end);
            //if it is, start paginating to get to results from the end date, all the way through start date
            var x = 10;
            nextURL = response.pagination.next_url;
            while(x > 5){ //isAtStartDate >= 0){
                Instagram.paginate(nextURL, function(response){
                    isAtStartDate = Instagram.loopThroughPhotos(response, start, end);
                    nextURL = response.pagination.next_url;
                });
                x--;
            }
        });

        //the div where I will post all the pictures, initialized so I can append the images later
        var $instagram = $('#instagram');
        $instagram.html('');

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
        //for i in photos to post, instagram.append photosToPost[i]. paginate .onScroll();

    }); 
});

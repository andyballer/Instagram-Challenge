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
        console.log(date);
        console.log(dateArray.length);
        if(dateArray.length != 3){
            return null;
        }

        var formattedDate = new Date(dateArray[2] + "-" + parseInt(dateArray[0], 10) + "-" + parseInt(dateArray[1], 10)); //parseInt, 10 removes leading zeros
        console.log(formattedDate);
        return formattedDate;


    },

    isBetweenDates: function(date, startDate, endDate){
        if(date > endDate || date < startDate){
            return false;
        }

        return true


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
            var $instagram = $('#instagram');
            $instagram.html('');
            for( var i = 0; i<response.data.length;i++){

                var date = new Date(parseInt(response.data[i].created_time) *1000);

                if(Instagram.isBetweenDates(date, start, end)){

                    var imageURL = response.data[i].images.low_resolution.url;
                    var username = response.data[i].user.username;
                
                  $instagram.append("\
                      <div class = 'photo'>\
                           <img class='image' src='"+imageURL+"' alt='image"+i+"' />\
                           <p>\
                                posted on: "+(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+"<br />\
                                posted by: <a href='https://www.instagram.com/'"+ username +"'/?hl=en>'" + username + "'</a>'\
                            </p />\
                        </div />\
                    ");
                }
               // else return;
            }
        });
    });
});

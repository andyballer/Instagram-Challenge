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
        
        var tagName = $('#searchBar').val();
        Instagram.tagsByName (tagName, function(response){
            var $instagram = $('#instagram' );
            $instagram.html('');
            for( var i = 0; i<response.data.length;i++){
                var date = new Date(parseInt(response.data[i].created_time) *1000);
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
        });
    });
});

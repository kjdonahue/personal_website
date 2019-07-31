var state = {
    photos: [],
    selectedPhotoIndex: null
};

function setOverlayPhotoSrc(src) {
    document.getElementById('enlargedPhoto').src = src;
}

// function to reset the selected overlay photo and its info to empty.
// Without this, we would get a flash of an empty img tag on fadeOut of the selectedPhoto.
function clearVals() {
    state.selectedPhotoIndex = null;
    setOverlayPhotoSrc('');
}

function minimizePhoto() {
    $('body').find($('#overlay-photo')).fadeOut(200, clearVals)
}

function navigateLeft() {
    // if user clicks left arrow from first item in list, navigate to last photo
    var index = state.selectedPhotoIndex - 1 === -1 ? state.photos.length - 1 : state.selectedPhotoIndex - 1;
    state.selectedPhotoIndex = index;
    setOverlayPhotoSrc(state.photos[index].url_o);
}

function navigateRight() {
    // if user clicks left arrow from first item in list, navigate to last photo
    var index = state.selectedPhotoIndex + 1 === state.photos.length ? 0 : state.selectedPhotoIndex + 1;
    state.selectedPhotoIndex = index;
    setOverlayPhotoSrc(state.photos[index].url_o);
}

function enlargePhoto(event) {
    // only enlarge photo if the screen is wider than 800 px. otherwise the images fill width anyway
    if (window.innerWidth >= 800) {
        var index;
        var target = $(event.target);

        if (target.is('img')) {
            index = target.parent().index();
            state.selectedPhotoIndex = index;
        }

        setOverlayPhotoSrc(state.photos[index].url_o);
        //setOverlayPhotoSrc('./styles/pics/kyle3.jpg');

        $('body').find($('#overlay-photo')).fadeIn(400);
    }
}

// DOCS for the meat of this: http://www.developerdrive.com/2013/05/creating-a-jquery-gallery-for-flickr/
(function( $ ) {
    $.fn.loadFlickrPhotos = function(options) {
        var url = 'https://api.flickr.com/services/rest/?jsoncallback=?';

        var settings = $.extend( {
            api_key: '278dbaaf2b2331ecb4b9a308290d67e4',
            user_id: '162412704@N08', // Kyle's user id
            photoset_id: '72157704053325964', // Kyle's photoset id
            per_page: 100
        }, options);

        return this.each(function() {
            var gallery = $(this);
            gallery.addClass('flickr-gallery');
            gallery.append(
                '<div class="browser">' +
                    '<ul class=' + settings.classes + '></ul>' +
                '</div>'
            );

            $.getJSON(url, {
                method: 'flickr.photosets.getPhotos', // DOCS https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
                api_key: settings.api_key,
                user_id: settings.user_id,
                photoset_id: settings.photoset_id,
                format: 'json',
                extras: 'url_q,url_m,url_z, url_o, date_taken,tags' // DOCS photo size options https://www.flickr.com/services/api/misc.urls.html
            }).success(function(response) {
                var list = gallery.find('ul:first');
                list.html('');

                // set results to local state var
                state.photos = response.photoset.photo;

                $.each(response.photoset.photo, function(index){
                    list.append(
                        '<li>' +
                            '<img src="' + this.url_z + '" ' +
                                'alt="photo-' + index + '" />' +
                        '</li>'
                    );
                });

                list.on('click', enlargePhoto);

            }).fail(function(state) {
                alert("Unable to retrieve photos.");
            });
        });
    };
})( jQuery );

function loadIndexImages() {
    $('div#gallery').loadFlickrPhotos({ 
            photoset_id: '72157704053325964',
            per_page: 9,
            classes: 'uniform'
        });
}

function loadPortfolioImages() {
     $('div#gallery').loadFlickrPhotos({ 
            photoset_id: '72157708286336705',
            classes: 'ragged'
        });
}

// handle keypress events if enlarged photo is showing
$(document).keyup(function(e) {
    if (document.getElementById('overlay-photo').style.display === 'block') {
        switch(e.keyCode) {
            // ESC
            case 27:
                minimizePhoto();
                break;
            // Left arrow
            case 37:
                navigateLeft();
                break;
            // Right arrow
            case 39:
                navigateRight();
                break;
        }
    }
});

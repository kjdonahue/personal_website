var state = {
    photos: [],
    selectedPhotoIndex: null
};

function setOverlayPhotoSrc(index) {
    var photo = state.photos[index];
    var isPortrait = isPhotoAPortrait(photo);
    var photoElement = $('#enlargedPhoto');
    var url = getPhotoUrlByIndex(index);

    // Temporarily hide the element so the photo doesn't flash
    // when changing between portrait modes
    photoElement.hide();

    if (isPortrait) {
        photoElement.addClass('portrait').attr('src', url);
    } else {
        photoElement.removeClass('portrait').attr('src', url);
    }

    photoElement.show();
}

function clearOverlay() {
    $('#enlargedPhoto').attr('src', '');
}

function isPhotoAPortrait(photo) {
    return photo.height_c > photo.width_c;
}

// function to reset the selected overlay photo and its info to empty.
// Without this, we would get a flash of an empty img tag on fadeOut of the selectedPhoto.
function clearVals() {
    state.selectedPhotoIndex = null;
    clearOverlay();
}

function minimizePhoto() {
    var photoElement = $('body').find($('#overlay-photo'));
    photoElement.fadeOut(200, clearVals);
    photoElement.removeClass('portrait');
}

function getPhotoByIndex(index) {
    return state.photos[index];
}

function getPhotoUrlByIndex(index) {
    var photo = getPhotoByIndex(index);
    var url = photo.url_c;
    return url;
}

function getPhotoHtml(index) {
    var photo = getPhotoByIndex(index);
    var photoUrl = getPhotoUrlByIndex(index);
    var isPortrait = isPhotoAPortrait(photo);

    var imgTag;
    if (isPortrait) {
        imgTag = '<img class="portrait" src="' + photoUrl + '" ' +
                    'alt="photo-' + index + '" />'
    } else {
        imgTag = '<img src="' + photoUrl + '" ' +
                    'alt="photo-' + index + '" />'
    }

    var html = '<li>' + imgTag + '</li>';
    return html;
}

function navigateLeft() {
    // if user clicks left arrow from first item in list, navigate to last photo
    var index = state.selectedPhotoIndex - 1 === -1 ? state.photos.length - 1 : state.selectedPhotoIndex - 1;
    state.selectedPhotoIndex = index;
    setOverlayPhotoSrc(index);
}

function navigateRight() {
    // if user clicks left arrow from first item in list, navigate to last photo
    var index = state.selectedPhotoIndex + 1 === state.photos.length ? 0 : state.selectedPhotoIndex + 1;
    state.selectedPhotoIndex = index;
    setOverlayPhotoSrc(index);
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

        setOverlayPhotoSrc(index);

        $('#overlay-photo').fadeIn(400);
    }
}

// DOCS for the meat of this: http://www.developerdrive.com/2013/05/creating-a-jquery-gallery-for-flickr/
(function( $ ) {
    $.fn.flickr = function(options) {
        var url = 'https://api.flickr.com/services/rest/?jsoncallback=?';

        var settings = $.extend({
                method: 'flickr.photosets.getPhotos', // DOCS https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
                api_key: '278dbaaf2b2331ecb4b9a308290d67e4',
                user_id: '162412704@N08', // Kyle's user id
                per_page: 100,
                format: 'json',
                extras: 'url_q, url_z, url_c' // DOCS photo size options https://www.flickr.com/services/api/misc.urls.html
        }, options);

        return this.each(function() {
            var gallery = $(this);
            gallery.addClass('flickr-gallery');
            gallery.append('<div class="viewport"></div><div class="browser"><ul></ul></div><div class="clear"></div>');

            $.getJSON(url, settings).success(function(response) {
                var list = gallery.find('ul:first');
                list.html('');

                // set results to local state var
                state.photos = response.photoset.photo;

                $.each(response.photoset.photo, function(index){
                    var photoHtml = getPhotoHtml(index);
                    list.append(photoHtml);
                });

                list.on('click', enlargePhoto);

            }).fail(function(state) {
                alert("Unable to retrieve photos.");
            });
        });
    };
})( jQuery );

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

$(document).on('ready', function(){
    $('div#gallery').flickr({ photoset_id: getPhotoSetId()});
});

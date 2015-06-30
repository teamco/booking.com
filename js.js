(function () {

    if (!Object.keys) {

        /**
         * Define object keys overrides
         * @param hash
         * @returns {Array}
         */
        Object.prototype.keys = function (hash) {
            var keys = [], k;
            for (k in hash) {
                if (hash.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };
    }

    if (!String.repeat) {

        /**
         * Define string repeat
         * @param times
         * @returns {string}
         */
        String.prototype.repeat = function (times) {
            return new Array(times + 1).join(this);
        }
    }

    /**
     * Abstract item
     * @param {string} instance
     * @param {object} [opts]
     * @class Item
     * @constructor
     */
    function Item(instance, opts) {

        opts = opts || {};

        /**
         * Define type of instance
         * @property Item
         * @type {string}
         */
        this.instance = instance;

        /**
         * Define items collector
         * @property Item
         * @type {object}
         */
        this.items = {};

        /**
         * Define Crud
         * @param scope
         * @class Crud
         * @private
         * @constructor
         */
        function _Crud(scope) {
            this.scope = scope;
        }

        _Crud.prototype = {

            constructor: _Crud,

            /**
             * Define create
             * @param node
             * @param index
             * @param [opts]
             * @returns {*}
             */
            create: function create(node, index, opts) {
                if (this.read(index)) {
                    // Item already exist
                    return false;
                }
                this.scope.items[index] = new Item(node, opts);
                return this.scope.items[index];
            },

            /**
             * Define destroy
             * @param index
             * @returns {*}
             */
            destroy: function destroy(index) {
                if (!this.read(index)) {
                    return false;
                }
                delete this.scope.items[index];
                return this.scope;
            },

            /**
             * Define read
             * @param index
             * @returns {*}
             */
            read: function read(index) {
                if (!this.scope.items.hasOwnProperty(index)) {
                    // Undefined item
                    return false;
                }
                return this.scope.items[index];
            },

            /**
             * Define update
             * @param indexOld
             * @param indexNew
             * @returns {*}
             */
            update: function update(indexOld, indexNew) {
                if (!this.read(indexOld)) {
                    return false;
                }

                /**
                 * Define copy if instance
                 * @type {string}
                 */
                var instance = this.scope.items[indexOld].instance;
                this.destroy(indexOld);
                this.create(instance, indexNew);

                return this.scope.items[indexNew];
            }
        };

        /**
         * define Crud instance
         * @property Item
         * @type {_Crud}
         */
        this.crud = new _Crud(this);

        if (Object.prototype.toString.call(opts) === '[object Object]') {

            var index;

            for (index in opts) {

                if (opts.hasOwnProperty(index)) {

                    /**
                     * Define properties
                     * @property Item
                     */
                    this[index] = opts[index];
                }
            }

        } else {

            /**
             * Define data
             * @property Item
             * @type {Object}
             */
            this.content = opts;
        }
    }

    /**
     * Define collector
     * @param item
     * @param node
     * @param index
     * @param collector
     * @private
     * @returns {object}
     */
    function _collectItems(node, index, collector) {

        var i = 0, l = collector.length;

        /**
         * Define instance
         * @type {node}
         */
        var instance = hotel.crud.create(node, index);

        for (; i < l; i++) {

            // Define items of instance
            instance.crud.create(node, i, collector[i]);
        }

        return instance;
    }

    /**
     * Define images renderer
     * @param data
     * @private
     */
    function _renderImages(data) {

        var index, content = [];

        for (index in data) {

            if (data.hasOwnProperty(index)) {

                var prefs = data[index];

                content.push(
                    $('<li />').append(
                        $('<a />').append(
                            $('<img />').attr({
                                src: prefs.thumbnail,
                                alt: prefs.description
                            })
                        ).attr({href: prefs.large})
                    )
                );
            }
        }

        $('section.photos > ul').append(content);
    }

    /**
     * Define description renderer
     * @param data
     * @private
     */
    function _renderDescription(data) {

        var index, content = [];

        for (index in data) {

            if (data.hasOwnProperty(index)) {

                content.push(
                    $('<p />').text(data[index].content)
                )
            }
        }

        $('section.description div:first').append(content);
    }

    /**
     * Define facilities renderer
     * @param data
     * @private
     */
    function _renderFacilities(data) {

        var index, content = [];

        for (index in data) {

            if (data.hasOwnProperty(index) && data[index].available) {

                content.push(
                    $('<li />').text(data[index].type)
                )
            }
        }

        $('section.facilities > ul').append(content);
    }

    /**
     * Define rooms renderer
     * @param data
     * @private
     */
    function _renderRooms(data) {

        var index, content = [];

        for (index in data) {

            if (data.hasOwnProperty(index)) {

                var prefs = data[index],
                    options = [], range = prefs.quantity.range.split('-'),
                    i = range[0], l = range[1];

                for (; i < l; i++) {
                    var $option = $('<option />').attr({
                        value: i
                    }).text(i);
                    if (!i) $option.attr({selected: 'selected'});
                    options.push($option);
                }

                content.push(
                    $('<tr />').append([
                        $('<td />').addClass('room_name').text(prefs.name),
                        $('<td />').addClass('room_occupancy').text(prefs.occupancy),
                        $('<td />').addClass('room_price').text(prefs.price),
                        $('<td />').addClass('room_quantity').append(
                            $('<select />').attr({
                                name: 'room' + prefs.quantity.type
                            }).append(options).on('change', function () {

                                var $this = $(this),
                                    $selects = $this.parents('table').find('select'),
                                    $wrapper = $('.total td:last'),
                                    pattern = /\d+\.\d+/,
                                    currency = $this.parents('tr').find('.room_price').text().replace(pattern, ''),
                                    total = 0;

                                $.each($selects, function () {

                                    var $select = $(this),
                                        rooms = +$select.val(),
                                        price = $select.parents('tr').find('.room_price').text();

                                    if (rooms) {
                                        total += +price.match(pattern)[0] * rooms;
                                    }
                                });

                                $wrapper.text(currency + (total.toFixed(2)));
                            })
                        )
                    ])
                );
            }
        }

        $('section.rooms tbody').append(content);
    }

    /**
     * Define reviews renderer
     * @param data
     * @private
     */
    function _renderReviews(data, from, to) {

        var index, content = [],
            i = 0;

        from = from || 0;

        for (index in data) {

            if (data.hasOwnProperty(index) && from <= to - 1) {

                if (i !== from) {
                    i++;
                    continue;
                }
                var prefs = data[index];

                content.push(
                    $('<li />').append([
                        $('<strong />').addClass('review_score').text(prefs.ranking),
                        $('<blockquote />').addClass('review_content').text(prefs.text),
                        $('<cite />').text(prefs.author)
                    ]).addClass('one_review')
                );

                i++;
                from++;
            }
        }

        var keys = Object.keys(data).length,
            current = to > keys ? keys : to,
            $h2 = $('section.reviews h2'),
            matchers = $h2.html().match(/\d+/g);

        if (matchers) $h2.html($h2.html().replace(matchers[0], current).replace(matchers[1], keys));
        else $h2.html('Reviews (<span>' + current + '</span> of <span>' + keys + '</span>)');
        $('ul.reviews_list').html(content);
    }

    /**
     * Define sort asc/desc
     * @param element
     * @returns {boolean}
     * @private
     */
    function _defineSorted(element) {
        if ($(element).attr('sorted') === 'asc') {
            $(element).attr('sorted', 'desc');
        } else {
            $(element).attr('sorted', 'asc');
        }
        return $(element).attr('sorted') === 'asc';
    }

    /**
     * Define table sorter
     * @private
     */
    function _bindTableSort() {

        var $wrapper = $('.rooms_table tbody');

        // Sort by Name
        $('.rooms_table th.room_name').on('click', function () {
            var sorted = _defineSorted(this);
            $wrapper.find('tr').sort(function (a, b) {
                if ($(a).find('.room_name').text() < $(b).find('.room_name').text()) return sorted ? -1 : 1;
                if ($(a).find('.room_name').text() > $(b).find('.room_name').text()) return sorted ? 1 : -1;
                return 0;
            }).appendTo($wrapper);
        });

        // Sort by Occupancy
        $('.rooms_table th.room_occupancy').on('click', function () {
            var sorted = _defineSorted(this);
            $wrapper.find('tr').sort(function (a, b) {
                return sorted ?
                +$(a).find('.room_occupancy').text() - +$(b).find('.room_occupancy').text() :
                +$(b).find('.room_occupancy').text() - +$(a).find('.room_occupancy').text();
            }).appendTo($wrapper);
        });

        // Sort by Price
        $('.rooms_table th.room_price').on('click', function () {
            var sorted = _defineSorted(this);
            $wrapper.find('tr').sort(function (a, b) {
                return sorted ?
                +$(a).find('.room_price').text().replace(/€/, '') - +$(b).find('.room_price').text().replace(/€/, '') :
                +$(b).find('.room_price').text().replace(/€/, '') - +$(a).find('.room_price').text().replace(/€/, '');
            }).appendTo($wrapper);
        });

    }

    /**
     * Define review sort asc/desc
     * @param data
     * @private
     */
    function _bindReviewSort(data, step) {

        var $wrapper = $('.reviews_list'),
            $document = $(document);

        // Sort by score
        $document.on('click', '.reviews h2 span:first', function () {
            var sorted = _defineSorted(this);
            $wrapper.find('.one_review').sort(function (a, b) {
                return sorted ?
                +$(b).find('.review_score').text() - +$(a).find('.review_score').text() :
                +$(a).find('.review_score').text() - +$(b).find('.review_score').text();
            }).appendTo($wrapper);
        });

        $document.on('click', '.reviews h2 span:last', function () {

            var sorted = _defineSorted(this),
                items = [], res = {}, key, i;

            for (key in data) items[key] = data[key];

            items.sort(function (a, b) {
                var a1, b1;
                if (sorted) {
                    a1 = +a.ranking;
                    b1 = +b.ranking;
                } else {
                    b1 = +a.ranking;
                    a1 = +b.ranking;
                }
                return a1 < b1 ? -1 : (a1 > b1 ? 1 : 0);
            });

            for (i = 0; i < items.length; i++) res[i] = items[i];

            $('.reviews_paginate li').off();
            _renderReviewsPagination(items, step);
        });
    }

    /**
     * Define reviews pagination
     * @param data
     * @param step
     * @private
     */
    function _renderReviewsPagination(data, step) {

        var $paginate = $('.reviews_paginate').html(''),
            content = [],
            i = 0, l = Math.ceil(Object.keys(data).length / step);

        for (; i < l; i++) {
            content.push('<li>' + (i + 1) + '</li>');
        }

        $paginate.append(content);

        $paginate.find('li').on('click', function () {
            var $li = $(this);
            if ($li.hasClass('current')) {
                return false;
            }
            $paginate.find('li').removeClass('current');
            var current = +$li.addClass('current').text();
            _renderReviews(data, (current - 1) * step, current * step);
        });

        $paginate.find('li:first').trigger('click');
    }

    /**
     * Define image gallery binding
     * @private
     */
    function _bindImageGallery() {

        var $photos = $('.photos li');

        function _resize() {

            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            var $modal = $('.modal-gallery'),
                $html = $('html'),
                delta = ($html.outerHeight() - $html.height()) / 2;

            if ($modal.length) {

                $modal.css({
                    left: w / 2 - $modal.width() / 2,
                    top: h / 2 - $modal.height() / 2 - delta
                });
            }
        }

        $(window).on('resize', _resize);

        $.each($photos, function () {

            var $anchor = $(this).find('a');

            var img = new Image;
            img.src = $anchor[0].href;

            img.onload = function () {
            };

            img.onerror = function () {
                $anchor.off();
            };

            $anchor.on('click', function (e) {

                e.preventDefault();

                var $this = $(e.target), interval;

                /**
                 * Update image
                 * @param {Event} event
                 * @param {string} side
                 * @param which
                 * @private
                 */
                function _updateImage(event, side, which) {
                    if (which.length) {
                        $('.modal-gallery img').attr('src', which.attr('href'));
                        $('.modal-gallery .image-alt').text($('img', which).attr('alt')),
                            $('.arrow.left').removeClass('disabled');
                        $('.arrow.right').removeClass('disabled');
                        $this = which;
                    } else {
                        $('.arrow.' + side).addClass('disabled');
                        side === 'left' ?
                            _updateImage(event, side, $('.photos li:last>a')) :
                            _updateImage(event, side, $('.photos li:first>a'));
                    }
                    if (event.hasOwnProperty('originalEvent')) {
                        _stopLoader();
                    } else {
                        _imageAutoLoader(side);
                    }
                }

                /**
                 * Define image auto rotate
                 * @private
                 */
                function _imageAutoLoader(side) {
                    var $preload = $('.modal-gallery .preload'),
                        maxWidth = parseInt($('.modal-gallery').width(), 10);

                    interval = setInterval(function () {
                        $preload.css('width', parseInt($preload.css('width'), 10) + 2 + 'px');
                        if (parseInt($preload.css('width'), 10) > maxWidth) {
                            _stopLoader();
                            $('.modal-gallery .' + side).trigger('click');
                            $('.modal-gallery .preload').css('width', 0);
                        }
                    }, 30);
                    
                    $('.image-play').html('&#9616;&#9616;').addClass('image-stop');
                }

                /**
                 * Define stop loader
                 * @private
                 */
                function _stopLoader() {
                    clearInterval(interval);
                    $('.image-play').html('&#9658;').removeClass('image-stop');
                }

                $('<div />').addClass('overlay').append(
                    $('<div />').
                        addClass('modal-gallery').
                        append([
                            $('<div title="Move left" class="arrow left" />').html('&#10094;').on('click', function (e) {
                                _updateImage(e, 'left', $this.parents('li').prev().find('a'));
                            }),
                            $('<img />').attr('src', this.href),
                            $('<div class="image-play" />').html('&#9658;').on('click', function () {
                                if ($(this).html() === $('<div />').html('&#9658;').html()) {
                                    $(this).html('&#9616;&#9616;').addClass('image-stop');
                                    _imageAutoLoader('right');
                                } else {
                                    _stopLoader();
                                }
                            }),
                            $('<div class="image-alt" />').text($('img', $this.parents('li')).attr('alt')),
                            $('<div title="Move right" class="arrow right" />').html('&#10095;').on('click', function (e) {
                                _updateImage(e, 'right', $this.parents('li').next().find('a'));
                            }),
                            $('<div title="Close" class="close" />').html('&#10006;').on('click', function () {
                                $('.overlay').off().remove();
                                _stopLoader();
                            }),
                            $('<div class="preload" />')
                        ])
                ).appendTo('body');

                $('.image-alt').slideDown();
                _resize();
            });
        });
    }

    /**
     * Update info
     * @param hotel
     * @private
     */
    function _updateHotelInfo(hotel) {
        $('.hotel_name').html(
            hotel.name + ' <span class="stars">' + '★'.repeat(hotel.ranking) + '</span>'
        );
        $('.hotel_address').text(hotel.location);
    }

    /**
     * Define map renderer
     * @param hotel
     * @private
     */
    function _renderMap(hotel) {
        var geocoder = new google.maps.Geocoder(),
            mapOptions = {zoom: 15},
            map = new google.maps.Map($('.description .map')[0], mapOptions),
            infowindow = new google.maps.InfoWindow(), location,
            address = hotel.location;

        /**
         * Create marker
         * @param place
         */
        function createMarker(place) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
            });
        }

        geocoder.geocode({'address': address}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                location = results[0].geometry.location;
                map.setCenter(location);

                var marker = new google.maps.Marker({
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    position: results[0].geometry.location
                });

                var request = {
                    location: location,
                    radius: '500',
                    types: ['store']
                };

                var service = new google.maps.places.PlacesService(map);

                service.nearbySearch(request, function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        for (var i = 0; i < results.length; i++) {
                            createMarker(results[i]);
                        }
                    }
                });

            } else {

                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    /**
     * Define hotel instance
     * @type {Item}
     */
    var hotel;

    $(document).ready(function () {

        /**
         * Define hotel instance
         * @type {Item}
         */
        hotel = new Item("Hotel", {
            name: data.name,
            ranking: data.ranking,
            location: data.location
        });

        var paginationStep = 5;

        var images = _collectItems('Images', 0, data.images),
            description = _collectItems('Description', 1, data.description),
            facilities = _collectItems('Facilities', 2, data.facilities),
            rooms = _collectItems('Rooms', 3, data.rooms),
            reviews = _collectItems('Reviews', 4, data.reviews);

        _updateHotelInfo(hotel);

        _renderImages(images.items);
        _renderDescription(description.items);
        _renderFacilities(facilities.items);
        _renderRooms(rooms.items);
        _renderReviewsPagination(reviews.items, paginationStep);
        _renderMap(hotel);

        _bindTableSort();
        _bindReviewSort(reviews.items, paginationStep);
        _bindImageGallery();
    });

})();
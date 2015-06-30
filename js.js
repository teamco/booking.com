(function () {

    if (!Object.keys) {

        /**
         * Defien object keys overrides
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
                    ).addClass('one_photo')
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

        $('section.description').append(content);
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
                            }).append(options)
                        )
                    ]).addClass('one_room')
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
            current = to > keys ? keys : to;
        $('section.reviews h2').html('Reviews (<span>' + current + '</span> of <span>' + keys + '</span>)');
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
                a = +a.ranking;
                b = +b.ranking;
                if (sorted) {
                    b = +a.ranking;
                    a = +b.ranking;
                }
                return a < b ? -1 : (a > b ? 1 : 0);
            });

            for (i = 0; i < items.length; i++) res[i] = items[i];

            _renderReviews(items, 0, step);
        });
    }

    function _renderReviewsPagination(data, step) {

        var $paginate = $('.reviews_paginate'),
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

        _renderImages(images.items);
        _renderDescription(description.items);
        _renderFacilities(facilities.items);
        _renderRooms(rooms.items);

        _renderReviewsPagination(reviews.items, paginationStep);

        _bindTableSort();
        _bindReviewSort(reviews.items, paginationStep);
    });

})();

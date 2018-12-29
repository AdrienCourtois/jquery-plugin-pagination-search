/**
 * Plugin: pagination & search (works with Bootstrap)
 * Author: Adrien Courtois
 * Copyright: Free to use
 * 
 * Usage: 
 * Info: $(this) is usually the container of the list (<ul> or <table>)
 * $().pagination() transforms the list of HTML elements (selected by jQuery) into a list with pagination
 * @arg {number} nbPerPage Number of elements per page, default is 20.
 * @arg container The jQuery element to which the HTML pagination will be appended.
 * @arg elements Must be specified: the list of the HTML elements selected by jQuery
 * @arg {string} display The default display of your HTML elements
 * 
 * $().search() is used to make a research in the elements specified by the pagination plugin, in order for the search to be displayed as a list.
 * You should call $().search() at the beginning of your document, and then use the event "search" with your search query as parameter in your code.
 * @arg format The function called receiving the HTML element as an argument and returning the text query to be compared.
 */

(function($){
	var paginationElements = [];

	/**
	 * Search functionnality:
	 * Bind the "search" and "unsearch" event in order to only display the searched elements.
	 * 
	 * The "format" parameter is a function transforming an HTML element to a text element.
	 * When called, the "search" event is passed a string which is matched with the text of each HTML element.
	 * 
	 * The "unsearch" event cancels the search mode. It is for example called when the search query is empty.
	 */
	$.fn.search = function(options) {
		var settings = $.extend({
			format: (elt) => $(elt).html()
		}, options);

		var index = parseInt($(this).attr('data-pagination-index'));

		if (isNaN(index)) {
			$(this).pagination();
			index = parseInt($(this).attr('data-pagination-index'));
		}

		$(this).on("search", function(event, query){
			if (query.trim().length == 0)
				$(this).trigger("unsearch");
			else {
				$(paginationElements[index].settings.elements).each(function(){
					if (settings.format(this).indexOf(query) >= 0)
						$(this).addClass('search-mode');
					else
						$(this).removeClass('search-mode');
				});
				
				paginationElements[index].searchMode = true;
				$(this).pagination({ index: index });
			}
		});

		$(this).on("unsearch", function(event){
			paginationElements[index].searchMode = false;
			$(paginationElements[index].settings.elements).removeClass('search-mode');

			$(this).pagination({ index: index });
		});
	};

	/**
	 * Pagination functionnality:
	 * Put the given element to be paged in a queue and displays a pager for it.
	 * The pager is then binded with the click events related.
	 */
	$.fn.pagination = function(options) {
		if (options == null)
			options = {};

		var settings = $.extend({
			nbPerPage: 20,
			container: $(this).parent(),
			elements: $(this).find('tr:not(:eq(0))'),
			display: $(this).find('tr:not(:eq(0))').css('display')
		}, options);

		if (!isNaN(options.index))
			settings = $.extend(settings, paginationElements[options.index].settings);
		
		// index of the element in the queue & adding it to the queue
		var index = (isNaN(settings.index)) ? paginationElements.length : settings.index;
		$(this).attr('data-pagination-index', index);

		if (isNaN(settings.index))
			paginationElements.push({ settings: settings, pager: null, searchMode: false });

		var self = this;
		var nbElements = (!paginationElements[index].searchMode) ? $(settings.elements).length : $(settings.elements).filter('.search-mode').length;
		var nbPage = Math.ceil(nbElements / settings.nbPerPage);
		
		if (paginationElements[index].pager != null)
			$(paginationElements[index].pager).remove();


		// managing the pager
		if (nbPage > 1){
			var pager_html = `<nav class="pagination-pager" style="text-align: center;" data-total-page="${nbPage}" data-current-page="1">
			<ul class="pagination">
				<li class="page-item disabled nav-link-previous unbinded"><a class="page-link" href="#">Previous</a></li>
				<li class="page-item active unbinded"><a class="page-link" href="#">1</a></li>
				<li class="page-item page-dots" style="display: none;"><span class="page-link">...</span></li>
				<li class="page-item active page-movable" style="display: none;"><a class="page-link" href="#"></a></li>
				<li class="page-item page-dots" ${((nbPage > 2) ? '' : 'style="display: none;"')}><span class="page-link">...</span></li>
				<li class="page-item unbinded"><a class="page-link" href="#">${nbPage}</a></li>
				<li class="page-item nav-link-next unbinded"><a class="page-link" href="#">Next</a></li>
			</ul></nav>`;

			$(settings.container).append(pager_html);
			var pager = $(settings.container).find('.pagination-pager');
			paginationElements[index].pager = pager;

			// bind events related to the pager
			pager.find('.nav-link-previous.unbinded').click(function(){
				$(self).paginationPreviousPage();
				return false;
			}).removeClass('unbinded');

			pager.find('.nav-link-next.unbinded').click(function(){
				$(self).paginationNextPage();
				return false;
			}).removeClass('unbinded');

			pager.find('.page-item.unbinded').each(function(){
				$(this).click(function(){
					$(self).paginationChangePage($(this).find('a').text());
					return false;
				}).removeClass('unbinded');
			});
		}

		// show the first nbPerPage elements
		$(settings.elements).css('display', 'none');
		var elts = (paginationElements[index].searchMode) ? $(settings.elements).filter('.search-mode') : $(settings.elements);

		for (var i = 0 ; i < Math.min($(elts).length, settings.nbPerPage) ; i++) {
			var elt = $(elts).eq(i);

			if (!paginationElements[index].searchMode || elt.hasClass('search-mode'))
				elt.css('display', settings.display);
		}

		return this;
	};

	$.fn.paginationChangePage = function(nb){
		var self = paginationElements[parseInt($(this).attr('data-pagination-index'))];
		var current_page = parseInt($(self.pager).attr('data-current-page'));
		var total_page = parseInt($(self.pager).attr('data-total-page'));
		nb = parseInt(nb);

		if (isNaN(nb) || nb < 1 || nb > total_page)
			return;
		
		// elements display
		var firstElementIndex = (nb - 1) * self.settings.nbPerPage;
		$(self.settings.elements).css('display', 'none');
		
		for (var i = 0 ; i < self.settings.nbPerPage ; i++){
			if (!self.searchMode)
				$(self.settings.elements).eq(firstElementIndex + i).css('display', self.settings.display);
			else
				$(self.settings.elements).filter('.search-mode').eq(firstElementIndex + i).css('display', self.settings.display);
		}
		
		// pager display
		if (nb == 1) {
			$(self.pager).find('.nav-link-previous').addClass('disabled');
			$(self.pager).find('.page-item:eq(1)').addClass('active');
		} else {
			$(self.pager).find('.nav-link-previous').removeClass('disabled');
			$(self.pager).find('.page-item:eq(1)').removeClass('active');
		}

		if (nb == total_page) {
			$(self.pager).find('.nav-link-next').addClass('disabled');
			$(self.pager).find('.page-item:eq(-2)').addClass('active');
		} else {
			$(self.pager).find('.nav-link-next').removeClass('disabled');
			$(self.pager).find('.page-item:eq(-2)').removeClass('active');
		}

		$(self.pager).find('.page-movable a').text(nb);
		$(self.pager).find('.page-movable').css('display', (nb != 1 && nb != total_page) ? 'inline' : 'none');
		
		$(self.pager).find('.page-dots:first').css('display', (nb > 2) ? 'inline' : 'none');
		$(self.pager).find('.page-dots:last').css('display', (nb < total_page - 1) ? 'inline' : 'none');

		$(self.pager).attr('data-current-page', nb);
		
		return this;
	};

	$.fn.paginationNextPage = function(){
		var pager = paginationElements[parseInt($(this).attr('data-pagination-index'))].pager;
		var current_page = parseInt($(pager).attr('data-current-page'));
		var total_page = parseInt($(pager).attr('data-total-page'));

		if (current_page == total_page) return;

		$(this).paginationChangePage(current_page + 1);

		return this;
	};

	$.fn.paginationPreviousPage = function(){
		var pager = paginationElements[parseInt($(this).attr('data-pagination-index'))].pager;
		var current_page = parseInt($(pager).attr('data-current-page'));

		if (current_page == 1) return;

		$(this).paginationChangePage(current_page - 1);

		return this;
	};
}(jQuery));
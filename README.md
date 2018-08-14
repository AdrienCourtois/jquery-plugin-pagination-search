# jquery-plugin-pagination-search
jQuery plugin to create a system of pagination easily. It also provides the tools to make a search easily through the data.

![Example of Pagination](https://raw.githubusercontent.com/AdrienCourtois/jquery-plugin-pagination-search/master/images/example1.png)

![Example of Search](https://raw.githubusercontent.com/AdrienCourtois/jquery-plugin-pagination-search/master/images/example2.png)

## Usage
```JavaScript
$('table').pagination({
  nbPerPage: 20,                       // the number of element to be shown per page. The default value is 20. 5 in the example below.
  container: $('table').parent(),      // the HTML element to which will be appended the pagination HTML content.
  elements: $('table tr:not(:first)'), // the HTML elements (selected by jQuery) corresponding to the items of your list
  display: 'block'                     // the display CSS proprety taken by the all the items of "elements"
});
```

```JavaScript
$(document).ready(function(){
  $('table').search({
    format: (elt) => elt.html()        // The function called receiving the HTML item as an argument and returning the text to be compared to the query.
  });
});

$('input').keyup(function(){
  $('table').trigger('search', [$(this).val().toLowerCase()]);
});
```

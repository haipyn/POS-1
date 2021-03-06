/**
 * Created by Maype-IsaelBlais on 2016-01-25.
 */
/**
 * Created by isaelblais on 1/9/2016.
 */

function getSuccessMessage($message)
{
    return '<div class=\"no-marg alert bg-success\" role=\"alert\">' +
        '<svg class=\"glyph stroked checkmark\">' +
        '<use xlink:href=\"#stroked-checkmark\"></use>' +
        '</svg>' +
        $message +
        '<a href=\"#\" data-dismiss=\"alert\" aria-label=\"close\" class=\"pull-right close\">' +
        '<span class=\"glyphicon glyphicon-remove\"></span>' +
        '</a>' +
        '</div>';
}

function getErrorMessage($message)
{
    return '<div class=\"no-marg alert bg-danger\" role=\"alert\">' +
        '<svg class=\"glyph stroked cancel\">' +
        '<use xlink:href=\"#stroked-cancel\"></use>' +
        '</svg>' +
        $message +
        '<a href=\"#\" data-dismiss=\"alert\" aria-label=\"close\" class=\"pull-right close\">' +
        '<span class=\"glyphicon glyphicon-remove\"></span>' +
        '</a>' +
        '</div>';
}

function formatDate(date) {
    var month = (date.getMonth() + 1)
    var formMonth = month < 10 ? ("0" + month) : month;
    var day = date.getDate();
    var formDay = day < 10 ? ("0" + day) : day;
    return date.getFullYear() + "-" + formMonth + "-" + formDay;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function getLastSunday(d) {
    var t = new Date(d);
    t.setDate(t.getDate() - t.getDay());
    return t;
}

function genHtmlChartTempl(array) {
    var htmlList = '<ul>';
    for (var i = 0; i< array.length; i++) {
        htmlList += '<li>'
        +'<span style=\"background-color:' + array[i].color + '\"></span>'
        + array[i].name
        +'</li>';
    }
    htmlList += '</ul>';
    return htmlList;
}
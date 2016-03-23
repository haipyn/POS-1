/**
 * Created by isaelblais on 3/21/2016.
 */
// var for edit Event
var globStoredEvent = null;

function postAddDisponibilities($storedCalendar) {
    var allEvents = $storedCalendar.fullCalendar('clientEvents');

    var arr = [];

    for (var i = 0; i < allEvents.length; i++){
        var dDate  = new Date(allEvents[i].start.toString());
        var myArray = {StartTime: allEvents[i].start.toString(), EndTime: allEvents[i].end.toString(), dayIndex: dDate.getDay()};
        arr.push(myArray)
    }


    var $dispoName = $('#name').val();
    var $dispoEmployee = $('#employeeSelect').val();

    //$('#frmDispoCreate').submit();
    var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');

    $.ajax({
        url: '/disponibility/create',
        type: 'POST',
        async: true,
        data: {
            _token: CSRF_TOKEN,
            name: $dispoName,
            employeeSelect: $dispoEmployee,
            events: JSON.stringify(arr)

        },
        dataType: 'JSON',
        success: function (data) {
            console.log(data);
        }
    });

}
function postEditDisponibilities($storedCalendar) {

    var allEvents = $storedCalendar.fullCalendar('clientEvents');

    var arr = [];

    for (var i = 0; i < allEvents.length; i++){
        var dDate  = new Date(allEvents[i].start.toString());
        var myArray = {StartTime: allEvents[i].start.toString(), EndTime: allEvents[i].end.toString(), dayIndex: dDate.getDay()};
        arr.push(myArray)
    }

    var $dispoId = $('#dispoId').val();
    var $dispoName = $('#name').val();
    var $dispoEmployee = $('#employeeSelect').val();

    //$('#frmDispoCreate').submit();
    var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');

    $.ajax({
        url: '/disponibility/edit',
        type: 'POST',
        async: true,
        data: {
            _token: CSRF_TOKEN,
            name: $dispoName,
            dispoId: $dispoId,
            employeeSelect: $dispoEmployee,
            events: JSON.stringify(arr)

        },
        dataType: 'JSON',
        success: function (data) {
            console.log(data);
        }
    });

}

function editEvent($storedCalendar){


    $shour = $('#editModal #sHour').val();
    $smin = $('#editModal #sMin').val();

    $ehour = $('#editModal #eHour').val();
    $emin = $('#editModal #eMin').val();


    $dDayNumber = $( "#editModal #dayNumber option:selected" ).val();

    var date = new Date();
    var day = date.getDate();
    var dayNum = date.getDay();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    var dayToSubstract = day - (dayNum - $dDayNumber);
    monthIndex = monthIndex + 1;

    var ymd = year +  "-" + monthIndex + "-" + dayToSubstract;
    var sHM = $shour + ":" + $smin;
    var eHM = $ehour + ":" + $emin;

    globStoredEvent.start = new Date(ymd + ' ' + sHM + ':00');
    globStoredEvent.end = new Date(ymd + ' ' + eHM + ':00');

    $storedCalendar.fullCalendar('updateEvent', globStoredEvent)
}
function addEvent($storedCalendar){

    $shour = $('#addModal #sHour').val();
    $smin = $('#addModal #sMin').val();

    $ehour = $('#addModal #eHour').val();
    $emin = $('#addModal #eMin').val();

    $dDayNumber = $( "#addModal #dayNumber option:selected" ).val();

    var date = new Date();
    var day = date.getDate();
    var dayNum = date.getDay();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    var dayToSubstract = day - (dayNum - $dDayNumber);
    monthIndex = monthIndex + 1;

    var ymd = year +  "-" + monthIndex + "-" + dayToSubstract;
    var sHM = $shour + ":" + $smin;
    var eHM = $ehour + ":" + $emin;

    console.log(ymd);
    var newEvent = {
        title: "dispo",
        isAllDay: false,
        start: new Date(ymd + ' ' + sHM + ':00'),
        end: new Date(ymd + ' ' + eHM + ':00'),
        description: '',
        resourceId: 4
    };


    $storedCalendar.fullCalendar('addEventSource', [newEvent]);
}

function dayClick(xDate, xEvent)
{
    var datet = new Date(xDate);
    // Clean form control
    $('#addModal #sHour').val("");
    $('#addModal #sMin').val("");

    $('#addModal #eHour').val("");
    $('#addModal #eMin').val("");
    console.log(datet.getDay());
    // Week beginning sunday: 0
    if(datet.getDay() == 6)
    {
        $('#addModal #dayNumber').val(0);
    } else {
        // Week beginning sunday: 0
        $gDay = datet.getDay();
        $('#addModal #dayNumber').val($gDay);
    }

    $("#addModal").modal('show');
}

function dispoClick(xDate, xEvent)
{

    var sDate = new Date(xEvent.start.toString());
    var eDate = new Date(xEvent.end.toString());

    console.log(xEvent.start);
    $('#editModal #sHour').val(sDate.getHours());
    $('#editModal #sMin').val(sDate.getMinutes());

    $('#editModal #eHour').val(eDate.getHours());
    $('#editModal #eMin').val(eDate.getMinutes());

    // Week beginning sunday: 0
    $('#editModal #dayNumber').val(sDate.getDay());
    // Set global var so we can get it when we edit.
    globStoredEvent = xEvent;
    $("#editModal").modal('show');
}
/**
 * Created by Maype-IsaelBlais on 2016-01-25.
 */

function punchEmployee($lethis) {

    var $selectedEmployeeText = $('#EmployeeNumber').val();

    var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');

    $.ajax({
        url: '/Employee/Punch',
        type: 'POST',
        data: {
            _token: CSRF_TOKEN,
            EmployeeNumber: $selectedEmployeeText
        },
        dataType: 'JSON',
        success: function (data) {
            ///console.log(data);
            if (data["status"] == "Error") {
                $('#displayMessage').html(getErrorMessage(data["message"]));
            }
            else {
                $('#displayMessage').html(getSuccessMessage(data["message"]));
            }
        }
    });
}
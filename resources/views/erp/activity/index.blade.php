@extends('master')


@section('csrfToken')
    <meta name="csrf-token" content="{{ csrf_token() }}" />
@stop
{{--
@section('title', $title)--}}

@section('content')
    <div class="col-md-6">
        <h1 class="page-header">Activity Log</h1>
    </div>
    <div class="col-md-6">
        <div class="vcenter">
            <a href="#" id="displayLive" ><button type="button" class="btn btn-primary">Afficher en Live</button></a>
            <a hidden href="#" id="live" ><button type="button" class="btn btn-warning">En Live</button></a>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-12">
            <div class="panel panel-default">
                <div class="panel-body">
                    <div style="overflow-y: scroll;height: 30px; width: 100%; padding: 5px; border-radius: 4px; background-color: #333; color: #fff" id="filtre"> Filtres: </div>

                </div>

            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-12">
            <div class="panel panel-default">
                <div class="panel-body">
                       <div style="overflow-y: scroll;height: 600px; width: 100%; padding: 5px; border-radius: 4px; background-color: #333" id="terminal"></div>

                </div>

            </div>
        </div>
    </div>
@stop

@section("myjsfile")

    <script type="application/javascript">

        var isLive = false;
        var noResultIteration = 0;
        var lastId;

        $('#displayLive').click(function() {
            noResultIteration = 0;
            isLive = true;
            setTimeout(getActivityLogOverId(lastId), 2000);
            $( "#live" ).show();
            $( "#displayLive" ).hide();
        });

        $('#live').click(function() {
            noResultIteration = 0;
            isLive = false;
            $( "#displayLive" ).show();
            $( "#live" ).hide();
        });


        function getLogString(log) {

            var finalString = "";
            finalString += '<span style="color: #30a5ff">[' + log.updated_at + ']</span> ';

            if(log.user[0].name == 'user_employee'){
                finalString += '<span style="color: #fff">'
                finalString += log.employee[0].firstName + ' ' +  log.employee[0].lastName
            }
            else{
                finalString += '<span style="color: #fff; text-shadow: 0 0 5px rgba(255,255,255,.2);">'
                finalString += log.user[0].name + '(Admin)'
            }
            finalString += '</span>'
            finalString += ' - '

            try {
                var logObject = JSON.parse(log.text);
                if(logObject.type == "created"){
                    finalString += '<span style="color: #30a5ff">Created: '
                    finalString += logObject.msg;

                }
                else if(logObject.type == "updated"){
                    finalString += '<span style="color: green">Updated: '
                    finalString += logObject.msg;

                }
                else if(logObject.type == "deleted"){
                    finalString += '<span style="color: red">Deleted: '
                    finalString += logObject.msg;

                }
                else {
                    finalString += '<span style="color: #8ad919">'
                    finalString += log.text;
                }
            }catch (e) {
                //console.error("Parsing error:", e);

                finalString += '<span style="color: #fff">'
                finalString += log.text;
            }

            finalString += '</span>'

            return finalString

        }

        function getActivityLog() {
            $.ajax({
                url:'{{ @URL::to('/activity-log/list') }}',
                complete: function (response) {
                    if(typeof response.responseJSON != 'undefined'){
                        var i;
                        for(i = 0; i< response.responseJSON.length; i++){
                            $('#terminal').append(getLogString(response.responseJSON[i])+ '<br>');
                        }
                        updateScroll();
                        if(isLive)
                        setTimeout(getActivityLogOverId(response.responseJSON[i-1].id), 2000);
                        else
                        lastId = response.responseJSON[i-1].id;
                    }
                },
                error: function () {
                    $('#terminal').append('Bummer: there was an error!');
                    setTimeout(getActivityLog(), 3000);
                },
            });
            return false;
        }
        getActivityLog();


        function getActivityLogOverId($id) {
            if(noResultIteration > 60){
                isLive = false
                $( "#displayLive" ).show();
                $( "#live" ).hide();
                $('#terminal').append('<span style="color:red;">The live action log has been stopped after 60 empty request.' + '</span><br>');
                updateScroll();
            }

            if(isLive)
            $.ajax({
                url:'{{ @URL::to('/activity-log/over') }}/'+ $id,
                complete: function (response) {
                    if(typeof response.responseJSON != 'undefined'){
                        var i
                        for(i= 0; i< response.responseJSON.length; i++){
                            $('#terminal').append(getLogString(response.responseJSON[i])+ '<br>');
                        }
                        if(i>0)
                        {
                            updateScroll();
                            setTimeout(getActivityLogOverId(response.responseJSON[i-1].id), 2000);
                            lastId = response.responseJSON[i-1].id;
                            noResultIteration = 0
                        }
                        else{
                            setTimeout(getActivityLogOverId($id), 2000);
                            noResultIteration++;
                        }

                    }
                },
                error: function () {
                    $('#terminal').append('Bummer: there was an error!');
                },
            });
            return false;
        }

        function updateScroll(){
            var element = document.getElementById("terminal");
            element.scrollTop = element.scrollHeight;
        }
    </script>

@stop
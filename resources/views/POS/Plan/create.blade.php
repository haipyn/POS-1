@extends('workerLayout')

@section("csrfToken")
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <script src="{{ @URL::to('js/utils.js') }}"></script>
    <script src="{{ @URL::to('js/jquery/jquery-ui.js') }}"></script>
    <script src="{{ @URL::to('js/jquery/jquery.ui.rotatable.js') }}"></script>
    <link rel="stylesheet" href="{{ @URL::to('css/jquery/jquery.ui.rotatable.css') }}">
    <link rel="stylesheet" href="{{ @URL::to('css/jquery/jquery-ui.css') }}">
    <script src="{{ @URL::to('js/easyResponsiveTabs.js') }}"></script>
    <script src="{{ @URL::to('js/planTabs.js') }}"></script>
    <link rel="stylesheet" type="text/css" href="{{ @URL::to('css/easy-responsive-tabs.css') }}" />
@stop

@section('content')
    <div id="displayErrors" style="display:none;" class="alert alert-danger">
        <strong>Whoops!</strong> There were some problems with your input.<br><br>
        <ul id="errors"></ul>
    </div>
    <h3>Plan name: </h3>
    <span id="planName">{{ $ViewBag['planName'] }}</span>
    <h5>Floor Number:</h5>
    <span id="floorNumber">{{ $ViewBag['nbFloor'] }}</span>
    <a class="btn btn-success pull-right" id="btnFinish" href="#"> Create </a>
    <br/>
    <div id="rowCmd"><a id="btnNewTable" href="#">New Table</a> | <a id="btnNewPlace" href="#">New Place</a> | <a id="btnNewSeparation" href="#">New Separation</a></div>
    <!--Horizontal Tab-->
    <div id="parentHorizontalTab">
        <ul class="resp-tabs-list hor_1">

        </ul>
        <div id="tabControl" class="resp-tabs-container hor_1">

        </div>
    </div>
    <div id="nested-tabInfo">
        Selected tab:       <span class="tabName"></span>
        Selected tab ID:    <span class="tabItemID"></span>
    </div>

    <div id="editModal" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <!-- dialog body -->
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <div class="col-md-4">
                        <div class="form-group">
                            {!! Form::label('tblNum', "Table Number" ) !!}
                            {!! Form::text('tblNum', null, array('class' => 'form-control', 'id' => 'tblNum')) !!}
                        </div>
                    </div>
                </div>

                <!-- dialog buttons -->
                <div class="modal-footer">
                    <button id="btnDelTable" type="button" class="btn btn-danger">Delete</button>
                    <button id="btnEditTable" type="button" class="btn btn-primary">Edit</button>
                </div>
                <div class="modal-footer"></div>
            </div>
        </div>
    </div>
@stop

@section('myjsfile')
    <script>
        var globEditTable = null;
        var rotateParams = {
            start: function(event, ui) {
                console.log("Rotating started");
            },
            rotate: function(event, ui) {
                console.log("Rotating");
            },
            stop: function(event, ui) {
                console.log("Rotating stopped");
            }
        };

        var dragParams = {
            containment: "parent",
            drag: function(){
                // Find the parent
                var tablesContainer = $(this).parent();
                var tablesContainerPos = tablesContainer.offset();

                var offset = $(this).position();
                var xPos = offset.left;
                var yPos = offset.top;
                $(this).find('#posX').text('x: ' + xPos.toFixed(0));
                $(this).find('#posY').text('y: ' + yPos.toFixed(0));
            }
        };
        $("#btnNewSeparation").click(function() {
            $tableGUID = guid();
            var $info = $('#nested-tabInfo');
            var $tabItemID = $('.tabItemID', $info);
            var $tabControl = $("#tabControl");

            $("[aria-labelledby='" + $tabItemID.text() + "'] .tables").append('<li class="draggable sep" id="' + $tableGUID + '"><span id="posX"></span><span id="posY"></span></li>');

            $('#' + $tableGUID).resizable().rotatable(rotateParams);
            $('#' + $tableGUID).draggable(dragParams);
        });
        $("#btnNewPlace").click(function() {
            $tableGUID = guid();
            var $info = $('#nested-tabInfo');
            var $tabItemID = $('.tabItemID', $info);
            var $tabControl = $("#tabControl");

            $("[aria-labelledby='" + $tabItemID.text() + "'] .tables").append('<li class="draggable plc" id="' + $tableGUID + '">' +
                    '<span id="tableNumber">0</span>' +
                    '<span id="posX"></span>' +
                    '<span id="posY"></span>' +
                    '</li>');

            $( '#' + $tableGUID + ' #tableNumber' ).bind( "click", function() {
                globEditTable = this;
                $('#editModal #tblNum').val($(this).text());
                $("#editModal").modal('show');
            });
            $('#' + $tableGUID).rotatable(rotateParams);
            $('#' + $tableGUID).draggable(dragParams);
        });
        $("#btnNewTable").click(function() {
            $tableGUID = guid();
            var $info = $('#nested-tabInfo');
            var $tabItemID = $('.tabItemID', $info);
            var $tabControl = $("#tabControl");


            /*style="position:absolute; top: ' + 0 +'px; left: ' + 120 + 'px;"*/
            $("[aria-labelledby='" + $tabItemID.text() + "'] .tables").append('<li class="draggable tbl" ' + 'id="' + $tableGUID + '">' +
                    '<div id="tableNumber">0</div>' +
                    '<span id="posX"></span>' +
                    '<span id="posY"></span>' +
                    '</li>');
            //$(".tablesContainer .tables").append('<li class="draggable tbl" id="' + $tableGUID + '"><span id="posX"></span><span id="posY"></span></li>');
            $( '#' + $tableGUID + ' #tableNumber' ).bind( "click", function() {
                globEditTable = this;
                $('#editModal #tblNum').val($(this).text());
                $("#editModal").modal('show');
            });
            $('#' + $tableGUID).rotatable(rotateParams);
            $('#' + $tableGUID).draggable(dragParams);
        });
        $("#btnFinish").click(function() {
            var tblContainers = $( ".tablesContainer .tables" );
            var listItems = $( "#tabControl" ).find( tblContainers );
            $arrayFloorTable = [];
            for( $i = 0; $i < listItems.length; $i++ ){
                $liSubItems = $(listItems[$i]).find("li");
                for( $j = 0; $j < $liSubItems.length; $j++ ){
                    //$arrayFloorTable.push()
                    $parsedliSubItem = $($liSubItems[$j]);
                    var offset = $parsedliSubItem.position();
                    $xPos = offset.left.toFixed(0);
                    $yPos = offset.top.toFixed(0);
                    console.log($xPos);

                    var txtRaw = $parsedliSubItem[0].style.transform;
                    var radValReg = /\((.*)\)/;
                    var radVal = 0;
                    if(txtRaw != null && txtRaw.trim() != "") {
                        if (txtRaw.match(radValReg)[1] != null) {
                            radVal = txtRaw.match(radValReg)[1];
                        }
                    } else {
                        radVal = 0;
                    }
                    $tabNum = parseInt($parsedliSubItem.find("#tableNumber").text());
                    $typeChr = "";
                    if($parsedliSubItem.hasClass("tbl")){
                        $typeChr = "tbl"
                    } else if($parsedliSubItem.hasClass("plc")) {
                        $typeChr = "plc"
                    } else {
                        $typeChr = "sep"
                    }
                    var objTable = {
                        tblType: $typeChr,
                        tblNum: $tabNum,
                        noFloor: $i,
                        xPos: $xPos,
                        yPos: $yPos,
                        angle: radVal
                    };
                    $arrayFloorTable.push(objTable);
                }

            }

            var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');

            var nbFloor = $("#floorNumber").text();
            var planName = $("#planName").text();
            $.ajax({
                url: '/plan/create',
                type: 'POST',
                async: true,
                data: {
                    _token: CSRF_TOKEN,
                    planName: planName,
                    nbFloor: nbFloor,
                    tables: JSON.stringify($arrayFloorTable)

                },
                dataType: 'JSON',
                error: function (xhr, status, error) {
                    var erro = jQuery.parseJSON(xhr.responseText);
                    $("#errors").empty();
                    //$("##errors").append('<ul id="errorsul">');
                    [].forEach.call( Object.keys( erro ), function( key ){
                        [].forEach.call( Object.keys( erro[key] ), function( keyy ) {
                            $("#errors").append('<li class="errors">' + erro[key][keyy][0] + '</li>');
                        });
                        //console.log( key , erro[key] );
                    });
                    //$("#displayErrors").append('</ul>');
                    $("#displayErrors").show();
                },
                success: function(xhr) {
                    [].forEach.call( Object.keys( xhr ), function( key ) {
                        alert(xhr[key]);
                        //window.location.replace("/plan");
                    });
                }
            });

            console.log(JSON.stringify($arrayFloorTable))
        });
        $("#btnEditTable").click(function() {
            $tblNumEdit = $('#editModal #tblNum').val();
            $oTableNum = $(globEditTable).text($tblNumEdit);
        });
        $("#btnDelTable").click(function() {

        });
        //$(".tablesContainer ul li").rotatable(rotateParams);
        //$(".tablesContainer ul li").draggable(dragParams);
    </script>
    <script type="text/javascript">
        $(document).ready(function() {
            var TabNumber = 0;
            var intNbFloor = parseInt($("#floorNumber").text());
            if(intNbFloor >= 1){
                for(var i = 1; i <= intNbFloor; i++){
                    $("#parentHorizontalTab .resp-tabs-list").append("<li class=\"resp-tab-item hor_1\" aria-controls=\"hor_1_tab_item-"+ TabNumber +"\" role=\"tab\" style=\"border-color: rgb(193, 193, 193); background-color: rgb(255, 255, 255);\">Floor No. " + i + "</li>");
                    $("#tabControl").append("<div class=\"tablesContainer\"><ul class=\"tables\"></ul></div>");
                }
                $('#parentHorizontalTab').easyResponsiveTabs({
                    type: 'default', //Types: default, vertical, accordion
                    width: 'auto', //auto or any width like 600px
                    fit: true, // 100% fit in a container
                    tabidentify: 'hor_1', // The tab groups identifier
                    activate: function(event) { // Callback function if tab is switched

                        var $tab = $(this);
                        var $info = $('#nested-tabInfo');
                        var $name = $('.tabName', $info);

                        var $tabItemID = $('.tabItemID', $info);
                        $name.text($tab.text());

                        $tabItemID.text($tab.attr("aria-controls").toString())
                        $info.show();
                    }
                });
            } else {
                alert("The floor number must be greater than 0");
            }

        });
    </script>
@stop
@extends('master')
@section('csrfToken')
    <meta name="csrf-token" content="{{ csrf_token() }}" />
@stop
@section('content')
    <div class="row">
        <div class="col-lg-12">
            <h1 class="page-header">Delete Schedule</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-12">
            <div class="panel panel-default">
                <div class="panel-body">

                </div>
            </div>
        </div>
    </div>

@stop

@section("myjsfile")
    <script>
    </script>
@stop
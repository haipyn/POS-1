@extends('master')
@section('csrfToken')
    <script src="{{ @URL::to('js/moment/moment.js') }}"></script>
    <script src="{{ @URL::to('js/moment/moment-timezone.js') }}"></script>

    <script src="{{ @URL::to('Framework/Bootstrap/js/bootstrap-datepicker.min.js') }}"></script>
    <script src="{{ @URL::to('Framework/Bootstrap/js/bootstrap-datetimepicker.min.js') }}"></script>

    <meta name="csrf-token" content="{{ csrf_token() }}" />
@stop
@section('content')
    <div class="row">
        <div class="col-lg-12">
            <h1 class="page-header">Create</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-12">
            <div class="panel panel-default">
                <div class="panel-body">
                    <div class="col-md-6">
                        {!! Form::open(array('url' => 'employee/create', 'role' => 'form')) !!}
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                <strong>Whoops!</strong> There were some problems with your input.<br><br>
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        <fieldset>
                            <legend>User Informations</legend>
                            <div class="mfs">
                                <div class="form-group">
                                    {!! Form::label('email', "Email" ) !!}
                                    @if($errors->has('email'))
                                        <div class="form-group has-error">
                                            {!! Form::text('email', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('email', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="col-lg-6 col-no-pad">
                                    <div class="form-group">
                                        {!! Form::label('pswd', "Password" ) !!}
                                        @if($errors->has('password'))
                                            <div class="form-group has-error">
                                                {!! Form::password('password', array('class' => 'form-control')) !!}
                                            </div>
                                        @else
                                            {!! Form::password('password', array('class' => 'form-control')) !!}
                                        @endif
                                    </div>
                                </div>
                                <div class="col-lg-6 col-no-pad col-no-pad-right">
                                    <div class="form-group">
                                        {!! Form::label('pswd_confirmation', "Confirm Password" ) !!}
                                        @if($errors->has('password_confirmation'))
                                            <div class="form-group has-error">
                                                {!! Form::password('password_confirmation', array('class' => 'form-control')) !!}
                                            </div>
                                        @else
                                            {!! Form::password('password_confirmation', array('class' => 'form-control')) !!}
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend>Contact Informations</legend>
                            <div class="mfs">
                                <div class="form-group">
                                    {!! Form::label('firstName', "First Name" ) !!}
                                    @if($errors->has('firstName'))
                                        <div class="form-group has-error">
                                            {!! Form::text('firstName', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('firstName', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('lastName', "Last Name" ) !!}
                                    @if($errors->has('lastName'))
                                        <div class="form-group has-error">
                                            {!! Form::text('lastName', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('lastName', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('nas', "NAS" ) !!}
                                    @if($errors->has('nas'))
                                        <div class="form-group has-error">
                                            {!! Form::text('nas', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('nas', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('streetAddress', "Street Address" ) !!}
                                    @if($errors->has('streetAddress'))
                                        <div class="form-group has-error">
                                            {!! Form::text('streetAddress', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('streetAddress', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('phone', "Phone Number" ) !!}
                                    @if($errors->has('phone'))
                                        <div class="form-group has-error">
                                            {!! Form::text('phone', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('phone', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('city', "City" ) !!}
                                    @if($errors->has('city'))
                                        <div class="form-group has-error">
                                            {!! Form::text('city', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('city', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('state', "State" ) !!}
                                    @if($errors->has('state'))
                                        <div class="form-group has-error">
                                            {!! Form::text('state', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('state', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('pc', "Postal Code" ) !!}
                                    @if($errors->has('pc'))
                                        <div class="form-group has-error">
                                            {!! Form::text('pc', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('pc', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend>Employee Informations</legend>
                            <div class="mfs">
                                <div class="form-group">
                                    <p class="text-warning">* Press ctrl and/or shift while selecting for multiple select.</p>
                                    {!! Form::label('title', "Employee Title(s)" ) !!}
                                    @if($errors->has('employeeTitles'))
                                        <div class="form-group has-error">
                                            <select multiple name="employeeTitles[]" class="form-control">
                                                @foreach ($ViewBag['WorkTitles'] as $workTitle)
                                                    <option value="{{ $workTitle->id }}">{{ $workTitle->name }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                    @else
                                        <select multiple name="employeeTitles[]" class="form-control">
                                            @foreach ($ViewBag['WorkTitles'] as $workTitle)
                                                <option value="{{ $workTitle->id }}">{{ $workTitle->name }}</option>
                                            @endforeach
                                        </select>
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('bonusSalary', "Bonus Salary" ) !!}
                                    @if($errors->has('bonusSalary'))
                                        <div class="form-group has-error">
                                            {!! Form::text('bonusSalary', null, array('class' => 'form-control')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('bonusSalary', null, array('class' => 'form-control')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('birthDate', "Birth Date" ) !!}
                                    @if($errors->has('birthDate'))
                                        <div class="form-group has-error">
                                            {!! Form::text('birthDate', null, array('class' => 'datepickerInput form-control', 'data-date-format' => 'yyyy-mm-dd', 'id' => 'birthDate')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('birthDate', null, array('class' => 'datepickerInput form-control', 'data-date-format' => 'yyyy-mm-dd', 'id' => 'birthDate')) !!}
                                    @endif
                                </div>

                                <div class="form-group">
                                    {!! Form::label('hireDate', "Hire Date" ) !!}
                                    @if($errors->has('hireDate'))
                                        <div class="form-group has-error">
                                            {!! Form::text('hireDate', null, array('class' => 'datepickerInput form-control', 'data-date-format' => 'yyyy-mm-dd', 'id' => 'hireDate')) !!}
                                        </div>
                                    @else
                                        {!! Form::text('hireDate', null, array('class' => 'datepickerInput form-control', 'data-date-format' => 'yyyy-mm-dd', 'id' => 'hireDate')) !!}
                                    @endif
                                </div>
                            </div>
                        </fieldset>
                        {!! Form::submit('Create', array('id' => 'btn-create-employee', 'class' => 'btn btn-primary')) !!}
                        {!! Form::close() !!}
                    </div>
                </div>
            </div>
        </div>
    </div>

@stop

@section("myjsfile")
    <script src="{{ @URL::to('js/utils.js') }}"></script>

    <script src="{{ @URL::to('js/moment/moment-timezone-with-data-packed.js') }}"></script>
    <script type="text/javascript">

        $('#birthDate').datepicker();
        $('#hireDate').datepicker();

    </script>
@stop
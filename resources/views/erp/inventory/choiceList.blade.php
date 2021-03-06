
<?php $tableIteration = 1; ?>

@foreach($tableChoiceLists as $tableChoiceList)

    <div class="labelBtn">
        <label>Item</label>
        <a class="btn btn-success pull-right" id="btnAddItemType" href="{{@URL::to('/items/create')}}"> Create Item</a>
    </div>
    <input type="hidden" id="selectedItem" name="{{ $tableChoiceList['dbColumn'] }}" <?php  $dbColumn = $tableChoiceList['dbColumn'] ?>value="@if(isset($tableRow)){{ $tableRow->$dbColumn }} @endif">
    <div id="tableChoiceList{{$tableIteration}}" class="list-group tableChoiceList">
        @foreach($tableChoiceList["table"] as $oneChoice)
            <span id="{{$oneChoice->id}}" data-field-names="{{$oneChoice->field_names}}" data-sizes="{{$oneChoice->itemtype->size_names}}" class="list-group-item tableChoice choiceList{{$tableIteration}}  @if(isset($tableRow) && $oneChoice->id == $tableRow->$dbColumn) active @endif ">
                <?php  $titleColumn = $tableChoiceList['titleColumn']; ?>
                @if($tableChoiceList["contentColumn"] != '' )
                    <a id="link-{{$oneChoice->id}}" class="view" href="{{ $tableChoiceList["postUrl"]}}/edit/{{$oneChoice->slug}}"><span class="glyphicon glyphicon-pencil"></span></a>
                    <h4 class="list-group-item-heading">{{ $oneChoice->$titleColumn }}</h4>
                    <p class="list-group-item-text">{Type { $oneChoice->$tableChoiceList["contentColumn"] }}</p>
                @else
                    <a id="link-{{$oneChoice->id}}" class="view" href="{{ $tableChoiceList["postUrl"]}}/edit/{{$oneChoice->slug}}"><span class="glyphicon glyphicon-pencil"></span></a>
                    <h2 class="list-group-item-heading">{{  $oneChoice->$titleColumn }} </h2>
                @endif

            </span>
        @endforeach
    </div>

    <?php $tableIteration++ ?>
@endforeach
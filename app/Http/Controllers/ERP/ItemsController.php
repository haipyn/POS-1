<?php

namespace App\Http\Controllers\ERP;

use App\Http\Controllers\Controller;
use App\Http\Requests;
use App\Models\Beer;
use App\Models\ERP\Item;
use App\Models\ERP\ItemType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Input;
use Intervention\Image\Facades\Image;
use Redirect;
use Session;
use URL;
use Validator;

class ItemsController extends Controller
{

    public  function index()
    {
        /*$items = Item::get();*/
        /*$items = Item::with('itemtype')->get();

        $title = "Items";
        $columns = array('id', 'name');
        $columnsWith = array('type');
        $withName = 'itemtype';
        return view('erp.items.list',compact('items', 'columns', 'columnsWith', 'withName', 'title'));*/

        $title = 'Items';

        /*Main table row to retrieve from DB*/
        $tableRows = Item::all();
        /*Main table desired column to display*/
        $tableColumns = array('id', 'name');


        /*Child table name*/
        /* $tableChildName = "item";*/
        /*Child table rows*/
        /*$tableChildRows =  $tableRows->load($tableChildName);*/
        /*Child table desired column to display*/
        /*$tableChildColumns = array('name');*/

        /*$tableChild1 = array("name" => $tableChildName,"rows" => $tableChildRows, "columns" => $tableChildColumns);*/

        /*--------*/

        /*Child table name*/
        $tableChildName = "itemtype";
        /*Child table rows*/
        $tableChildRows =  $tableRows->load($tableChildName);
        /*Child table desired column to display*/
        $tableChildColumns = array('type');

        $tableChild1 = array("name" => $tableChildName,"rows" => $tableChildRows, "columns" => $tableChildColumns);

        $tableChildren = array($tableChild1);


        return view('erp.item.index',compact('title','tableRows', 'tableColumns', 'tableChildren', 'tableChildRows', 'tableChildColumns'));
    }

    public function liste()
    {


        $title = 'Items';

        /*Main table row to retrieve from DB*/
        $tableRows = Item::all();
        /*Main table desired column to display*/

        /*Child table name*/
        $tableChildName = "itemtype";
        /*Child table rows*/
        $tableRows->load($tableChildName);

        return $tableRows;
    }

    public function details($slug)
    {
        $items = Item::whereSlug($slug)->first();


        /*Previous and Next */
        $previousTableRow = Item::find(($items->id)-1);
        $nextTableRow = Item::find(($items->id)+1);

        return view('erp.item.details',compact('items', 'previousTableRow', 'nextTableRow'));
    }

    public  function edit($slug)
    {
        $title = 'Items';

        /*Main table row to retrieve from DB*/
        $tableRow = Item::whereSlug($slug)->first();
        /*Main table desired column to display*/
        $tableColumns = array('name', 'description' ,'img_id');


        $tableChoiceListTable = ItemType::all();
        /*select all where type = beer*/

        $tableChoiceListTitle = "Item Type";
        $tableChoiceListDBColumn = "item_type_id";
        $tableChoiceListTitleColumn = "type";
        $tableChoiceListContentColumn = "";
        $tableChoiceListCreateURL = @URL::to('/itemtypes');

        $tableChoiceList1 = array("table" => $tableChoiceListTable,"title" => $tableChoiceListTitle, "dbColumn" => $tableChoiceListDBColumn, "titleColumn" => $tableChoiceListTitleColumn, "contentColumn" => $tableChoiceListContentColumn, "postUrl" => $tableChoiceListCreateURL);

        $tableChoiceLists = array($tableChoiceList1/*, $tableChoiceList2*/);


        /*Previous and Next */
        $previousTableRow = Item::find(($tableRow->id)-1);
        $nextTableRow = Item::find(($tableRow->id)+1);

        return view('erp.item.edit',compact('title','tableRow', 'tableColumns', 'tableChoiceLists', 'tableChildColumns', 'previousTableRow', 'nextTableRow'));
    }



    public function postEdit($slug, Request $request)
    {
        /*Main table row to retrieve from DB*/
        $tableRow = Item::whereSlug($slug)->first();

        /*Child table name*/
        $tableChild = "itemtype";
        /*Child table rows*/
        $tableChildRows = $tableRow->$tableChild;

        if(Input::get('custom_fields_array') != null){

            Input::merge(array('custom_fields_array' =>  json_encode(Input::get('custom_fields_array'))));

        }

        if(Input::get('size_prices_array') != null){

            Input::merge(array('size_prices_array' =>  json_encode(Input::get('size_prices_array'))));

        }


        if( Input::file('image') != null ){
            $image = Input::file('image');
            $filename  = time() . '.' . $image->getClientOriginalExtension();
            /*
                    File::exists(storage_path('img/item/' . $filename)) or File::makeDirectory(storage_path('img/item/' . $filename));*/

            $path = public_path('img/item/' . $filename);
            Image::make($image->getRealPath())/*->resize(400, 550)*/->save($path);
            /*$product->image = 'img/item/'.$filename;
            $product->save();*/


            //Session::flash('success', $slug.' image updated!');


            Input::merge(array('img_id' =>  $filename));

        }



        $tableRow->update(Input::all());
        Session::flash('success', $tableRow->slug.' '. trans('flashmsg.successUpdate'));



        if(is_array($tableChildRows)){
            foreach($tableChildRows as $tableChildRow){
                $tableChildRow->update(Input::all());
            }
        }
        else
        {
            $tableChildRows->update(Input::all());
        }

        // resizing an uploaded file/*

        /*Image::make(Input::file('image'))->resize(300, 200)->save('foo.jpg');*/

/*
        $file = Input::file('image');
        $filename = "test";
        Image::make($file->getRealPath())->resize('200','200')->save($filename);*/




        return Redirect::back();

    }

    public function create()
    {
        /*Page Title*/
        $title = 'Items';

        $tableColumns = array('name', 'description');


        $tableChoiceListTable = ItemType::all();
        /*select all where type = beer*/

        $tableChoiceListTitle = "ItemType";
        $tableChoiceListDBColumn = "item_type_id";
        $tableChoiceListTitleColumn = "type";
        $tableChoiceListContentColumn = "";
        $tableChoiceListCreateURL = @URL::to('/itemtypes');

        $tableChoiceList1 = array("table" => $tableChoiceListTable,"title" => $tableChoiceListTitle, "dbColumn" => $tableChoiceListDBColumn, "titleColumn" => $tableChoiceListTitleColumn, "contentColumn" => $tableChoiceListContentColumn, "postUrl" => $tableChoiceListCreateURL);


        $tableChoiceLists = array($tableChoiceList1);


        return view('erp.item.create',compact('title', 'tableChoiceLists', 'tableColumns'));
    }

    public function postCreate()
    {
        $inputs = Input::all();

        $rules = array(
            'name' => 'required',
            'description' => 'required',
            'itemTypeId' => 'required'
        );


        $message = array(
            'required' => 'The :attribute is required !'
        );

        $validation = \Validator::make($inputs, $rules, $message);
        if($validation -> fails())
        {
            $messages = $validation->errors();
            return \Response::json([
                'errors' => $messages
            ], 422);

        }
        else
        {

            $varItem = Item::create([
                'name' =>  Input::get('name'),
                'description' => Input::get('description'),
                'slug' => Input::get('name') . rand(10, 10000),
                'item_type_id' => Input::get('itemTypeId'),
                'custom_fields_array' => Input::get('fieldValues'),
                'size_prices_array' => Input::get('sizeValues')
            ]);

            return \Response::json([
                'success' => "The Item " . Input::get('name') . " has been successfully created !",
                'object' => $varItem->id
            ], 201);

        }
    }
}
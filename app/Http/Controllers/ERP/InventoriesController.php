<?php

namespace App\Http\Controllers\ERP;

use App\Http\Requests;
use App\Models\ERP\Inventory;
use App\Models\ERP\Item;
use App\Models\ERP\Order;
use Illuminate\Http\Request;
use Input;
use Redirect;
use Session;
use DB;

class InventoriesController extends \App\Http\Controllers\Controller
{

    public function index()
    {
        $title = 'Inventory';

        /*Main table row to retrieve from DB*/
        $tableRows = Inventory::all();
        /*Main table desired column to display*/
        $tableColumns = array('id', 'item_id', 'order_id', 'quantity');


        /*Child table name*/
        $tableChildName = "item";
        /*Child table rows*/
        $tableChildRows =  $tableRows->load($tableChildName);
        /*Child table desired column to display*/
        $tableChildColumns = array('name');

        $tableChild1 = array("name" => $tableChildName,"rows" => $tableChildRows, "columns" => $tableChildColumns);

        /*--------*/

        /*Child table name*/
        $tableChildName = "item";
        /*Child table rows*/
        $tableChildRows =  $tableRows->load($tableChildName);
        /*Child table desired column to display*/
        $tableChildColumns = array('name');

        $tableChild1 = array("name" => $tableChildName,"rows" => $tableChildRows, "columns" => $tableChildColumns);

        $tableChildren = array($tableChild1);


        return view('shared.list',compact('title','tableRows', 'tableColumns', 'tableChildren', 'tableChildRows', 'tableChildColumns'));
    }

    public function edit($slug)
    {
        /*Page Title*/
        $title = 'Inventory';

        /*Main table row to retrieve from DB*/
        $tableRow = Inventory::whereSlug($slug)->first();
        /*Main table desired column to display*/
        $tableColumns = array('item_id', 'order_id', 'quantity');

        /*Child table name
        $tableChild = "";
        /*Child table rows
        $tableChildRows = $tableRow->$tableChild;
        /*Child table desired column to display
        $tableChildColumns = array('img_url');

        /*Previous and Next */
        $previousTableRow = Inventory::findOrNew(($tableRow->id)-1);
        $nextTableRow = Inventory::findOrNew(($tableRow->id)+1);

        return view('shared.edit',compact('title','tableRow', 'tableColumns', 'previousTableRow', 'nextTableRow'));
    }

    public function details($slug)
    {
        /*Page Title*/
        $title = 'Inventory';

        /*Main table row to retrieve from DB*/
        $tableRow = Inventory::whereSlug($slug)->first();
        /*Main table desired column to display*/
        $tableColumns = array('item_id', 'order_id', 'quantity');

        /*Child table name
        $tableChild = "";
        /*Child table rows
        $tableChildRows = $tableRow->$tableChild;
        /*Child table desired column to display
        $tableChildColumns = array('img_url');

        /*Previous and Next */
        $previousTableRow = Inventory::findOrNew(($tableRow->id)-1);
        $nextTableRow = Inventory::findOrNew(($tableRow->id)+1);

        return view('shared.details',compact('title','tableRow', 'tableColumns', 'previousTableRow', 'nextTableRow'));
    }

    public function update($slug, Request $request)
    {
        $item = Inventory::whereId($slug)->first();

        $input = $request->all();

        var_dump($input);

        $item->update($input);

        Session::flash('flash_message', $slug.' successfully updated!');

        return Redirect::back();
    }

    public function create()
    {

        /*Page Title*/
        $title = 'Inventory';

        /*$formSections = array(
            'section1' => array(
                'title' => '',
                'fields' => array(
                    array(
                        'label' => 'Quantity',
                        'input' => 'quantity'
                    ),
                    array(
                        'label' => 'Quantity',
                        'input' => 'quantity'
                    )
                )
            )
        );*/

        $tableColumns = array('quantity');


        $tableChoiceListTable = Item::all();
        /*select all where type = beer*/

        $tableChoiceListTitle = "Item ID";
        $tableChoiceListDBColumn = "item_id";
        $tableChoiceListTitleColumn = "name";
        $tableChoiceListContentColumn = "description";

        $tableChoiceList1 = array("table" => $tableChoiceListTable,"title" => $tableChoiceListTitle, "dbColumn" => $tableChoiceListDBColumn, "titleColumn" => $tableChoiceListTitleColumn, "contentColumn" => $tableChoiceListContentColumn);


        $tableChoiceListTable = Order::all();

        $tableChoiceListTitle = "Order Number";
        $tableChoiceListDBColumn = "order_id";
        $tableChoiceListTitleColumn = "command_number";
        $tableChoiceListContentColumn = "";

        $tableChoiceList2 = array("table" => $tableChoiceListTable,"title" => $tableChoiceListTitle, "dbColumn" => $tableChoiceListDBColumn, "titleColumn" => $tableChoiceListTitleColumn, "contentColumn" => $tableChoiceListContentColumn);



        $tableChoiceLists = array($tableChoiceList1, $tableChoiceList2);



        return view('shared.create',compact('title', 'tableChoiceLists', 'tableColumns'));
    }

    public function postCreate()
    {
        $inputs = \Input::all();

        $rules = array(
            'quantity' => 'required',
            'item_id' => 'required',
            'order_id' => 'required'
        );

        $message = array(
            'required' => 'The :attribute is required !'
        );

        $validation = \Validator::make($inputs, $rules, $message);
        if($validation -> fails())
        {
            return Redirect::action('InventoriesController@create')->withErrors($validation)
                ->withInput();
        }
        else
        {
            $inventories = Inventory::findOrFail();

            $itemSlug = Item::whereId(Input::get('item_id'))->first()->slug;

            Inventory::create([
                'quantity' =>  Input::get('quantity'),
                'item_id' => Input::get('item_id'),
                'order_id' => Input::get('order_id'),
                'slug' => $itemSlug
            ]);

            return $itemSlug;
        }
    }
}
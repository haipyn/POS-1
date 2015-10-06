<?php

namespace App\Models\ERP;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'items';

    public function itemtype()
    {
        return $this->hasOne('App\Models\ERP\ItemType', 'id', 'item_type_id');
    }

    public function itemfieldlist()
    {
        return $this->hasOne('App\Models\ERP\ItemFieldList', 'id', 'item_field_list_id');
    }
}


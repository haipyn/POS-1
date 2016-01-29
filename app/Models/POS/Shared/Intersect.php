<?php

namespace App\Models\POS\Shared;

use Illuminate\Database\Eloquent\Model;

class Intersect
{
    protected $_dayNumber;
    protected $_hour;

    public function __construct($dayNumber = 0, $hour = 0)
    {
        $this->_dayNumber = $dayNumber;
        $this->_hour = $hour;
    }

    public function GetDayNumber()
    {
        return $this->_dayNumber;
    }

    public function GetHour()
    {
        return $this->_hour;
    }

    public function ToString()
    {
        return "<td>" . $this->_text . "</td>";
    }

}

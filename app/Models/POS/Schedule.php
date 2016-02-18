<?php

namespace App\Models\POS;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $table = 'schedules';
    protected $fillable = ['name', 'startDate', 'endDate'];

    public static function getById($id)
    {
        return \DB::table('schedules')
            ->select(\DB::raw('id,
            name,
            startDate,
            endDate,
            created_at,
            updated_at
            '))
            ->where('id', '=', $id)
            ->first();
    }

    public static function getAll()
    {
        return  \DB::table('schedules')
            ->select(\DB::raw('schedules.id as idSchedule,
            name,
            startDate,
            endDate,
            schedules.created_at,
            count(day_schedules.employee_id) as "nbEmployees",
            "fakestatus" as status
            '))
            ->leftJoin('day_schedules', 'schedules.id', '=', 'day_schedules.schedule_id')
            ->get();
    }

    public static function GetDaySchedules($id, $day_number)
    {
        $matches = ['schedule_id' => $id, 'day_number' => $day_number];
        return \DB::table('day_schedules')
            ->where($matches)
            ->get();
    }

    public static function GetDaySchedulesForEmployee($id, $day_number, $employeeId)
    {
        $matches = ['schedule_id' => $id, 'employee_id' => $employeeId, 'day_number' => $day_number];
        return \DB::table('day_schedules')
            ->where($matches)
            ->get();
    }
}

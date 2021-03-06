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

    // Good Ones
    public static function GetScheduleMoments($scheduleId)
    {
        return \DB::table('day_schedules')
            ->select(\DB::raw('day_schedules.*,
            employees.id as idEmployee,
            employees.firstName,
            employees.lastName'))
            ->where('schedule_id', '=', $scheduleId)
            ->join('employees', 'day_schedules.employee_id', '=', 'employees.id')
            ->get();
    }

    //Good One
    public static function GetScheduleMomentsForEmployee($scheduleId, $employeeId)
    {
        $matches = ['schedule_id' => $scheduleId, 'employees.id' => $employeeId];
        return \DB::table('day_schedules')
            ->select(\DB::raw('day_schedules.*,
            employees.id as idEmployee,
            employees.firstName,
            employees.lastName'))
            ->where($matches)
            ->join('employees', 'day_schedules.employee_id', '=', 'employees.id')
            ->get();
    }

    public static function DeleteDaySchedules($scheduleId)
    {
        return \DB::table('day_schedules')
            ->where('schedule_id', '=', $scheduleId)
            ->delete();
    }

    public static function getAll()
    {
        return  \DB::table('schedules')
            ->select(\DB::raw('schedules.id as idSchedule,
            name,
            startDate,
            endDate,
            schedules.created_at
            '))
            ->get();
    }

    // For Tracking
    public static function getScheduledEmployees($scheduleId)
    {
        return  \DB::table('day_schedules')
            ->select(\DB::raw('day_schedules.id as idSchedule, employees.id as idEmployee, day_schedules.employee_id, employees.firstName, employees.phone, employees.lastName, count(day_schedules.id) as shifts'))
            ->where('day_schedules.schedule_id', '=', $scheduleId)
            ->join('employees', 'day_schedules.employee_id', '=', 'employees.id')
            ->groupBy('day_schedules.employee_id')
            ->get();
    }

    public static function GetScheduleEmployees($scheduleId)
    {

        return \DB::table('schedules')
            ->select(\DB::raw('day_schedules.*,
            schedules.id as idSchedule,
            employees.id as idEmployee,
            employees.phone,
            employees.firstName,
            employees.lastName'))
            ->join('day_schedules', 'schedules.id', '=', 'day_schedules.schedule_id')
            ->join('employees', 'day_schedules.employee_id', '=', 'employees.id')
            ->where('schedules.id', '=', $scheduleId)
            ->orderBy('employees.id', 'asc')
            ->orderBy('day_schedules.startTime', 'asc')
            ->get();
    }

    public static function GetScheduledHoursYear($year){
        return \DB::select('SELECT MONTH(p.startTime) month, TIME(SUM(TIMEDIFF(p.endTime, p.startTime))) total
                            FROM day_schedules p
                            WHERE YEAR(DATE(p.startTime)) = :year
                            GROUP BY MONTH(p.startTime)
                            ORDER BY p.startTime ASC', ['year' => $year]);
    }
}

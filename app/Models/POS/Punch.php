<?php

namespace App\Models\POS;

use Illuminate\Database\Eloquent\Model;

class Punch extends Model
{
    //
    protected $fillable = ['inout', 'isIn', 'employee_id', 'punchTime', 'created_at'];

    public static function GetLatestPunch($idEmployee)
    {
        return \DB::table('punches')
            ->join('employees', 'punches.employee_id', '=', 'employees.id')
            ->select(\DB::raw('punches.inout'))
            ->where('punches.employee_id', '=', $idEmployee)
            ->orderBy('punches.created_at', 'desc')
            ->first();
    }


    public static function GetByEmployeeId($id){
        return \DB::table('punches')
                ->select(\DB::raw('punches.id, punches.inout, DATE_FORMAT(punches.punchTime, \'%h:%i %p\') as time, DATE_FORMAT(punches.punchTime, \'%m-%d-%Y\') as date, punches.punchTime'))
                ->where('punches.employee_id', '=', $id)
                ->orderBy('punches.punchTime', 'desc')
                ->get();
    }

    public static function GetByInterval($startDate, $endDate){
        return \DB::select('SELECT p.id, p.startTime, p.endTime, p.employee_id as idEmployee, e.firstName, e.lastName, w.name, ((w.baseSalary + e.bonusSalary) * TIMEDIFF(p.endTime, p.startTime)) as totalSalary
                            FROM punches p
                            INNER JOIN employees e on p.employee_id = e.id
                            INNER JOIN work_titles w ON p.work_title_id = w.id
                            WHERE p.startTime >= :st
                            AND p.endTime <= :et
                            ORDER BY p.startTime asc', ['st' => $startDate, 'et' => $endDate]);
    }

    public static function GetWorkedHoursYear($year){
        return \DB::select('SELECT MONTH(p.startTime) month, TIME(SUM(TIMEDIFF(p.endTime, p.startTime))) total
                            FROM punches p
                            WHERE YEAR(DATE(p.startTime)) = :year
                            GROUP BY MONTH(p.startTime)
                            ORDER BY p.startTime ASC', ['year' => $year]);
    }
}

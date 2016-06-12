<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\POS\Employee;
use App\Models\POS\WorkTitle;
use App\Models\POS\Punch;
use App\Models\Project;
use App\Models\POS\Title_Employees;
use App\Models\Auth\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Html\HtmlServiceProvider;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WorkTitleController extends Controller
{
    public function index()
    {
        $workTitles = WorkTitle::getAll();
        $employeesList = Employee::GetAll();

        for($i = 0; $i < count($workTitles); $i++){
            $employees = WorkTitle::getEmployeesByTitleId($workTitles[$i]->emplTitleId);
            $workTitles[$i]->{"cntEmployees"} = $employees;
        }

        $view = \View::make('POS.WorkTitle.index')
            ->with('ViewBag', array (
                'workTitles' => $workTitles,
                'employees' => $employeesList
            ));
        return $view;
    }

    public function delEmployee()
    {
        $inputs = \Input::all();

        $rules = array(
            'titleEmployeeId' => 'required'
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

            $empl =  Employee::GetById(\Input::get('emplId'));
            $emplTitle  = WorkTitle::getById(\Input::get('emplTitleId'));

            Title_Employees::where("id", "=", \Input::get('titleEmployeeId'))
                ->delete();

            return \Response::json([
                'success' => "The employee has been successfully removed from the title !"
            ], 201);
        }
    }

    public function addEmployee()
    {
        $inputs = \Input::all();

        $rules = array(
            'emplTitleId' => 'required',
            'emplId' => 'required'
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
            $checkTitleEmployee = Title_Employees::getByEmployeeAndTitleId(\Input::get('emplId'), \Input::get('emplTitleId'));
            if($checkTitleEmployee == null){
                $empl =  Employee::GetById(\Input::get('emplId'));
                $emplTitle  = WorkTitle::getById(\Input::get('emplTitleId'));

                $titleEmployee = Title_Employees::create([
                    'employee_id' => \Input::get('emplId'),
                    'employee_titles_id' => \Input::get('emplTitleId')
                ]);

                $objTitleEmployee = array (
                    "id" => $titleEmployee->id,
                    "fullName" => ($empl->firstName . " " . $empl->lastName),
                    "hireDate" => $empl->hireDate
                );

                $messages = array(
                    'success' => ("The employee " . $empl->firstName . " has been successfully added to " . $emplTitle->name . " title !"),
                    'titleEmployee' => json_encode($objTitleEmployee)
                );

                return \Response::json([
                    'success' => $messages
                ], 201);

                /*return \Response::json([
                    'success' => "The employee " . $empl->firstName . " has been successfully added to " . $emplTitle->name . " title !"
                ], 201);*/
            } else {
                $messages = array(
                    "emplTitleId" => array(0 => "The selected employee is already a part of this title !")
                );

                return \Response::json([
                    'errors' => $messages
                ], 422);
            }

        }
    }

    public function postCreate()
    {
        $inputs = \Input::all();

        $rules = array(
            'planName' => 'required',
            'nbFloor' => 'required'
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

            $plan = Plan::create([
                'name' => \Input::get('planName'),
                'nbFloor' => \Input::get('nbFloor')
            ]);

            $jsonArray = json_decode(\Input::get('tables'), true);
            for($i = 0; $i < count($jsonArray); $i++)
            {
                Table::create([
                    "type" => $jsonArray[$i]["tblType"],
                    "tblNumber" => $jsonArray[$i]["tblNum"],
                    "noFloor" => $jsonArray[$i]["noFloor"],
                    'xPos' => $jsonArray[$i]["xPos"],
                    "yPos" => $jsonArray[$i]["yPos"],
                    "angle" => $jsonArray[$i]["angle"],
                    "plan_id" => $plan->id,
                    "status" => 1
                ]);
            }

        }

        return \Response::json([
            'success' => "The plan " . \Input::get('planName') . " has been successfully created !"
        ], 201);
    }

    public function postEdit()
    {
        $inputs = \Input::all();

        $rules = array(
            'emplTitleId' => 'required',
            'emplTitleName' => 'required',
            'emplTitleBaseSalary' => 'required'
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

            WorkTitle::where('id', \Input::get('emplTitleId'))
            ->update([
                'name' => \Input::get('emplTitleName'),
                'baseSalary' => \Input::get('emplTitleBaseSalary')
            ]);

        }

        return \Response::json([
            'success' => "The employee title " . \Input::get('emplTitleName') . " has been successfully edited !"
        ], 201);
    }

    public function delete($id)
    {
        $employee = Employee::GetById($id);
        $view = \View::make('POS.Employee.delete')->with('employee', $employee);
        return $view;
    }
}
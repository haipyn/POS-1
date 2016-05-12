<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Auth;
use Hash;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Support\Facades\Input;

class PasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    protected $redirectTo = '/';

    use ResetsPasswords;

    /**
     * Create a new password controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    public function passwordUpdate(){




        $rules = array(
            'now_password'          => 'required|min:8',
            'password'              => 'required|min:8|confirmed|different:now_password',
            'password_confirmation' => 'required|min:8',
        );
        $message = array(
            'required' => 'The :attribute is required !'
        );

        $validation = \Validator::make(Input::all(), $rules, $message);
        if($validation -> fails())
        {
            return \Redirect::url('/user/password/update', array())->withErrors($validation)
                ->withInput();
        }
        else {
            $now_password   = Input::get('now_password');
            if(Hash::check($now_password, Auth::user()->password)){
                $user = Auth::user();
                $user->password = Input::get('password');
                $user->save();
                \Redirect::url('/', array())->withSuccess('Password successfully updated !');
            }

        }
    }

}

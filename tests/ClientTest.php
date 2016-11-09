<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ClientTest extends TestCase
{

    public function testCreateClient()
    {
        $user = factory(App\Models\Auth\User::class)->create();

        $this->actingAs($user)
            ->withSession(['foo' => 'bar'])
            ->visit('/clients/create')
            ->type(10, 'credit')
            ->type('123141511123', 'rfid_card_code')
            ->press('btn-create-client')
            ->seePageIs('/clients')
            ->see('was successfully created!');

    }
    public function testEditClient()
    {
        $user = factory(App\Models\Auth\User::class)->create();

        $this->actingAs($user)
            ->withSession(['foo' => 'bar'])
            ->visit('/client/edit/2784390787')
            ->type(20, 'quantity')
            ->press('btn-edit-client')
            ->seePageIs('/client')
            ->see('was successfully updated!');

    }

}

<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiRootTest extends TestCase
{
    public function test_root_describes_the_api_as_json(): void
    {
        $this->getJson('/')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('api', url('/api/v1'));
    }

    public function test_health_check_is_available(): void
    {
        $this->get('/up')->assertOk();
    }
}

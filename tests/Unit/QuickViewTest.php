<?php

use Machour\DataTable\QuickView;

test('quickView has sensible defaults', function () {
    $qv = new QuickView(id: 'all', label: 'All');

    expect($qv)
        ->id->toBe('all')
        ->label->toBe('All')
        ->params->toBe([])
        ->icon->toBeNull()
        ->active->toBeFalse()
        ->columns->toBeNull();
});

test('quickView accepts all parameters', function () {
    $qv = new QuickView(
        id: 'enabled',
        label: 'Enabled',
        params: ['filter[enabled]' => 'eq:1'],
        icon: 'check-circle',
        active: true,
        columns: ['id', 'name', 'enabled'],
    );

    expect($qv)
        ->id->toBe('enabled')
        ->label->toBe('Enabled')
        ->params->toBe(['filter[enabled]' => 'eq:1'])
        ->icon->toBe('check-circle')
        ->active->toBeTrue()
        ->columns->toBe(['id', 'name', 'enabled']);
});

test('quickView serializes to array via laravel data', function () {
    $qv = new QuickView(id: 'test', label: 'Test', params: ['sort' => '-price']);
    $arr = $qv->toArray();

    expect($arr)
        ->toHaveKey('id', 'test')
        ->toHaveKey('label', 'Test')
        ->toHaveKey('params')
        ->toHaveKey('active', false);
});

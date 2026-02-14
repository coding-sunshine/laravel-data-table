<?php

use Machour\DataTable\Columns\Column;

test('column has sensible defaults', function () {
    $col = new Column(id: 'name', label: 'Name');

    expect($col)
        ->id->toBe('name')
        ->label->toBe('Name')
        ->type->toBe('text')
        ->sortable->toBeFalse()
        ->filterable->toBeFalse()
        ->visible->toBeTrue()
        ->options->toBeNull()
        ->min->toBeNull()
        ->max->toBeNull()
        ->icon->toBeNull()
        ->searchThreshold->toBeNull()
        ->group->toBeNull();
});

test('column accepts all parameters', function () {
    $options = [['label' => 'A', 'value' => 'a']];
    $col = new Column(
        id: 'status',
        label: 'Status',
        type: 'option',
        sortable: true,
        filterable: true,
        visible: false,
        options: $options,
        min: 0,
        max: 100,
        icon: 'check',
        searchThreshold: 5,
        group: 'Details',
    );

    expect($col)
        ->id->toBe('status')
        ->type->toBe('option')
        ->sortable->toBeTrue()
        ->filterable->toBeTrue()
        ->visible->toBeFalse()
        ->options->toBe($options)
        ->min->toBe(0.0)
        ->max->toBe(100.0)
        ->icon->toBe('check')
        ->searchThreshold->toBe(5)
        ->group->toBe('Details');
});

test('column serializes to array via laravel data', function () {
    $col = new Column(id: 'price', label: 'Prix', type: 'number', sortable: true);
    $arr = $col->toArray();

    expect($arr)
        ->toHaveKey('id', 'price')
        ->toHaveKey('label', 'Prix')
        ->toHaveKey('type', 'number')
        ->toHaveKey('sortable', true)
        ->toHaveKey('filterable', false);
});

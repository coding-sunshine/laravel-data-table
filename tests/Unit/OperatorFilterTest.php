<?php

use Machour\DataTable\Filters\OperatorFilter;
use Illuminate\Database\Eloquent\Builder;

beforeEach(function () {
    $this->builder = Mockery::mock(Builder::class);
});

test('default operator for text is contains', function () {
    $filter = new OperatorFilter('text');
    $this->builder->shouldReceive('where')->once()->with('name', 'LIKE', '%john%');
    $filter($this->builder, 'john', 'name');
});

test('default operator for number is eq', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '42');
    $filter($this->builder, '42', 'price');
});

test('default operator for option is in', function () {
    $filter = new OperatorFilter('option');
    $this->builder->shouldReceive('whereIn')->once()->with('status', ['active', 'pending']);
    $filter($this->builder, 'active,pending', 'status');
});

test('default operator for boolean is eq', function () {
    $filter = new OperatorFilter('boolean');
    $this->builder->shouldReceive('where')->once()->with('enabled', '1');
    $filter($this->builder, '1', 'enabled');
});

test('explicit eq operator', function () {
    $filter = new OperatorFilter('text');
    $this->builder->shouldReceive('where')->once()->with('name', 'exact');
    $filter($this->builder, 'eq:exact', 'name');
});

test('explicit neq operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '!=', '100');
    $filter($this->builder, 'neq:100', 'price');
});

test('gt operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '>', '50');
    $filter($this->builder, 'gt:50', 'price');
});

test('gte operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '>=', '50');
    $filter($this->builder, 'gte:50', 'price');
});

test('lt operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '<', '50');
    $filter($this->builder, 'lt:50', 'price');
});

test('lte operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('where')->once()->with('price', '<=', '50');
    $filter($this->builder, 'lte:50', 'price');
});

test('between operator', function () {
    $filter = new OperatorFilter('number');
    $this->builder->shouldReceive('whereBetween')->once()->with('price', ['10', '100']);
    $filter($this->builder, 'between:10,100', 'price');
});

test('in operator', function () {
    $filter = new OperatorFilter('option');
    $this->builder->shouldReceive('whereIn')->once()->with('status', ['a', 'b', 'c']);
    $filter($this->builder, 'in:a,b,c', 'status');
});

test('not_in operator', function () {
    $filter = new OperatorFilter('option');
    $this->builder->shouldReceive('whereNotIn')->once()->with('status', ['x', 'y']);
    $filter($this->builder, 'not_in:x,y', 'status');
});

test('contains operator', function () {
    $filter = new OperatorFilter('text');
    $this->builder->shouldReceive('where')->once()->with('name', 'LIKE', '%foo%');
    $filter($this->builder, 'contains:foo', 'name');
});

test('before operator', function () {
    $filter = new OperatorFilter('date');
    $this->builder->shouldReceive('where')->once()->with('created_at', '<', '2024-01-01');
    $filter($this->builder, 'before:2024-01-01', 'created_at');
});

test('after operator', function () {
    $filter = new OperatorFilter('date');
    $this->builder->shouldReceive('where')->once()->with('created_at', '>', '2024-01-01');
    $filter($this->builder, 'after:2024-01-01', 'created_at');
});

test('null operator', function () {
    $filter = new OperatorFilter('text');
    $this->builder->shouldReceive('whereNull')->once()->with('name');
    $filter($this->builder, 'null', 'name');
});

test('not_null operator', function () {
    $filter = new OperatorFilter('text');
    $this->builder->shouldReceive('whereNotNull')->once()->with('name');
    $filter($this->builder, 'not_null', 'name');
});

test('internalName remaps the column', function () {
    $filter = new OperatorFilter('number', 'real_column');
    $this->builder->shouldReceive('where')->once()->with('real_column', '42');
    $filter($this->builder, '42', 'display_column');
});

test('array value is joined with comma', function () {
    $filter = new OperatorFilter('option');
    $this->builder->shouldReceive('whereIn')->once()->with('status', ['a', 'b']);
    $filter($this->builder, ['a', 'b'], 'status');
});

test('unknown prefix is treated as value with default operator', function () {
    $filter = new OperatorFilter('text');
    // The underscore in 'unknown_prefix' gets escaped since it's a LIKE wildcard
    $expected = '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], 'unknown_prefix:value') . '%';
    $this->builder->shouldReceive('where')->once()->with('name', 'LIKE', $expected);
    $filter($this->builder, 'unknown_prefix:value', 'name');
});

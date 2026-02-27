<?php

namespace Machour\DataTable;

use Illuminate\Database\Eloquent\Model;

class SavedView extends Model
{
    protected $table = 'data_table_saved_views';

    protected $fillable = [
        'user_id',
        'table_name',
        'name',
        'filters',
        'sort',
        'columns',
        'column_order',
        'is_default',
    ];

    protected $casts = [
        'filters' => 'array',
        'columns' => 'array',
        'column_order' => 'array',
        'is_default' => 'boolean',
    ];

    public function user()
    {
        $userModel = config('auth.providers.users.model', 'App\Models\User');

        return $this->belongsTo($userModel);
    }

    public function scopeForTable($query, string $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    public function scopeForUser($query, int|string $userId)
    {
        return $query->where('user_id', $userId);
    }
}

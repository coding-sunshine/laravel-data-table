<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

trait HasAuditLog
{
    /**
     * Return the data table name for audit log entries.
     */
    abstract public static function tableAuditLogName(): string;

    /**
     * Return the database table name for audit log storage.
     */
    public static function tableAuditLogTable(): string
    {
        return 'data_table_audit_log';
    }

    /**
     * Whether audit logging is enabled for this table.
     */
    public static function tableAuditLogEnabled(): bool
    {
        return true;
    }

    /**
     * Record an audit log entry for an inline edit.
     */
    public static function logInlineEdit(Model $model, string $column, mixed $oldValue, mixed $newValue): void
    {
        if (! static::tableAuditLogEnabled()) {
            return;
        }

        DB::table(static::tableAuditLogTable())->insert([
            'table_name' => static::tableAuditLogName(),
            'action' => 'inline_edit',
            'row_id' => $model->getKey(),
            'column' => $column,
            'old_value' => is_scalar($oldValue) ? (string) $oldValue : json_encode($oldValue),
            'new_value' => is_scalar($newValue) ? (string) $newValue : json_encode($newValue),
            'user_id' => Auth::id(),
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Record an audit log entry for a toggle action.
     */
    public static function logToggle(Model $model, string $column, mixed $oldValue, mixed $newValue): void
    {
        if (! static::tableAuditLogEnabled()) {
            return;
        }

        DB::table(static::tableAuditLogTable())->insert([
            'table_name' => static::tableAuditLogName(),
            'action' => 'toggle',
            'row_id' => $model->getKey(),
            'column' => $column,
            'old_value' => is_scalar($oldValue) ? (string) $oldValue : json_encode($oldValue),
            'new_value' => is_scalar($newValue) ? (string) $newValue : json_encode($newValue),
            'user_id' => Auth::id(),
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Record an audit log entry for a row reorder.
     */
    public static function logReorder(array $ids, array $positions): void
    {
        if (! static::tableAuditLogEnabled()) {
            return;
        }

        DB::table(static::tableAuditLogTable())->insert([
            'table_name' => static::tableAuditLogName(),
            'action' => 'reorder',
            'row_id' => null,
            'column' => null,
            'old_value' => json_encode($ids),
            'new_value' => json_encode($positions),
            'user_id' => Auth::id(),
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Record an audit log entry for a bulk/batch action.
     */
    public static function logBulkAction(string $actionName, array $rowIds, ?string $column = null, mixed $value = null): void
    {
        if (! static::tableAuditLogEnabled()) {
            return;
        }

        DB::table(static::tableAuditLogTable())->insert([
            'table_name' => static::tableAuditLogName(),
            'action' => 'bulk_' . $actionName,
            'row_id' => null,
            'column' => $column,
            'old_value' => json_encode($rowIds),
            'new_value' => $value !== null ? (is_scalar($value) ? (string) $value : json_encode($value)) : null,
            'user_id' => Auth::id(),
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Retrieve recent audit log entries for this table.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function getAuditLog(int $limit = 50): \Illuminate\Support\Collection
    {
        return DB::table(static::tableAuditLogTable())
            ->where('table_name', static::tableAuditLogName())
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Retrieve audit log entries for a specific row.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function getRowAuditLog(int|string $rowId, int $limit = 50): \Illuminate\Support\Collection
    {
        return DB::table(static::tableAuditLogTable())
            ->where('table_name', static::tableAuditLogName())
            ->where('row_id', $rowId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}

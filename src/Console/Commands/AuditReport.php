<?php

namespace Machour\DataTable\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AuditReport extends Command
{
    protected $signature = 'data-table:audit-report
        {--table= : Filter by specific table name}
        {--action= : Filter by action type (inline_edit, toggle, reorder, bulk_*)}
        {--user= : Filter by user ID}
        {--days=7 : Number of days to look back (default: 7)}
        {--limit=100 : Maximum number of entries to display}
        {--format=table : Output format: table, json, or csv}';

    protected $description = 'Generate an audit report for DataTable changes';

    public function handle(): int
    {
        $auditTable = config('data-table.audit_table', 'data_table_audit_log');

        try {
            if (! DB::getSchemaBuilder()->hasTable($auditTable)) {
                $this->error("Audit log table '{$auditTable}' does not exist.");
                $this->info('Run the migration first: php artisan migrate');

                return self::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('Could not check audit table: ' . $e->getMessage());

            return self::FAILURE;
        }

        $query = DB::table($auditTable)->orderByDesc('created_at');

        if ($tableName = $this->option('table')) {
            $query->where('table_name', $tableName);
        }

        if ($action = $this->option('action')) {
            $query->where('action', $action);
        }

        if ($userId = $this->option('user')) {
            $query->where('user_id', $userId);
        }

        $days = (int) $this->option('days');
        if ($days > 0) {
            $query->where('created_at', '>=', now()->subDays($days));
        }

        $limit = (int) $this->option('limit');
        $entries = $query->limit($limit)->get();

        if ($entries->isEmpty()) {
            $this->info('No audit log entries found for the given filters.');

            return self::SUCCESS;
        }

        $format = $this->option('format');

        // Summary statistics
        $this->newLine();
        $this->info("Audit Report — Last {$days} day(s)");
        $this->line(str_repeat('─', 50));

        $byAction = $entries->groupBy('action');
        $this->info('Actions breakdown:');
        foreach ($byAction as $actionType => $group) {
            $this->line("  {$actionType}: {$group->count()}");
        }

        $byTable = $entries->groupBy('table_name');
        if ($byTable->count() > 1) {
            $this->newLine();
            $this->info('Tables breakdown:');
            foreach ($byTable as $table => $group) {
                $this->line("  {$table}: {$group->count()}");
            }
        }

        $byUser = $entries->groupBy('user_id');
        if ($byUser->count() > 1 || ($byUser->count() === 1 && $byUser->keys()->first() !== null)) {
            $this->newLine();
            $this->info('Users breakdown:');
            foreach ($byUser as $user => $group) {
                $userName = $user ?? 'system';
                $this->line("  User {$userName}: {$group->count()}");
            }
        }

        $this->newLine();
        $this->line(str_repeat('─', 50));
        $this->info("Showing {$entries->count()} entries (limit: {$limit})");
        $this->newLine();

        if ($format === 'json') {
            $this->line($entries->toJson(JSON_PRETTY_PRINT));

            return self::SUCCESS;
        }

        if ($format === 'csv') {
            $this->line('table_name,action,row_id,column,old_value,new_value,user_id,ip_address,created_at');
            foreach ($entries as $entry) {
                $this->line(implode(',', [
                    $this->csvEscape($entry->table_name),
                    $this->csvEscape($entry->action),
                    $this->csvEscape($entry->row_id),
                    $this->csvEscape($entry->column),
                    $this->csvEscape($entry->old_value),
                    $this->csvEscape($entry->new_value),
                    $this->csvEscape($entry->user_id),
                    $this->csvEscape($entry->ip_address),
                    $this->csvEscape($entry->created_at),
                ]));
            }

            return self::SUCCESS;
        }

        // Default: table format
        $this->table(
            ['Table', 'Action', 'Row ID', 'Column', 'Old Value', 'New Value', 'User', 'IP', 'When'],
            $entries->map(function ($entry) {
                return [
                    $entry->table_name,
                    $entry->action,
                    $this->truncate($entry->row_id, 10),
                    $entry->column ?? '—',
                    $this->truncate($entry->old_value, 20),
                    $this->truncate($entry->new_value, 20),
                    $entry->user_id ?? '—',
                    $entry->ip_address ?? '—',
                    $entry->created_at,
                ];
            })->all()
        );

        return self::SUCCESS;
    }

    private function truncate(?string $value, int $length): string
    {
        if ($value === null) {
            return '—';
        }

        return strlen($value) > $length ? substr($value, 0, $length) . '...' : $value;
    }

    private function csvEscape(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $value = (string) $value;

        if (str_contains($value, ',') || str_contains($value, '"') || str_contains($value, "\n")) {
            return '"' . str_replace('"', '""', $value) . '"';
        }

        return $value;
    }
}

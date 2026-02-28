<?php

namespace Machour\DataTable;

use Machour\DataTable\Columns\Column;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Data;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
abstract class AbstractDataTable extends Data
{
    protected static ?int $defaultPerPage = null;
    protected static ?int $maxPerPage = null;

    /**
     * Get the default per page value from config or class property.
     */
    protected static function resolveDefaultPerPage(): int
    {
        return static::$defaultPerPage ?? (int) config('data-table.default_per_page', 25);
    }

    /**
     * Get the max per page value from config or class property.
     */
    protected static function resolveMaxPerPage(): int
    {
        return static::$maxPerPage ?? (int) config('data-table.max_per_page', 100);
    }

    /**
     * Column ID to group rows by on the frontend. null = no grouping.
     */
    public static function tableGroupByColumn(): ?string
    {
        return null;
    }

    /**
     * @return array<int, Column>
     */
    abstract public static function tableColumns(): array;

    /**
     * @return array<int, QuickView>
     */
    public static function tableQuickViews(): array
    {
        return [];
    }

    abstract public static function tableBaseQuery(): Builder;

    public static function tableDefaultSort(): string
    {
        return '-id';
    }

    /**
     * Pagination type: 'standard', 'simple', or 'cursor'.
     */
    public static function tablePaginationType(): string
    {
        return 'standard';
    }

    /**
     * Return the columns that are searchable by global search.
     *
     * @return array<int, string>
     */
    public static function tableSearchableColumns(): array
    {
        return [];
    }

    /**
     * Optional: return an API Resource class to transform each row.
     *
     * @return class-string<JsonResource>|null
     */
    public static function tableResource(): ?string
    {
        return null;
    }

    /**
     * Compute footer aggregations for the current page of data.
     *
     * @param  \Illuminate\Support\Collection  $items  Collection of DTO instances for current page
     * @return array<string, mixed>  Column ID => aggregated value
     */
    public static function tableFooter(\Illuminate\Support\Collection $items): array
    {
        return [];
    }

    /**
     * Whether detail/expandable rows are enabled.
     */
    public static function tableDetailRowEnabled(): bool
    {
        return false;
    }

    /**
     * Return the detail data for a given model row.
     *
     * @param  mixed  $model
     * @return array<string, mixed>|null
     */
    public static function tableDetailRow(mixed $model): ?array
    {
        return null;
    }

    /**
     * Whether soft deletes toggle is enabled.
     */
    public static function tableSoftDeletesEnabled(): bool
    {
        return false;
    }

    /**
     * Whether to include trashed records by default.
     */
    public static function tableWithTrashedDefault(): bool
    {
        return false;
    }

    /**
     * Conditional row/cell rules for styling.
     * Each rule: ['column' => 'id', 'operator' => 'gt', 'value' => 5, 'row' => ['class' => '...'], 'cell' => ['class' => '...']]
     *
     * @return array<int, array{column: string, operator: string, value: mixed, row?: array, cell?: array}>
     */
    public static function tableRules(): array
    {
        return [];
    }

    /**
     * Compute full-dataset summary aggregations from column 'summary' properties.
     *
     * @return array<string, mixed>  Column ID => aggregated value
     */
    public static function tableSummary(QueryBuilder $query): array
    {
        $columns = collect(static::tableColumns())->filter(fn (Column $col) => $col->summary !== null);

        if ($columns->isEmpty()) {
            return [];
        }

        $selects = [];
        foreach ($columns as $col) {
            $fn = match ($col->summary) {
                'sum' => "SUM({$col->id})",
                'avg' => "AVG({$col->id})",
                'min' => "MIN({$col->id})",
                'max' => "MAX({$col->id})",
                'count' => "COUNT({$col->id})",
                default => null,
            };
            if ($fn) {
                $selects[] = DB::raw("{$fn} as summary_{$col->id}");
            }
        }

        if (empty($selects)) {
            return [];
        }

        $result = (clone $query)->getEloquentBuilder()->select($selects)->first();

        if (! $result) {
            return [];
        }

        $summary = [];
        foreach ($columns as $col) {
            $summary[$col->id] = $result->{"summary_{$col->id}"};
        }

        return $summary;
    }

    /**
     * Auto-refresh polling interval in seconds (0 = disabled).
     */
    public static function tablePollingInterval(): int
    {
        return 0;
    }

    /**
     * Whether state should be persisted server-side.
     */
    public static function tablePersistState(): bool
    {
        return false;
    }

    /**
     * Whether deferred/lazy loading is enabled.
     */
    public static function tableDeferLoading(): bool
    {
        return false;
    }

    /**
     * Return columns whose filter options should be loaded asynchronously.
     *
     * @return array<string>  Column IDs
     */
    public static function tableAsyncFilterColumns(): array
    {
        return [];
    }

    /**
     * Resolve async filter options for a given column.
     *
     * @return array<int, array{label: string, value: string}>
     */
    public static function resolveAsyncFilterOptions(string $columnId, ?string $search = null): array
    {
        return [];
    }

    /**
     * Map of column IDs to PHP enum classes for enum-based filters.
     *
     * @return array<string, class-string<\BackedEnum>>
     */
    public static function tableEnumFilters(): array
    {
        return [];
    }

    /**
     * Cascading/interdependent filter relationships.
     * Example: ['city' => 'country'] means city options depend on selected country.
     *
     * @return array<string, string>  dependent column => parent column
     */
    public static function tableCascadingFilters(): array
    {
        return [];
    }

    /**
     * Resolve cascading filter options for a dependent column.
     *
     * @return array<int, array{label: string, value: string}>
     */
    public static function resolveCascadingFilterOptions(string $columnId, mixed $parentValue): array
    {
        return [];
    }

    /**
     * @return array<int, AllowedFilter|string>
     */
    public static function tableAllowedFilters(): array
    {
        return collect(static::tableColumns())
            ->filter(fn (Column $col) => $col->filterable)
            ->map(fn (Column $col) => $col->id)
            ->values()
            ->all();
    }

    /**
     * @return array<int, AllowedSort|string>
     */
    public static function tableAllowedSorts(): array
    {
        return collect(static::tableColumns())
            ->filter(fn (Column $col) => $col->sortable)
            ->map(fn (Column $col) => $col->id)
            ->values()
            ->all();
    }

    /**
     * Build a filtered + sorted QueryBuilder with optional global search applied.
     * Shared by makeTable, HasExport, and HasSelectAll to avoid duplication.
     */
    public static function buildFilteredQuery(?Request $request = null, ?string $prefix = null): QueryBuilder
    {
        $request = $request ?? request();
        $paramPrefix = $prefix ? "{$prefix}_" : '';
        $searchKey = "{$paramPrefix}search";

        $baseQuery = static::tableBaseQuery();

        // Soft deletes toggle
        if (static::tableSoftDeletesEnabled()) {
            $withTrashed = $request->boolean("{$paramPrefix}with_trashed", static::tableWithTrashedDefault());
            if ($withTrashed) {
                $baseQuery = $baseQuery->withTrashed();
            }
        }

        $query = QueryBuilder::for($baseQuery, $request)
            ->allowedFilters(static::tableAllowedFilters())
            ->allowedSorts(static::tableAllowedSorts())
            ->defaultSort(static::tableDefaultSort());

        // Global search
        $searchTerm = $request->get($searchKey, '');
        $searchableColumns = static::tableSearchableColumns();
        if ($searchTerm && ! empty($searchableColumns)) {
            $escaped = str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $searchTerm);
            $query->where(function (Builder $q) use ($escaped, $searchableColumns) {
                foreach ($searchableColumns as $column) {
                    $q->orWhere($column, 'LIKE', '%' . $escaped . '%');
                }
            });
        }

        return $query;
    }

    /**
     * Build the table response.
     *
     * @param  Request|null  $request
     * @param  string|null   $prefix  Query parameter prefix for multiple tables per page
     */
    public static function makeTable(?Request $request = null, ?string $prefix = null): DataTableResponse
    {
        $request = $request ?? request();

        // Resolve parameter names (with optional prefix for multiple tables)
        $p = $prefix ? "{$prefix}_" : '';
        $sortKey = "{$p}sort";
        $pageKey = "{$p}page";
        $perPageKey = "{$p}per_page";
        $filterKey = "{$p}filter";

        $query = static::buildFilteredQuery($request, $prefix);

        $perPage = max(1, min((int) $request->get($perPageKey, static::resolveDefaultPerPage()), static::resolveMaxPerPage()));
        $paginationType = static::tablePaginationType();

        $meta = null;
        $items = null;

        if ($paginationType === 'cursor') {
            $paginator = $query->cursorPaginate($perPage, ['*'], 'cursor', $request->get("{$p}cursor"))
                ->withQueryString();

            $items = $paginator->items();

            $meta = new DataTableMeta(
                currentPage: 1,
                lastPage: 1,
                perPage: $paginator->perPage(),
                total: 0,
                sorts: static::parseSorts($request->get($sortKey, '')),
                filters: $request->get($filterKey, []),
                paginationType: 'cursor',
                nextCursor: $paginator->nextCursor()?->encode(),
                prevCursor: $paginator->previousCursor()?->encode(),
            );
        } elseif ($paginationType === 'simple') {
            $paginator = $query->simplePaginate($perPage, ['*'], $pageKey)->withQueryString();

            $items = $paginator->items();

            $meta = new DataTableMeta(
                currentPage: $paginator->currentPage(),
                lastPage: $paginator->hasMorePages() ? $paginator->currentPage() + 1 : $paginator->currentPage(),
                perPage: $paginator->perPage(),
                total: 0,
                sorts: static::parseSorts($request->get($sortKey, '')),
                filters: $request->get($filterKey, []),
                paginationType: 'simple',
            );
        } else {
            $paginator = $query->paginate($perPage, ['*'], $pageKey)->withQueryString();

            $items = $paginator->items();

            $meta = new DataTableMeta(
                currentPage: $paginator->currentPage(),
                lastPage: $paginator->lastPage(),
                perPage: $paginator->perPage(),
                total: $paginator->total(),
                sorts: static::parseSorts($request->get($sortKey, '')),
                filters: $request->get($filterKey, []),
                paginationType: 'standard',
            );
        }

        // Transform data through API Resource if configured
        $resourceClass = static::tableResource();
        if ($resourceClass) {
            $data = collect($items)->map(fn ($item) => (new $resourceClass($item))->resolve());
        } else {
            $data = static::collect($items);
            $data = $data instanceof \Illuminate\Support\Collection ? $data : collect($data);
        }

        $quickViews = collect(static::tableQuickViews())->map(function (QuickView $qv) use ($request) {
            $active = static::quickViewMatchesRequest($qv, $request);

            return new QuickView(
                id: $qv->id,
                label: $qv->label,
                params: $qv->params,
                icon: $qv->icon,
                active: $active,
                columns: $qv->columns,
            );
        })->all();

        $exportUrl = null;
        if (method_exists(static::class, 'tableExportEnabled') && static::tableExportEnabled() && method_exists(static::class, 'resolveExportUrl')) {
            $exportUrl = static::resolveExportUrl();
        }

        $dataCollection = $data instanceof \Illuminate\Support\Collection ? $data : collect($data);
        $footer = static::tableFooter($dataCollection);

        $selectAllUrl = null;
        if (method_exists(static::class, 'resolveSelectAllUrl')) {
            $selectAllUrl = static::resolveSelectAllUrl();
        }

        // Full-dataset summary aggregations
        $summary = static::tableSummary($query);

        // Resolve enum filter options
        $enumFilters = static::tableEnumFilters();
        $enumOptions = [];
        foreach ($enumFilters as $columnId => $enumClass) {
            $enumOptions[$columnId] = collect($enumClass::cases())->map(fn ($case) => [
                'label' => method_exists($case, 'label') ? $case->label() : $case->name,
                'value' => (string) $case->value,
            ])->all();
        }

        // Build table config for frontend
        $tableConfig = [
            'detailRowEnabled' => static::tableDetailRowEnabled(),
            'softDeletesEnabled' => static::tableSoftDeletesEnabled(),
            'pollingInterval' => static::tablePollingInterval(),
            'persistState' => static::tablePersistState(),
            'deferLoading' => static::tableDeferLoading(),
            'asyncFilterColumns' => static::tableAsyncFilterColumns(),
            'cascadingFilters' => static::tableCascadingFilters(),
            'rules' => static::tableRules(),
        ];

        // Toggle URL
        $toggleUrl = null;
        if (method_exists(static::class, 'resolveToggleUrl') && collect(static::tableColumns())->contains(fn (Column $col) => $col->toggleable)) {
            $toggleUrl = static::resolveToggleUrl();
        }

        // Reorder URL
        $reorderUrl = null;
        if (method_exists(static::class, 'resolveReorderUrl')) {
            $reorderUrl = static::resolveReorderUrl();
        }

        // Import URL
        $importUrl = null;
        if (method_exists(static::class, 'tableImportEnabled') && static::tableImportEnabled() && method_exists(static::class, 'resolveImportUrl')) {
            $importUrl = static::resolveImportUrl();
        }

        return new DataTableResponse(
            data: $dataCollection->all(),
            columns: static::tableColumns(),
            quickViews: $quickViews,
            meta: $meta,
            exportUrl: $exportUrl,
            footer: ! empty($footer) ? $footer : null,
            selectAllUrl: $selectAllUrl,
            summary: ! empty($summary) ? $summary : null,
            config: $tableConfig,
            toggleUrl: $toggleUrl,
            enumOptions: ! empty($enumOptions) ? $enumOptions : null,
            reorderUrl: $reorderUrl,
            importUrl: $importUrl,
            groupByColumn: static::tableGroupByColumn(),
        );
    }

    /**
     * Parse sort parameter string into structured array.
     */
    protected static function parseSorts(string $sortParam): array
    {
        $sorts = [];
        if ($sortParam) {
            foreach (explode(',', $sortParam) as $s) {
                $s = trim($s);
                if (! $s) {
                    continue;
                }
                $direction = 'asc';
                if (str_starts_with($s, '-')) {
                    $s = ltrim($s, '-');
                    $direction = 'desc';
                }
                $sorts[] = ['id' => $s, 'direction' => $direction];
            }
        }
        return $sorts;
    }

    protected static function quickViewMatchesRequest(QuickView $qv, Request $request): bool
    {
        if (empty($qv->params)) {
            return ! $request->has('filter') && ! $request->has('sort');
        }

        $qvFilterKeys = [];

        foreach ($qv->params as $key => $value) {
            // Convert bracket notation to dot notation: filter[enabled] → filter.enabled
            $inputKey = preg_replace('/\[([^\]]+)\]/', '.$1', $key);

            if ((string) $request->input($inputKey) !== (string) $value) {
                return false;
            }

            if (preg_match('/^filter\[(.+)]$/', $key, $m)) {
                $qvFilterKeys[] = $m[1];
            }
        }

        // Ensure the request doesn't have extra filters beyond what the QuickView defines
        $requestFilterKeys = array_keys($request->get('filter', []));

        return count($requestFilterKeys) === count($qvFilterKeys);
    }
}

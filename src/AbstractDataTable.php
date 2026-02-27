<?php

namespace Machour\DataTable;

use Machour\DataTable\Columns\Column;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\LaravelData\Data;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
abstract class AbstractDataTable extends Data
{
    protected static int $defaultPerPage = 25;

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
        $searchKey = "{$p}search";

        $query = QueryBuilder::for(static::tableBaseQuery(), $request)
            ->allowedFilters(static::tableAllowedFilters())
            ->allowedSorts(static::tableAllowedSorts())
            ->defaultSort(static::tableDefaultSort());

        // Global search
        $searchTerm = $request->get($searchKey, '');
        $searchableColumns = static::tableSearchableColumns();
        if ($searchTerm && ! empty($searchableColumns)) {
            $query->where(function (Builder $q) use ($searchTerm, $searchableColumns) {
                foreach ($searchableColumns as $column) {
                    $q->orWhere($column, 'LIKE', '%' . $searchTerm . '%');
                }
            });
        }

        $perPage = (int) $request->get($perPageKey, static::$defaultPerPage);
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

        return new DataTableResponse(
            data: $dataCollection->all(),
            columns: static::tableColumns(),
            quickViews: $quickViews,
            meta: $meta,
            exportUrl: $exportUrl,
            footer: ! empty($footer) ? $footer : null,
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

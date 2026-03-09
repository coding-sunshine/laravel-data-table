<?php

namespace Machour\DataTable\Columns;

/**
 * Fluent builder for Column definitions.
 *
 * Usage:
 *   ColumnBuilder::make('price', 'Price')->currency('EUR')->sortable()->summary('sum')->build()
 *   ColumnBuilder::make('status', 'Status')->iconColumn(['active' => 'check-circle', 'inactive' => 'x-circle'])->build()
 *   ColumnBuilder::make('total', 'Total')->computed(['price', 'quantity'], 'price * quantity')->build()
 */
class ColumnBuilder
{
    /** @var array<string, \Closure> Dynamic suffix resolvers keyed by column ID */
    private static array $suffixResolvers = [];

    /** @var array<string, \Closure> Computed column resolvers keyed by column ID */
    private static array $computedResolvers = [];

    /**
     * Get all registered dynamic suffix resolvers.
     *
     * @return array<string, \Closure>
     */
    public static function getSuffixResolvers(): array
    {
        return static::$suffixResolvers;
    }

    /**
     * Clear all registered suffix resolvers (useful between requests/tests).
     */
    public static function clearSuffixResolvers(): void
    {
        static::$suffixResolvers = [];
    }

    /**
     * Get all registered computed column resolvers.
     *
     * @return array<string, \Closure>
     */
    public static function getComputedResolvers(): array
    {
        return static::$computedResolvers;
    }

    /**
     * Clear all registered computed column resolvers.
     */
    public static function clearComputedResolvers(): void
    {
        static::$computedResolvers = [];
    }

    private string $id;

    private string $label;

    private string $type = 'text';

    private bool $sortable = false;

    private bool $filterable = false;

    private bool $visible = true;

    private ?array $options = null;

    private ?float $min = null;

    private ?float $max = null;

    private ?string $icon = null;

    private ?int $searchThreshold = null;

    private ?string $group = null;

    private bool $editable = false;

    private ?string $currencyCode = null;

    private ?string $locale = null;

    private ?string $summaryType = null;

    private bool $toggleable = false;

    private ?int $responsivePriority = null;

    private ?string $internalName = null;

    private ?string $relation = null;

    private ?string $prefix = null;

    private string|\Closure|null $suffix = null;

    private ?string $tooltip = null;

    private ?string $description = null;

    private ?int $lineClamp = null;

    private ?array $iconMap = null;

    private ?array $colorMap = null;

    private ?array $selectOptions = null;

    private bool $html = false;

    private bool $markdown = false;

    private bool $bulleted = false;

    private ?array $stacked = null;

    private bool $rowIndex = false;

    private ?string $avatarColumn = null;

    private ?array $computedFrom = null;

    private ?\Closure $computedResolver = null;

    private ?int $colSpan = null;

    private bool $autoHeight = false;

    private ?string $valueGetter = null;

    private ?string $valueFormatter = null;

    private bool $headerFilter = false;

    private ?string $sparkline = null;

    private ?string $treeParent = null;

    private function __construct(string $id, string $label)
    {
        $this->id = $id;
        $this->label = $label;
    }

    /**
     * Create a new column builder.
     */
    public static function make(string $id, string $label): self
    {
        return new self($id, $label);
    }

    // ─── Type setters ────────────────────────────────────────

    public function text(): self
    {
        $this->type = 'text';

        return $this;
    }

    public function number(): self
    {
        $this->type = 'number';

        return $this;
    }

    public function date(): self
    {
        $this->type = 'date';

        return $this;
    }

    public function option(?array $options = null): self
    {
        $this->type = 'option';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    public function multiOption(?array $options = null): self
    {
        $this->type = 'multiOption';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    public function boolean(): self
    {
        $this->type = 'boolean';

        return $this;
    }

    public function image(): self
    {
        $this->type = 'image';

        return $this;
    }

    public function badge(?array $options = null): self
    {
        $this->type = 'badge';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    public function currency(?string $code = null): self
    {
        $this->type = 'currency';
        if ($code !== null) {
            $this->currencyCode = $code;
        }

        return $this;
    }

    public function percentage(): self
    {
        $this->type = 'percentage';

        return $this;
    }

    public function link(): self
    {
        $this->type = 'link';

        return $this;
    }

    public function email(): self
    {
        $this->type = 'email';

        return $this;
    }

    public function phone(): self
    {
        $this->type = 'phone';

        return $this;
    }

    /**
     * Set the column type to 'icon' with a value-to-icon mapping.
     */
    public function iconColumn(array $iconMap): self
    {
        $this->type = 'icon';
        $this->iconMap = $iconMap;

        return $this;
    }

    /**
     * Set the column type to 'color' (displays a color swatch).
     */
    public function color(): self
    {
        $this->type = 'color';

        return $this;
    }

    /**
     * Set the column type to 'select' for inline dropdown editing.
     */
    public function select(array $options): self
    {
        $this->type = 'select';
        $this->selectOptions = $options;
        $this->editable = true;

        return $this;
    }

    // ─── Behavior setters ────────────────────────────────────

    public function sortable(bool $sortable = true): self
    {
        $this->sortable = $sortable;

        return $this;
    }

    public function filterable(bool $filterable = true): self
    {
        $this->filterable = $filterable;

        return $this;
    }

    public function visible(bool $visible = true): self
    {
        $this->visible = $visible;

        return $this;
    }

    public function hidden(): self
    {
        $this->visible = false;

        return $this;
    }

    public function options(array $options): self
    {
        $this->options = $options;

        return $this;
    }

    public function range(?float $min = null, ?float $max = null): self
    {
        $this->min = $min;
        $this->max = $max;

        return $this;
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function searchThreshold(int $threshold): self
    {
        $this->searchThreshold = $threshold;

        return $this;
    }

    public function group(string $group): self
    {
        $this->group = $group;

        return $this;
    }

    public function editable(bool $editable = true): self
    {
        $this->editable = $editable;

        return $this;
    }

    public function locale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function summary(string $type): self
    {
        $this->summaryType = $type;

        return $this;
    }

    public function toggleable(bool $toggleable = true): self
    {
        $this->toggleable = $toggleable;

        return $this;
    }

    public function responsivePriority(int $priority): self
    {
        $this->responsivePriority = $priority;

        return $this;
    }

    public function internalName(string $name): self
    {
        $this->internalName = $name;

        return $this;
    }

    public function relation(string $relation): self
    {
        $this->relation = $relation;

        return $this;
    }

    public function belongsTo(string $relation, string $attribute): self
    {
        $this->relation = $relation;
        $this->internalName = $relation . '.' . $attribute;

        return $this;
    }

    // ─── New Filament-inspired setters ───────────────────────

    /**
     * Add text before the cell value (e.g., '$', '€', '#').
     */
    public function prefix(string $prefix): self
    {
        $this->prefix = $prefix;

        return $this;
    }

    /**
     * Add text after the cell value.
     *
     * Accepts a static string (e.g., ' kg') or a closure for dynamic suffixes:
     *   ->suffix(fn($value) => $value === 1 ? ' org' : ' orgs')
     */
    public function suffix(string|\Closure $suffix): self
    {
        $this->suffix = $suffix;

        return $this;
    }

    /**
     * Set hover tooltip text. Pass a column ID to read from the row dynamically.
     */
    public function tooltip(string $tooltip): self
    {
        $this->tooltip = $tooltip;

        return $this;
    }

    /**
     * Add description text below the column header label.
     */
    public function description(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Limit visible text lines via CSS line-clamp.
     */
    public function lineClamp(int $lines): self
    {
        $this->lineClamp = $lines;

        return $this;
    }

    /**
     * Map values to icon names for display.
     */
    public function iconMap(array $map): self
    {
        $this->iconMap = $map;

        return $this;
    }

    /**
     * Map values to Tailwind color classes for conditional cell coloring.
     */
    public function colorMap(array $map): self
    {
        $this->colorMap = $map;

        return $this;
    }

    /**
     * Set options for inline select dropdown editing.
     */
    public function selectOptions(array $options): self
    {
        $this->selectOptions = $options;

        return $this;
    }

    /**
     * Render cell value as sanitized HTML.
     */
    public function html(bool $html = true): self
    {
        $this->html = $html;

        return $this;
    }

    /**
     * Render cell value as Markdown.
     */
    public function markdown(bool $markdown = true): self
    {
        $this->markdown = $markdown;

        return $this;
    }

    /**
     * Display array values as a bulleted list.
     */
    public function bulleted(bool $bulleted = true): self
    {
        $this->bulleted = $bulleted;

        return $this;
    }

    /**
     * Stack multiple column values vertically in this cell.
     *
     * @param  array<string>  $columnIds  IDs of other columns to stack
     */
    public function stacked(array $columnIds): self
    {
        $this->stacked = $columnIds;

        return $this;
    }

    /**
     * Make this a row index column (auto-incrementing row number).
     */
    public function rowIndex(bool $rowIndex = true): self
    {
        $this->rowIndex = $rowIndex;

        return $this;
    }

    /**
     * Show an avatar image alongside this column's text value.
     *
     * @param  string  $imageColumn  The column ID that holds the avatar/image URL
     */
    public function avatar(string $imageColumn): self
    {
        $this->avatarColumn = $imageColumn;

        return $this;
    }

    /**
     * Define a computed column derived from other columns.
     *
     * The closure receives the row array and returns the computed value.
     *
     * @param  array<string>  $sourceColumns  Column IDs this column depends on
     * @param  \Closure  $resolver  fn(array $row): mixed
     */
    public function computed(array $sourceColumns, \Closure $resolver): self
    {
        $this->computedFrom = $sourceColumns;
        $this->computedResolver = $resolver;

        return $this;
    }

    /**
     * Set the number of columns this cell should span.
     */
    public function colSpan(int $span): self
    {
        $this->colSpan = $span;

        return $this;
    }

    /**
     * Enable dynamic row height auto-sizing for this column's content.
     */
    public function autoHeight(bool $autoHeight = true): self
    {
        $this->autoHeight = $autoHeight;

        return $this;
    }

    /**
     * Set a valueGetter expression for deriving the value used in sorting/filtering.
     */
    public function valueGetter(string $getter): self
    {
        $this->valueGetter = $getter;

        return $this;
    }

    /**
     * Set a valueFormatter expression for display formatting (e.g., '{value} USD').
     */
    public function valueFormatter(string $formatter): self
    {
        $this->valueFormatter = $formatter;

        return $this;
    }

    /**
     * Enable inline header filter for this column.
     */
    public function headerFilter(bool $enabled = true): self
    {
        $this->headerFilter = $enabled;

        return $this;
    }

    /**
     * Set sparkline chart type for this column ('line' or 'bar').
     */
    public function sparkline(string $type = 'line'): self
    {
        $this->sparkline = $type;

        return $this;
    }

    /**
     * Set tree parent column ID for hierarchical tree data.
     */
    public function treeParent(string $parentColumnId): self
    {
        $this->treeParent = $parentColumnId;

        return $this;
    }

    /**
     * Build the Column instance.
     */
    public function build(): Column
    {
        // If suffix is a Closure, register it for server-side resolution
        $suffixValue = $this->suffix;
        $hasDynamicSuffix = false;
        if ($suffixValue instanceof \Closure) {
            static::$suffixResolvers[$this->id] = $suffixValue;
            $suffixValue = null;
            $hasDynamicSuffix = true;
        }

        // If computed, register the resolver for server-side resolution
        if ($this->computedResolver !== null) {
            static::$computedResolvers[$this->id] = $this->computedResolver;
        }

        return new Column(
            id: $this->id,
            label: $this->label,
            type: $this->type,
            sortable: $this->sortable,
            filterable: $this->filterable,
            visible: $this->visible,
            options: $this->options,
            min: $this->min,
            max: $this->max,
            icon: $this->icon,
            searchThreshold: $this->searchThreshold,
            group: $this->group,
            editable: $this->editable,
            currency: $this->currencyCode,
            locale: $this->locale,
            summary: $this->summaryType,
            toggleable: $this->toggleable,
            responsivePriority: $this->responsivePriority,
            internalName: $this->internalName,
            relation: $this->relation,
            prefix: $this->prefix,
            suffix: $suffixValue,
            hasDynamicSuffix: $hasDynamicSuffix,
            tooltip: $this->tooltip,
            description: $this->description,
            lineClamp: $this->lineClamp,
            iconMap: $this->iconMap,
            colorMap: $this->colorMap,
            selectOptions: $this->selectOptions,
            html: $this->html,
            markdown: $this->markdown,
            bulleted: $this->bulleted,
            stacked: $this->stacked,
            rowIndex: $this->rowIndex,
            avatarColumn: $this->avatarColumn,
            computedFrom: $this->computedFrom,
            colSpan: $this->colSpan,
            autoHeight: $this->autoHeight,
            valueGetter: $this->valueGetter,
            valueFormatter: $this->valueFormatter,
            headerFilter: $this->headerFilter,
            sparkline: $this->sparkline,
            treeParent: $this->treeParent,
        );
    }
}

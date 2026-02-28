<?php

namespace Machour\DataTable\Testing;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\Column;
use Machour\DataTable\Concerns\HasExport;
use Machour\DataTable\Concerns\HasImport;
use Machour\DataTable\Concerns\HasInlineEdit;
use Machour\DataTable\Concerns\HasReorder;
use Machour\DataTable\Concerns\HasSelectAll;
use Machour\DataTable\Concerns\HasToggle;
use PHPUnit\Framework\Assert;

/**
 * Fluent test helper for asserting DataTable configuration.
 *
 * Usage:
 *   DataTableTestHelper::for(ProductDataTable::class)
 *       ->assertColumnExists('price')
 *       ->assertColumnType('price', 'currency')
 *       ->assertFilterable('status')
 *       ->assertSortable('created_at')
 *       ->assertExportEnabled()
 *       ->assertColumnCount(5);
 */
class DataTableTestHelper
{
    /** @var class-string<AbstractDataTable> */
    private string $class;

    /** @var Column[] */
    private array $columns;

    /**
     * @param class-string<AbstractDataTable> $class
     */
    private function __construct(string $class)
    {
        $this->class = $class;
        $this->columns = $class::tableColumns();
    }

    /**
     * Create a test helper for a DataTable class.
     *
     * @param class-string<AbstractDataTable> $class
     */
    public static function for(string $class): self
    {
        return new self($class);
    }

    /**
     * Assert that a column with the given ID exists.
     */
    public function assertColumnExists(string $columnId): self
    {
        $found = collect($this->columns)->contains(fn (Column $col) => $col->id === $columnId);
        Assert::assertTrue($found, "Column '{$columnId}' does not exist in {$this->class}.");

        return $this;
    }

    /**
     * Assert that a column does NOT exist.
     */
    public function assertColumnNotExists(string $columnId): self
    {
        $found = collect($this->columns)->contains(fn (Column $col) => $col->id === $columnId);
        Assert::assertFalse($found, "Column '{$columnId}' should not exist in {$this->class}.");

        return $this;
    }

    /**
     * Assert the total number of columns.
     */
    public function assertColumnCount(int $expected): self
    {
        Assert::assertCount($expected, $this->columns, "Expected {$expected} columns in {$this->class}.");

        return $this;
    }

    /**
     * Assert that a column has a specific type.
     */
    public function assertColumnType(string $columnId, string $expectedType): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertEquals($expectedType, $col->type, "Column '{$columnId}' type mismatch.");

        return $this;
    }

    /**
     * Assert that a column is sortable.
     */
    public function assertSortable(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertTrue($col->sortable, "Column '{$columnId}' is not sortable.");

        return $this;
    }

    /**
     * Assert that a column is NOT sortable.
     */
    public function assertNotSortable(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertFalse($col->sortable, "Column '{$columnId}' should not be sortable.");

        return $this;
    }

    /**
     * Assert that a column is filterable.
     */
    public function assertFilterable(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertTrue($col->filterable, "Column '{$columnId}' is not filterable.");

        return $this;
    }

    /**
     * Assert that a column is NOT filterable.
     */
    public function assertNotFilterable(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertFalse($col->filterable, "Column '{$columnId}' should not be filterable.");

        return $this;
    }

    /**
     * Assert that a column is editable.
     */
    public function assertEditable(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertTrue($col->editable, "Column '{$columnId}' is not editable.");

        return $this;
    }

    /**
     * Assert that a column is visible by default.
     */
    public function assertVisible(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertTrue($col->visible, "Column '{$columnId}' is not visible.");

        return $this;
    }

    /**
     * Assert that a column is hidden by default.
     */
    public function assertHidden(string $columnId): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertFalse($col->visible, "Column '{$columnId}' should be hidden.");

        return $this;
    }

    /**
     * Assert that a column has a summary.
     */
    public function assertHasSummary(string $columnId, ?string $type = null): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertNotNull($col->summary, "Column '{$columnId}' has no summary.");
        if ($type !== null) {
            Assert::assertEquals($type, $col->summary, "Column '{$columnId}' summary type mismatch.");
        }

        return $this;
    }

    /**
     * Assert that a column belongs to a group.
     */
    public function assertColumnGroup(string $columnId, string $expectedGroup): self
    {
        $col = $this->findColumn($columnId);
        Assert::assertEquals($expectedGroup, $col->group, "Column '{$columnId}' group mismatch.");

        return $this;
    }

    /**
     * Assert that export is enabled on this DataTable.
     */
    public function assertExportEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasExport::class),
            "{$this->class} does not use HasExport trait."
        );

        return $this;
    }

    /**
     * Assert that inline edit is enabled.
     */
    public function assertInlineEditEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasInlineEdit::class),
            "{$this->class} does not use HasInlineEdit trait."
        );

        return $this;
    }

    /**
     * Assert that select-all is enabled.
     */
    public function assertSelectAllEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasSelectAll::class),
            "{$this->class} does not use HasSelectAll trait."
        );

        return $this;
    }

    /**
     * Assert that reorder is enabled.
     */
    public function assertReorderEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasReorder::class),
            "{$this->class} does not use HasReorder trait."
        );

        return $this;
    }

    /**
     * Assert that toggle is enabled.
     */
    public function assertToggleEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasToggle::class),
            "{$this->class} does not use HasToggle trait."
        );

        return $this;
    }

    /**
     * Assert that import is enabled.
     */
    public function assertImportEnabled(): self
    {
        Assert::assertTrue(
            $this->usesTrait(HasImport::class),
            "{$this->class} does not use HasImport trait."
        );

        return $this;
    }

    /**
     * Assert the table has quick views.
     */
    public function assertHasQuickViews(int $minCount = 1): self
    {
        $views = $this->class::tableQuickViews();
        Assert::assertGreaterThanOrEqual(
            $minCount,
            count($views),
            "Expected at least {$minCount} quick view(s), got " . count($views) . '.'
        );

        return $this;
    }

    /**
     * Assert the default sort matches.
     */
    public function assertDefaultSort(string $expected): self
    {
        Assert::assertEquals(
            $expected,
            $this->class::tableDefaultSort(),
            'Default sort mismatch.'
        );

        return $this;
    }

    /**
     * Get all columns.
     *
     * @return Column[]
     */
    public function getColumns(): array
    {
        return $this->columns;
    }

    /**
     * Find a column by ID or fail.
     */
    private function findColumn(string $columnId): Column
    {
        $col = collect($this->columns)->first(fn (Column $c) => $c->id === $columnId);
        Assert::assertNotNull($col, "Column '{$columnId}' not found in {$this->class}.");

        return $col;
    }

    /**
     * Check if the DataTable class uses a specific trait.
     */
    private function usesTrait(string $traitClass): bool
    {
        return in_array($traitClass, class_uses_recursive($this->class));
    }
}

<?php

namespace Machour\DataTable\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

class GenerateTranslations extends Command
{
    protected $signature = 'data-table:translations
        {--lang=en : Language code to generate (e.g. en, fr, es, de, pt, ar, zh, ja)}
        {--output= : Custom output path (defaults to resources/js/data-table/i18n-{lang}.ts)}
        {--all : Generate all built-in language files}';

    protected $description = 'Generate frontend translation files for data table UI strings';

    /** @var array<string, array<string, string|array<string, string>>> */
    private array $translations = [
        'en' => [
            'totalResults' => '(count) => `${count} result${count !== 1 ? "s" : ""}`',
            'rowsPerPage' => 'Rows per page',
            'pageOf' => '(current, last) => `Page ${current} / ${last}`',
            'columns' => 'Columns',
            'reorder' => 'Reorder',
            'done' => 'Done',
            'export' => 'Export',
            'exportFormat' => 'Export format',
            'filter' => 'Filter',
            'search' => 'Search...',
            'operators' => 'Operators',
            'clearAllFilters' => 'Clear all filters',
            'noResults' => 'No results.',
            'pressEnterToFilter' => 'Press Enter to filter',
            'yes' => 'Yes',
            'no' => 'No',
            'selectAll' => 'Select all',
            'selectRow' => 'Select row',
            'selected' => '(count) => `${count} selected`',
            'cancel' => 'Cancel',
            'save' => 'Save',
            'noData' => 'No results.',
            'actions' => 'Actions',
            'loading' => 'Loading...',
            'print' => 'Print',
            'expand' => 'Expand',
            'collapse' => 'Collapse',
            'density' => 'Density',
            'densityCompact' => 'Compact',
            'densityComfortable' => 'Comfortable',
            'densitySpacious' => 'Spacious',
            'copied' => 'Copied!',
            'copyToClipboard' => 'Copy to clipboard',
            'undo' => 'Undo',
            'redo' => 'Redo',
            'editUndone' => 'Edit undone',
            'editRedone' => 'Edit redone',
            'keyboardShortcuts' => 'Keyboard shortcuts',
            'close' => 'Close',
            'exporting' => 'Exporting...',
            'exportReady' => 'Export ready',
            'exportDownload' => 'Download',
            'emptyTitle' => 'No data yet',
            'emptyDescription' => 'There are no records to display. Try adjusting your filters or adding new data.',
        ],
        'fr' => [
            'totalResults' => '(count) => `${count} résultat${count !== 1 ? "s" : ""}`',
            'rowsPerPage' => 'Lignes par page',
            'pageOf' => '(current, last) => `Page ${current} / ${last}`',
            'columns' => 'Colonnes',
            'reorder' => 'Réordonner',
            'done' => 'Terminé',
            'export' => 'Exporter',
            'exportFormat' => "Format d'export",
            'filter' => 'Filtrer',
            'search' => 'Rechercher...',
            'operators' => 'Opérateurs',
            'clearAllFilters' => 'Effacer tous les filtres',
            'noResults' => 'Aucun résultat.',
            'pressEnterToFilter' => 'Appuyez sur Entrée pour filtrer',
            'yes' => 'Oui',
            'no' => 'Non',
            'selectAll' => 'Tout sélectionner',
            'selectRow' => 'Sélectionner la ligne',
            'selected' => '(count) => `${count} sélectionné${count > 1 ? "s" : ""}`',
            'cancel' => 'Annuler',
            'save' => 'Sauvegarder',
            'noData' => 'Aucun résultat.',
            'actions' => 'Actions',
            'loading' => 'Chargement...',
            'print' => 'Imprimer',
            'expand' => 'Développer',
            'collapse' => 'Réduire',
            'density' => 'Densité',
            'densityCompact' => 'Compact',
            'densityComfortable' => 'Confortable',
            'densitySpacious' => 'Spacieux',
            'copied' => 'Copié !',
            'copyToClipboard' => 'Copier dans le presse-papier',
            'undo' => 'Annuler',
            'redo' => 'Refaire',
            'editUndone' => 'Modification annulée',
            'editRedone' => 'Modification rétablie',
            'keyboardShortcuts' => 'Raccourcis clavier',
            'close' => 'Fermer',
            'exporting' => 'Export en cours...',
            'exportReady' => 'Export prêt',
            'exportDownload' => 'Télécharger',
            'emptyTitle' => 'Aucune donnée',
            'emptyDescription' => "Il n'y a aucun enregistrement à afficher. Essayez de modifier vos filtres ou d'ajouter des données.",
        ],
        'es' => [
            'totalResults' => '(count) => `${count} resultado${count !== 1 ? "s" : ""}`',
            'rowsPerPage' => 'Filas por página',
            'pageOf' => '(current, last) => `Página ${current} / ${last}`',
            'columns' => 'Columnas',
            'reorder' => 'Reordenar',
            'done' => 'Hecho',
            'export' => 'Exportar',
            'exportFormat' => 'Formato de exportación',
            'filter' => 'Filtrar',
            'search' => 'Buscar...',
            'operators' => 'Operadores',
            'clearAllFilters' => 'Borrar todos los filtros',
            'noResults' => 'Sin resultados.',
            'pressEnterToFilter' => 'Pulse Enter para filtrar',
            'yes' => 'Sí',
            'no' => 'No',
            'selectAll' => 'Seleccionar todo',
            'selectRow' => 'Seleccionar fila',
            'selected' => '(count) => `${count} seleccionado${count !== 1 ? "s" : ""}`',
            'cancel' => 'Cancelar',
            'save' => 'Guardar',
            'noData' => 'Sin resultados.',
            'actions' => 'Acciones',
            'loading' => 'Cargando...',
            'print' => 'Imprimir',
            'expand' => 'Expandir',
            'collapse' => 'Contraer',
            'density' => 'Densidad',
            'densityCompact' => 'Compacto',
            'densityComfortable' => 'Cómodo',
            'densitySpacious' => 'Espacioso',
            'copied' => '¡Copiado!',
            'copyToClipboard' => 'Copiar al portapapeles',
            'undo' => 'Deshacer',
            'redo' => 'Rehacer',
            'editUndone' => 'Edición deshecha',
            'editRedone' => 'Edición rehecha',
            'keyboardShortcuts' => 'Atajos de teclado',
            'close' => 'Cerrar',
            'exporting' => 'Exportando...',
            'exportReady' => 'Exportación lista',
            'exportDownload' => 'Descargar',
            'emptyTitle' => 'Sin datos',
            'emptyDescription' => 'No hay registros para mostrar. Intente ajustar sus filtros o agregar nuevos datos.',
        ],
        'de' => [
            'totalResults' => '(count) => `${count} Ergebnis${count !== 1 ? "se" : ""}`',
            'rowsPerPage' => 'Zeilen pro Seite',
            'pageOf' => '(current, last) => `Seite ${current} / ${last}`',
            'columns' => 'Spalten',
            'reorder' => 'Neu ordnen',
            'done' => 'Fertig',
            'export' => 'Exportieren',
            'exportFormat' => 'Exportformat',
            'filter' => 'Filtern',
            'search' => 'Suchen...',
            'operators' => 'Operatoren',
            'clearAllFilters' => 'Alle Filter löschen',
            'noResults' => 'Keine Ergebnisse.',
            'pressEnterToFilter' => 'Enter drücken zum Filtern',
            'yes' => 'Ja',
            'no' => 'Nein',
            'selectAll' => 'Alle auswählen',
            'selectRow' => 'Zeile auswählen',
            'selected' => '(count) => `${count} ausgewählt`',
            'cancel' => 'Abbrechen',
            'save' => 'Speichern',
            'noData' => 'Keine Ergebnisse.',
            'actions' => 'Aktionen',
            'loading' => 'Laden...',
            'print' => 'Drucken',
            'expand' => 'Erweitern',
            'collapse' => 'Reduzieren',
            'density' => 'Dichte',
            'densityCompact' => 'Kompakt',
            'densityComfortable' => 'Komfortabel',
            'densitySpacious' => 'Geräumig',
            'copied' => 'Kopiert!',
            'copyToClipboard' => 'In Zwischenablage kopieren',
            'undo' => 'Rückgängig',
            'redo' => 'Wiederholen',
            'editUndone' => 'Bearbeitung rückgängig',
            'editRedone' => 'Bearbeitung wiederhergestellt',
            'keyboardShortcuts' => 'Tastenkürzel',
            'close' => 'Schließen',
            'exporting' => 'Exportiert...',
            'exportReady' => 'Export bereit',
            'exportDownload' => 'Herunterladen',
            'emptyTitle' => 'Keine Daten',
            'emptyDescription' => 'Es gibt keine Datensätze. Versuchen Sie, Ihre Filter anzupassen oder neue Daten hinzuzufügen.',
        ],
        'pt' => [
            'totalResults' => '(count) => `${count} resultado${count !== 1 ? "s" : ""}`',
            'rowsPerPage' => 'Linhas por página',
            'pageOf' => '(current, last) => `Página ${current} / ${last}`',
            'columns' => 'Colunas',
            'reorder' => 'Reordenar',
            'done' => 'Concluído',
            'export' => 'Exportar',
            'exportFormat' => 'Formato de exportação',
            'filter' => 'Filtrar',
            'search' => 'Pesquisar...',
            'operators' => 'Operadores',
            'clearAllFilters' => 'Limpar todos os filtros',
            'noResults' => 'Sem resultados.',
            'pressEnterToFilter' => 'Prima Enter para filtrar',
            'yes' => 'Sim',
            'no' => 'Não',
            'selectAll' => 'Selecionar tudo',
            'selectRow' => 'Selecionar linha',
            'selected' => '(count) => `${count} selecionado${count !== 1 ? "s" : ""}`',
            'cancel' => 'Cancelar',
            'save' => 'Salvar',
            'noData' => 'Sem resultados.',
            'actions' => 'Ações',
            'loading' => 'Carregando...',
            'print' => 'Imprimir',
            'expand' => 'Expandir',
            'collapse' => 'Recolher',
            'density' => 'Densidade',
            'densityCompact' => 'Compacto',
            'densityComfortable' => 'Confortável',
            'densitySpacious' => 'Espaçoso',
            'copied' => 'Copiado!',
            'copyToClipboard' => 'Copiar para área de transferência',
            'undo' => 'Desfazer',
            'redo' => 'Refazer',
            'editUndone' => 'Edição desfeita',
            'editRedone' => 'Edição refeita',
            'keyboardShortcuts' => 'Atalhos de teclado',
            'close' => 'Fechar',
            'exporting' => 'Exportando...',
            'exportReady' => 'Exportação pronta',
            'exportDownload' => 'Baixar',
            'emptyTitle' => 'Sem dados',
            'emptyDescription' => 'Não há registros para exibir. Tente ajustar seus filtros ou adicionar novos dados.',
        ],
        'ar' => [
            'totalResults' => '(count) => `${count} نتيجة`',
            'rowsPerPage' => 'صفوف لكل صفحة',
            'pageOf' => '(current, last) => `صفحة ${current} / ${last}`',
            'columns' => 'أعمدة',
            'reorder' => 'إعادة ترتيب',
            'done' => 'تم',
            'export' => 'تصدير',
            'exportFormat' => 'صيغة التصدير',
            'filter' => 'تصفية',
            'search' => 'بحث...',
            'operators' => 'المعاملات',
            'clearAllFilters' => 'مسح كل المرشحات',
            'noResults' => 'لا توجد نتائج.',
            'pressEnterToFilter' => 'اضغط Enter للتصفية',
            'yes' => 'نعم',
            'no' => 'لا',
            'selectAll' => 'تحديد الكل',
            'selectRow' => 'تحديد الصف',
            'selected' => '(count) => `${count} محدد`',
            'cancel' => 'إلغاء',
            'save' => 'حفظ',
            'noData' => 'لا توجد نتائج.',
            'actions' => 'إجراءات',
            'loading' => 'جار التحميل...',
            'print' => 'طباعة',
            'expand' => 'توسيع',
            'collapse' => 'طي',
            'density' => 'الكثافة',
            'densityCompact' => 'مضغوط',
            'densityComfortable' => 'مريح',
            'densitySpacious' => 'واسع',
            'copied' => 'تم النسخ!',
            'copyToClipboard' => 'نسخ إلى الحافظة',
            'undo' => 'تراجع',
            'redo' => 'إعادة',
            'editUndone' => 'تم التراجع عن التعديل',
            'editRedone' => 'تمت إعادة التعديل',
            'keyboardShortcuts' => 'اختصارات لوحة المفاتيح',
            'close' => 'إغلاق',
            'exporting' => 'جار التصدير...',
            'exportReady' => 'التصدير جاهز',
            'exportDownload' => 'تحميل',
            'emptyTitle' => 'لا توجد بيانات',
            'emptyDescription' => 'لا توجد سجلات لعرضها. حاول تعديل المرشحات أو إضافة بيانات جديدة.',
        ],
        'zh' => [
            'totalResults' => '(count) => `${count} 条结果`',
            'rowsPerPage' => '每页行数',
            'pageOf' => '(current, last) => `第 ${current} / ${last} 页`',
            'columns' => '列',
            'reorder' => '重新排序',
            'done' => '完成',
            'export' => '导出',
            'exportFormat' => '导出格式',
            'filter' => '筛选',
            'search' => '搜索...',
            'operators' => '运算符',
            'clearAllFilters' => '清除所有筛选',
            'noResults' => '无结果。',
            'pressEnterToFilter' => '按回车键筛选',
            'yes' => '是',
            'no' => '否',
            'selectAll' => '全选',
            'selectRow' => '选择行',
            'selected' => '(count) => `已选择 ${count} 项`',
            'cancel' => '取消',
            'save' => '保存',
            'noData' => '无结果。',
            'actions' => '操作',
            'loading' => '加载中...',
            'print' => '打印',
            'expand' => '展开',
            'collapse' => '收起',
            'density' => '密度',
            'densityCompact' => '紧凑',
            'densityComfortable' => '舒适',
            'densitySpacious' => '宽松',
            'copied' => '已复制！',
            'copyToClipboard' => '复制到剪贴板',
            'undo' => '撤销',
            'redo' => '重做',
            'editUndone' => '编辑已撤销',
            'editRedone' => '编辑已重做',
            'keyboardShortcuts' => '键盘快捷键',
            'close' => '关闭',
            'exporting' => '导出中...',
            'exportReady' => '导出完成',
            'exportDownload' => '下载',
            'emptyTitle' => '暂无数据',
            'emptyDescription' => '没有可显示的记录。请尝试调整筛选条件或添加新数据。',
        ],
        'ja' => [
            'totalResults' => '(count) => `${count} 件`',
            'rowsPerPage' => '1ページあたりの行数',
            'pageOf' => '(current, last) => `${current} / ${last} ページ`',
            'columns' => '列',
            'reorder' => '並べ替え',
            'done' => '完了',
            'export' => 'エクスポート',
            'exportFormat' => 'エクスポート形式',
            'filter' => 'フィルター',
            'search' => '検索...',
            'operators' => '演算子',
            'clearAllFilters' => 'すべてのフィルターをクリア',
            'noResults' => '結果なし。',
            'pressEnterToFilter' => 'Enterキーでフィルター',
            'yes' => 'はい',
            'no' => 'いいえ',
            'selectAll' => 'すべて選択',
            'selectRow' => '行を選択',
            'selected' => '(count) => `${count} 件選択中`',
            'cancel' => 'キャンセル',
            'save' => '保存',
            'noData' => '結果なし。',
            'actions' => 'アクション',
            'loading' => '読み込み中...',
            'print' => '印刷',
            'expand' => '展開',
            'collapse' => '折りたたみ',
            'density' => '密度',
            'densityCompact' => 'コンパクト',
            'densityComfortable' => '標準',
            'densitySpacious' => 'ゆったり',
            'copied' => 'コピーしました！',
            'copyToClipboard' => 'クリップボードにコピー',
            'undo' => '元に戻す',
            'redo' => 'やり直す',
            'editUndone' => '編集を元に戻しました',
            'editRedone' => '編集をやり直しました',
            'keyboardShortcuts' => 'キーボードショートカット',
            'close' => '閉じる',
            'exporting' => 'エクスポート中...',
            'exportReady' => 'エクスポート完了',
            'exportDownload' => 'ダウンロード',
            'emptyTitle' => 'データなし',
            'emptyDescription' => '表示するレコードがありません。フィルターを調整するか、新しいデータを追加してください。',
        ],
    ];

    /** Translation keys that are function expressions */
    private array $functionKeys = ['totalResults', 'rowsPerPage', 'pageOf', 'selected', 'selectAllMatching', 'columnsCount', 'matches'];

    public function __construct(private Filesystem $files)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        if ($this->option('all')) {
            foreach (array_keys($this->translations) as $lang) {
                $this->generateForLanguage($lang);
            }
            return self::SUCCESS;
        }

        $lang = $this->option('lang');
        $this->generateForLanguage($lang);

        return self::SUCCESS;
    }

    private function generateForLanguage(string $lang): void
    {
        if (! isset($this->translations[$lang])) {
            $this->components->error("Language '{$lang}' is not supported. Available: " . implode(', ', array_keys($this->translations)));
            return;
        }

        $outputOption = $this->option('output');
        $output = $outputOption
            ? base_path($outputOption)
            : base_path("resources/js/data-table/i18n-{$lang}.ts");

        $translations = $this->translations[$lang];
        $content = $this->buildTypeScript($lang, $translations);

        $this->files->ensureDirectoryExists(dirname($output));
        $this->files->put($output, $content);

        $this->components->info("Translations generated: {$output}");
    }

    private function buildTypeScript(string $lang, array $translations): string
    {
        $lines = [
            "// Data table translations for: {$lang}",
            '// Generated by: php artisan data-table:translations --lang=' . $lang,
            '// You can customize these translations and import them in your DataTable component.',
            '',
            'import type { DataTableTranslations } from "machour/laravel-data-table";',
            '',
            "export const {$lang}Translations: Partial<DataTableTranslations> = {",
        ];

        foreach ($translations as $key => $value) {
            if (in_array($key, $this->functionKeys, true)) {
                // Function expressions are already raw JS
                $lines[] = "    {$key}: {$value},";
            } else {
                // String values — escape for JS
                $escaped = str_replace(["\\", "'"], ["\\\\", "\\'"], $value);
                $lines[] = "    {$key}: '{$escaped}',";
            }
        }

        $lines[] = '};';
        $lines[] = '';

        return implode("\n", $lines);
    }
}

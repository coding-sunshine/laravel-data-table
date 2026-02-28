export interface DataTableTranslations {
    // Pagination
    totalResults: (count: number) => string;
    rowsPerPage: string;
    pageOf: (current: number, last: number) => string;

    // Columns
    columns: string;
    reorder: string;
    done: string;

    // Export
    export: string;
    exportFormat: string;

    // Filters
    filter: string;
    search: string;
    operators: string;
    clearAllFilters: string;
    noResults: string;
    pressEnterToFilter: string;

    // Filter operators
    opContains: string;
    opExact: string;
    opEquals: string;
    opNotEquals: string;
    opGreaterThan: string;
    opGreaterOrEqual: string;
    opLessThan: string;
    opLessOrEqual: string;
    opBetween: string;
    opIs: string;
    opIsNot: string;
    opOnDate: string;
    opBefore: string;
    opAfter: string;

    // Boolean
    yes: string;
    no: string;

    // Bulk actions
    selected: (count: number) => string;

    // Select all
    selectAll: string;
    selectRow: string;

    // Quick views
    view: string;
    quickViews: string;
    savedViews: string;
    saveFilters: string;
    manageViews: string;
    viewName: string;
    viewNamePlaceholder: string;
    filtersWillBeSavedLocally: string;
    filtersLabel: string;
    none: string;
    sortLabel: string;
    columnsCount: (visible: number, total: number) => string;
    cancel: string;
    save: string;

    // Number format
    min: string;
    max: string;
    value: string;

    // Empty state
    noData: string;

    // Row actions
    actions: string;

    // Confirmation dialog
    confirmTitle: string;
    confirmDescription: string;
    confirmAction: string;
    confirmCancel: string;

    // Server-side selection
    selectAllMatching: (count: number) => string;
    clearSelection: string;

    // Inline editing
    editSave: string;
    editCancel: string;
    editSaving: string;

    // Loading
    loading: string;

    // Print
    print: string;

    // Detail row
    expand: string;
    collapse: string;

    // Soft deletes
    showTrashed: string;
    hideTrashed: string;

    // Summary
    summarySum: string;
    summaryAvg: string;
    summaryMin: string;
    summaryMax: string;
    summaryCount: string;

    // Polling
    autoRefresh: string;

    // Toggle
    toggleOn: string;
    toggleOff: string;

    // Density
    density: string;
    densityCompact: string;
    densityComfortable: string;
    densitySpacious: string;

    // Copy
    copied: string;
    copyToClipboard: string;

    // Context menu
    sortAscending: string;
    sortDescending: string;
    hideColumn: string;
    pinLeft: string;
    pinRight: string;
    unpin: string;

    // Row grouping
    groupBy: string;
    ungrouped: string;

    // Row reorder
    reorderRows: string;

    // Batch edit
    batchEdit: string;
    batchEditApply: string;
    batchEditColumn: string;
    batchEditValue: string;

    // Search highlight
    matches: (count: number) => string;

    // Import
    importData: string;
    importFile: string;
    importUploading: string;
    importSuccess: string;
    importError: string;
}

export const defaultTranslations: DataTableTranslations = {
    // Pagination
    totalResults: (count) => `${count} result${count !== 1 ? "s" : ""}`,
    rowsPerPage: "Rows per page",
    pageOf: (current, last) => `Page ${current} / ${last}`,

    // Columns
    columns: "Columns",
    reorder: "Reorder",
    done: "Done",

    // Export
    export: "Export",
    exportFormat: "Export format",

    // Filters
    filter: "Filter",
    search: "Search...",
    operators: "Operators",
    clearAllFilters: "Clear all filters",
    noResults: "No results.",
    pressEnterToFilter: "Press Enter to filter",

    // Filter operators
    opContains: "contains",
    opExact: "is exactly",
    opEquals: "=",
    opNotEquals: "≠",
    opGreaterThan: ">",
    opGreaterOrEqual: "≥",
    opLessThan: "<",
    opLessOrEqual: "≤",
    opBetween: "between",
    opIs: "is",
    opIsNot: "is not",
    opOnDate: "on",
    opBefore: "before",
    opAfter: "after",

    // Boolean
    yes: "Yes",
    no: "No",

    // Bulk actions
    selected: (count) => `${count} selected`,

    // Select all
    selectAll: "Select all",
    selectRow: "Select row",

    // Quick views
    view: "View",
    quickViews: "Quick views",
    savedViews: "Saved views",
    saveFilters: "Save filters",
    manageViews: "Manage views",
    viewName: "View name",
    viewNamePlaceholder: "e.g. Recent items without photos",
    filtersWillBeSavedLocally: "Active filters will be saved locally.",
    filtersLabel: "Filters:",
    none: "None",
    sortLabel: "Sort:",
    columnsCount: (visible, total) => `${visible}/${total} visible`,
    cancel: "Cancel",
    save: "Save",

    // Number format
    min: "Min",
    max: "Max",
    value: "Value",

    // Empty state
    noData: "No results.",

    // Row actions
    actions: "Actions",

    // Confirmation dialog
    confirmTitle: "Are you sure?",
    confirmDescription: "This action cannot be undone.",
    confirmAction: "Confirm",
    confirmCancel: "Cancel",

    // Server-side selection
    selectAllMatching: (count) => `Select all ${count} matching items`,
    clearSelection: "Clear selection",

    // Inline editing
    editSave: "Save",
    editCancel: "Cancel",
    editSaving: "Saving...",

    // Loading
    loading: "Loading...",

    // Print
    print: "Print",

    // Detail row
    expand: "Expand",
    collapse: "Collapse",

    // Soft deletes
    showTrashed: "Show deleted",
    hideTrashed: "Hide deleted",

    // Summary
    summarySum: "Sum",
    summaryAvg: "Average",
    summaryMin: "Min",
    summaryMax: "Max",
    summaryCount: "Count",

    // Polling
    autoRefresh: "Auto-refresh",

    // Toggle
    toggleOn: "On",
    toggleOff: "Off",

    // Density
    density: "Density",
    densityCompact: "Compact",
    densityComfortable: "Comfortable",
    densitySpacious: "Spacious",

    // Copy
    copied: "Copied!",
    copyToClipboard: "Copy to clipboard",

    // Context menu
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    hideColumn: "Hide column",
    pinLeft: "Pin to left",
    pinRight: "Pin to right",
    unpin: "Unpin",

    // Row grouping
    groupBy: "Group",
    ungrouped: "Ungrouped",

    // Row reorder
    reorderRows: "Reorder rows",

    // Batch edit
    batchEdit: "Batch edit",
    batchEditApply: "Apply to selected",
    batchEditColumn: "Column",
    batchEditValue: "Value",

    // Search highlight
    matches: (count) => `${count} match${count !== 1 ? "es" : ""}`,

    // Import
    importData: "Import",
    importFile: "Select file",
    importUploading: "Uploading...",
    importSuccess: "Import successful",
    importError: "Import failed",
};

export const frTranslations: DataTableTranslations = {
    totalResults: (count) => `${count} résultat${count !== 1 ? "s" : ""}`,
    rowsPerPage: "Lignes par page",
    pageOf: (current, last) => `Page ${current} / ${last}`,
    columns: "Colonnes",
    reorder: "Réordonner",
    done: "Terminé",
    export: "Exporter",
    exportFormat: "Format d'export",
    filter: "Filtrer",
    search: "Rechercher...",
    operators: "Opérateurs",
    clearAllFilters: "Effacer tous les filtres",
    noResults: "Aucun résultat.",
    pressEnterToFilter: "Appuyez sur Entrée pour filtrer",
    opContains: "contient",
    opExact: "est exactement",
    opEquals: "=",
    opNotEquals: "≠",
    opGreaterThan: ">",
    opGreaterOrEqual: "≥",
    opLessThan: "<",
    opLessOrEqual: "≤",
    opBetween: "entre",
    opIs: "est",
    opIsNot: "n'est pas",
    opOnDate: "est le",
    opBefore: "avant le",
    opAfter: "après le",
    yes: "Oui",
    no: "Non",
    selected: (count) => `${count} sélectionné${count > 1 ? "s" : ""}`,
    selectAll: "Tout sélectionner",
    selectRow: "Sélectionner la ligne",
    quickViews: "Vues rapides",
    savedViews: "Vues sauvegardées",
    saveFilters: "Sauvegarder les filtres",
    manageViews: "Gérer les vues",
    viewName: "Nom de la vue",
    viewNamePlaceholder: "Ex: Occasions récentes sans photo",
    filtersWillBeSavedLocally: "Les filtres actifs seront sauvegardés localement.",
    filtersLabel: "Filtres :",
    none: "Aucun",
    sortLabel: "Tri :",
    columnsCount: (visible, total) => `${visible}/${total} visibles`,
    cancel: "Annuler",
    save: "Sauvegarder",
    view: "Vue",
    min: "Min",
    max: "Max",
    value: "Valeur",
    noData: "Aucun résultat.",
    actions: "Actions",
    confirmTitle: "Êtes-vous sûr ?",
    confirmDescription: "Cette action est irréversible.",
    confirmAction: "Confirmer",
    confirmCancel: "Annuler",

    selectAllMatching: (count) => `Sélectionner les ${count} éléments correspondants`,
    clearSelection: "Effacer la sélection",

    editSave: "Enregistrer",
    editCancel: "Annuler",
    editSaving: "Enregistrement...",

    loading: "Chargement...",

    print: "Imprimer",

    // Detail row
    expand: "Développer",
    collapse: "Réduire",

    // Soft deletes
    showTrashed: "Afficher les supprimés",
    hideTrashed: "Masquer les supprimés",

    // Summary
    summarySum: "Somme",
    summaryAvg: "Moyenne",
    summaryMin: "Min",
    summaryMax: "Max",
    summaryCount: "Nombre",

    // Polling
    autoRefresh: "Rafraîchissement auto",

    // Toggle
    toggleOn: "Activé",
    toggleOff: "Désactivé",

    // Density
    density: "Densité",
    densityCompact: "Compact",
    densityComfortable: "Confortable",
    densitySpacious: "Spacieux",

    // Copy
    copied: "Copié !",
    copyToClipboard: "Copier dans le presse-papier",

    // Context menu
    sortAscending: "Tri croissant",
    sortDescending: "Tri décroissant",
    hideColumn: "Masquer la colonne",
    pinLeft: "Épingler à gauche",
    pinRight: "Épingler à droite",
    unpin: "Désépingler",

    // Row grouping
    groupBy: "Grouper",
    ungrouped: "Non groupé",

    // Row reorder
    reorderRows: "Réordonner les lignes",

    // Batch edit
    batchEdit: "Édition en lot",
    batchEditApply: "Appliquer à la sélection",
    batchEditColumn: "Colonne",
    batchEditValue: "Valeur",

    // Search highlight
    matches: (count) => `${count} résultat${count !== 1 ? "s" : ""}`,

    // Import
    importData: "Importer",
    importFile: "Sélectionner un fichier",
    importUploading: "Envoi en cours...",
    importSuccess: "Import réussi",
    importError: "Échec de l'import",
};

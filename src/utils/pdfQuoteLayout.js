const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const SELECT_VALUE_LABELS = {
  1: "L/S",
  2: "W/M",
};

export const getSelectDisplayText = (select) => {
  if (!select || select.tagName !== "SELECT") return "";

  const storedText = (select.getAttribute("data-pdf-selected-text") ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (storedText && storedText !== "Select") {
    return storedText;
  }

  const selectedOption =
    select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
  const selectedText = (selectedOption?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (selectedText && selectedText !== "Select") {
    return selectedText;
  }

  const value = String(select.value ?? "").trim();
  if (!value || value === "Select") return "";

  const matchedOption = [...select.options].find(
    (option) => String(option.value ?? "").trim() === value,
  );

  if (matchedOption) {
    const optionText = matchedOption.textContent.replace(/\s+/g, " ").trim();
    if (optionText && optionText !== "Select") {
      return optionText;
    }
  }

  return SELECT_VALUE_LABELS[value] ?? value;
};

export const isEmptyPdfCellText = (text) => {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  if (normalized === "Select") return true;
  if (/^(L\/S|W\/M|RAND|USD|INR|EURO|ZAR)$/i.test(normalized)) return false;
  if (/vat|%|standard rate|zero rate|customs|manual|no vat/i.test(normalized)) {
    return false;
  }
  if (/^0+(\.0+)?$/.test(normalized)) return true;
  const num = Number(normalized.replace(/,/g, ""));
  if (!Number.isNaN(num) && num === 0) return true;
  return false;
};

const formatDisplayNumber = (text) => {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized || isEmptyPdfCellText(normalized)) return "";
  const num = Number(normalized.replace(/,/g, ""));
  if (!Number.isNaN(num) && /^\d/.test(normalized)) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return normalized;
};

export const formatCellDisplayValue = (text, headerLabel) => {
  if (isEmptyPdfCellText(text)) return "";
  const label = (headerLabel ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  if (label === "description") {
    return String(text ?? "").replace(/\s+/g, " ").trim();
  }
  if (["curr", "uom", "unit", "vat type"].includes(label)) {
    return String(text ?? "").replace(/\s+/g, " ").trim();
  }
  return formatDisplayNumber(text);
};

const getSelectDisplayValue = (select) => getSelectDisplayText(select);

const getCellPlainText = (cell) => {
  if (!cell) return "";

  const replacement = cell.querySelector("[data-pdf-text-replacement]");
  if (replacement) {
    const replacementText = replacement.textContent.replace(/\s+/g, " ").trim();
    if (replacementText) return replacementText;
  }

  const selectValue = getSelectDisplayValue(cell.querySelector("select"));
  if (selectValue) return selectValue;

  const input = cell.querySelector("input, textarea");
  if (input) {
    return (input.value ?? "").replace(/\s+/g, " ").trim();
  }

  cell
    .querySelectorAll("[data-pdf-input-hidden], input, select, textarea, option")
    .forEach((el) => {
      el.remove();
    });

  const rawText = cell.innerText ?? cell.textContent;
  return rawText.replace(/\s+/g, " ").trim();
};

const isGrandTotalRow = (row) => /Total\s*-\s*Charge/i.test(row.textContent ?? "");
const isSectionTotalRow = (row) =>
  /Total\s*-/i.test(row.textContent ?? "") && !isGrandTotalRow(row);

const normalizeHeaderLabel = (label) => {
  const text = (label ?? "").replace(/\s+/g, " ").trim();
  if (!text || text === "Select" || /^currency$/i.test(text)) return "Curr";
  if (/^unit type$/i.test(text)) return "UOM";
  if (/^roe$/i.test(text)) return "Exch Rate";
  if (/^vat type$/i.test(text)) return "VAT Type";
  if (/^disc %$/i.test(text)) return "Disc %";
  if (/^discount$/i.test(text)) return "Discount";
  if (/^exclusive$/i.test(text)) return "Exclusive";
  if (/^vat incl$/i.test(text)) return "VAT Incl";
  if (/^t\/ cost$/i.test(text)) return "T/ Cost";
  if (/^final amount$/i.test(text)) return "Final Amount";
  return text;
};

const PRIMARY_AMOUNT_LABELS = new Set([
  "cost",
  "t/ cost",
  "final amount",
  "exclusive",
  "vat incl",
  "discount",
  "vat",
]);

const CATEGORY_COLUMN_LABELS = new Set([
  "curr",
  "uom",
  "unit",
  "vat type",
]);

export const normalizeColumnLabel = (label) =>
  (label ?? "").replace(/\s+/g, " ").trim().toLowerCase();

export const rowHasValues = (values, headers) =>
  values.some((value, index) => {
    const label = normalizeColumnLabel(headers[index]);
    if (!PRIMARY_AMOUNT_LABELS.has(label)) return false;
    return !isEmptyPdfCellText(value);
  });

const normalizeRowValues = (values, columnCount) => {
  const normalized = Array(columnCount).fill("");
  values.forEach((value, index) => {
    if (index < columnCount) normalized[index] = value ?? "";
  });
  return normalized;
};

const parseDataRow = (row, columnCount) =>
  normalizeRowValues(
    [...row.querySelectorAll("td")].map((cell) => getCellPlainText(cell)),
    columnCount,
  );

const parseTotalRowByIndex = (row, columnCount) => {
  const values = Array(columnCount).fill("");
  let col = 0;

  [...row.querySelectorAll("td")].forEach((cell) => {
    const span = Number(cell.colSpan) || 1;
    const text = getCellPlainText(cell);

    if (/Total\s*-/i.test(text)) {
      values[0] = text;
    } else if (col < columnCount) {
      const normalized = text.replace(/\s+/g, " ").trim();
      if (normalized && normalized !== "Select") {
        values[col] = text;
      }
    }

    col += span;
  });

  return values;
};

export const getColumnAlign = (headerLabel) => {
  const label = (headerLabel ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  if (label === "description") return "left";
  if (["curr", "uom", "unit", "vat type"].includes(label)) return "center";
  return "right";
};

export const getVisibleColumns = (headers, sections, grandTotal) => {
  const allDataRows = sections.flatMap((section) => section.rows);
  const allTotals = [
    ...sections.map((section) => section.total).filter(Boolean),
    grandTotal,
  ].filter(Boolean);

  return headers
    .map((_, index) => index)
    .filter((index) => {
      if (index === 0) return true;

      const label = normalizeColumnLabel(headers[index]);
      const hasValueInRows = allDataRows.some(
        (row) => !isEmptyPdfCellText(row[index]),
      );
      const hasValueInTotals = allTotals.some(
        (total) => !isEmptyPdfCellText(total?.[index]),
      );

      if (CATEGORY_COLUMN_LABELS.has(label)) {
        return hasValueInRows || hasValueInTotals;
      }

      return hasValueInRows || hasValueInTotals;
    });
};

export const buildColumnWidths = (visibleCount, visibleColumns, headers) => {
  if (visibleCount <= 0) return [];
  if (visibleCount === 1) return [100];

  const weightForColumn = (headerIndex) => {
    const label = normalizeColumnLabel(headers[headerIndex]);
    if (label === "description") return 4;
    if (label === "vat type") return 2.2;
    if (["curr", "uom", "unit", "qty"].includes(label)) return 1;
    return 1.3;
  };

  const weights = visibleColumns.map(weightForColumn);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const widths = weights.map((weight) => (weight / totalWeight) * 100);
  const sum = widths.reduce((total, width) => total + width, 0);
  widths[widths.length - 1] += 100 - sum;

  return widths;
};

export const formatSectionTotalLabel = (section) =>
  (section.total?.[0] || `TOTAL ${section.title}`)
    .replace(/Total\s*-\s*/i, "TOTAL ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

export const formatGrandTotalLabel = (grandTotal) =>
  (grandTotal?.[0] || "TOTAL CHARGE")
    .replace(/Total\s*-\s*/i, "TOTAL ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();


const PDF_QUOTE_STYLE = `
[data-pdf-capture-host] .cost-table {
  display: none !important;
}
[data-pdf-capture-host] .pdf-quote-wrap {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  color: #000;
}
[data-pdf-capture-host] .pdf-quote-table {
  width: 100% !important;
  border-collapse: collapse !important;
  table-layout: fixed !important;
  border: 1px solid #000 !important;
  background: #fff !important;
}
[data-pdf-capture-host] .pdf-quote-table th,
[data-pdf-capture-host] .pdf-quote-table td {
  padding: 6px 8px;
  vertical-align: middle;
  box-sizing: border-box;
  background: #fff !important;
  background-color: #fff !important;
  color: #000 !important;
  overflow: hidden;
  word-wrap: break-word;
}
[data-pdf-capture-host] .pdf-quote-table .pdf-col-head,
[data-pdf-capture-host] .pdf-quote-table .pdf-head-row td {
  background: #fff !important;
  background-color: #fff !important;
  color: #000 !important;
  font-weight: 400 !important;
  font-size: 11px;
  text-transform: uppercase;
  text-align: center;
  padding: 6px 8px !important;
}
[data-pdf-capture-host] .pdf-quote-table .pdf-body-cell {
  border-top: 0 !important;
  border-bottom: 0 !important;
}
[data-pdf-capture-host] .pdf-quote-table .pdf-span-title {
  text-align: center !important;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
  padding: 8px;
}
[data-pdf-capture-host] .pdf-quote-table .pdf-total-row td,
[data-pdf-capture-host] .pdf-quote-table .pdf-grand-total-row td {
  font-weight: 700;
}
[data-pdf-capture-host] .pdf-quote-table .pdf-total-row td:not(:first-child):not(:last-child),
[data-pdf-capture-host] .pdf-quote-table .pdf-grand-total-row td:not(:first-child):not(:last-child) {
  border-left: 0 !important;
  border-right: 0 !important;
}
`;

const GRID_BORDER = "1px solid #000";

const getVerticalBorderStyle = (visibleIndex) => {
  const parts = ["border-right:1px solid #000"];
  if (visibleIndex === 0) parts.push("border-left:1px solid #000");
  return parts.join(";");
};

const getTotalRowBorderStyle = (visibleIndex, visibleCount) => {
  const parts = [
    "border-top:1px solid #000",
    "border-bottom:1px solid #000",
    "border-left:0",
    "border-right:0",
  ];
  if (visibleIndex === 0) parts[2] = "border-left:1px solid #000";
  if (visibleIndex === visibleCount - 1) parts[3] = "border-right:1px solid #000";
  return parts.join(";");
};

const buildColgroup = (columnWidths) =>
  `<colgroup>${columnWidths
    .map((width) => `<col style="width:${width}%;" />`)
    .join("")}</colgroup>`;

const gridCellStyle = (
  headerLabel,
  visibleIndex,
  visibleCount,
  columnWidths,
  cellType,
  bold = false,
) => {
  const label = (headerLabel ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  let align = getColumnAlign(headerLabel);
  if (cellType === "section-title") align = "center";

  let borderStyle = "";
  if (cellType === "section-title") {
    borderStyle = `border:${GRID_BORDER}`;
  } else if (cellType === "head") {
    borderStyle = [
      "border-top:0",
      "border-bottom:1px solid #000",
      getVerticalBorderStyle(visibleIndex),
    ].join(";");
  } else if (cellType === "body") {
    borderStyle = [
      "border-top:0",
      "border-bottom:0",
      getVerticalBorderStyle(visibleIndex),
    ].join(";");
  } else if (cellType === "total") {
    borderStyle = getTotalRowBorderStyle(visibleIndex, visibleCount);
  }

  const textColor = "#000";

  return [
    `width:${columnWidths[visibleIndex]}%`,
    `text-align:${align}`,
    borderStyle,
    "padding:6px 8px",
    "vertical-align:middle",
    "overflow:hidden",
    "box-sizing:border-box",
    "background:#fff",
    `color:${textColor}`,
    "line-height:1.35",
    bold || cellType === "section-title" || cellType === "total"
      ? "font-weight:700"
      : "font-weight:400",
    cellType === "section-title" ? "text-transform:uppercase;font-size:12px" : "",
    cellType === "head" ? "text-transform:uppercase;font-size:11px;font-weight:400" : "",
    label === "description" && cellType === "body" ? "text-align:left" : "",
  ]
    .filter(Boolean)
    .join(";");
};

const renderColumnCells = (
  values,
  visibleColumns,
  headers,
  type,
  columnWidths,
) => {
  const isHead = type === "head";
  const tag = "td";
  const bold = type === "total";
  const cellType = isHead ? "head" : type === "total" ? "total" : "body";

  return visibleColumns
    .map((headerIndex, visibleIndex) => {
      const headerLabel = headers[headerIndex] ?? "";
      const rawText = isHead ? headerLabel : values[headerIndex] ?? "";
      const text = isHead
        ? headerLabel
        : formatCellDisplayValue(rawText, headerLabel);
      const hasContent = Boolean(text);
      const cellClass =
        cellType === "head"
          ? "pdf-col-head"
          : cellType === "total"
            ? "pdf-total-cell"
            : "pdf-body-cell";
      const cellContent = hasContent ? escapeHtml(text) : "";

      return `<${tag} class="${cellClass}" style="${gridCellStyle(headerLabel, visibleIndex, visibleColumns.length, columnWidths, cellType, bold)}">${cellContent}</${tag}>`;
    })
    .join("");
};

const renderSectionTitleRow = (title, colSpan) =>
  `<tr class="pdf-section-title"><td class="pdf-span-title" colspan="${colSpan}" style="${gridCellStyle("", 0, 1, [100], "section-title", true)}">${escapeHtml(title.toUpperCase())}</td></tr>`;

const buildSectionRows = ({
  headers,
  section,
  visibleColumns,
  columnWidths,
}) => {
  const colSpan = visibleColumns.length;
  const dataRows = section.rows.filter((row) => rowHasValues(row, headers));
  const showTotal = section.total && rowHasValues(section.total, headers);
  if (!dataRows.length && !showTotal) return [];

  const rows = [
    renderSectionTitleRow(section.title, colSpan),
    `<tr class="pdf-head-row">${renderColumnCells([], visibleColumns, headers, "head", columnWidths)}</tr>`,
  ];

  dataRows.forEach((row) => {
    rows.push(
      `<tr class="pdf-data-row">${renderColumnCells(row, visibleColumns, headers, "body", columnWidths)}</tr>`,
    );
  });

  if (showTotal) {
    const totalValues = [...section.total];
    totalValues[0] = formatSectionTotalLabel(section);
    rows.push(
      `<tr class="pdf-total-row">${renderColumnCells(totalValues, visibleColumns, headers, "total", columnWidths)}</tr>`,
    );
  }

  return rows;
};

const renderDummyWidthRow = (visibleColumns, columnWidths) => {
  const cells = visibleColumns.map((_, visibleIndex) => {
    const width = columnWidths[visibleIndex];
    return `<td style="width:${width}%; height:0; padding:0; border:0; line-height:0;"></td>`;
  }).join("");
  return `<tr style="height:0; line-height:0; visibility:hidden; border:0;">${cells}</tr>`;
};

const buildUnifiedQuoteTableHtml = ({
  headers,
  sections,
  grandTotal,
  visibleColumns,
  columnWidths,
}) => {
  const allRows = [];

  sections.forEach((section) => {
    allRows.push(
      ...buildSectionRows({
        headers,
        section,
        visibleColumns,
        columnWidths,
      }),
    );
  });

  if (grandTotal && rowHasValues(grandTotal, headers)) {
    const colSpan = visibleColumns.length;
    const totalValues = [...grandTotal];
    totalValues[0] = formatGrandTotalLabel(grandTotal);

    allRows.push(renderSectionTitleRow("QUOTE TOTAL ESTIMATION", colSpan));
    allRows.push(
      `<tr class="pdf-grand-total-row">${renderColumnCells(totalValues, visibleColumns, headers, "total", columnWidths)}</tr>`,
    );
  }

  if (!allRows.length) return "";

  // Prepend the dummy row to establish fixed column widths
  allRows.unshift(renderDummyWidthRow(visibleColumns, columnWidths));

  return `
    <table class="pdf-quote-table" width="100%" border="0" cellpadding="0" cellspacing="0">
      ${buildColgroup(columnWidths)}
      <tbody>
        ${allRows.join("")}
      </tbody>
    </table>`;
};

const buildQuoteHtml = ({ headers, sections, grandTotal }) => {
  const sectionsWithValues = sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => rowHasValues(row, headers)),
    }))
    .filter(
      (section) =>
        section.rows.length > 0 ||
        (section.total && rowHasValues(section.total, headers)),
    );

  if (!sectionsWithValues.length) {
    return `<div class="pdf-quote-wrap"><p>No charge rows with values to display.</p></div>`;
  }

  const visibleColumns = getVisibleColumns(
    headers,
    sectionsWithValues,
    grandTotal,
  );
  const columnWidths = buildColumnWidths(
    visibleColumns.length,
    visibleColumns,
    headers,
  );

  return `
    <style>${PDF_QUOTE_STYLE}</style>
    <div class="pdf-quote-wrap">
      ${buildUnifiedQuoteTableHtml({
        headers,
        sections: sectionsWithValues,
        grandTotal,
        visibleColumns,
        columnWidths,
      })}
    </div>`;
};

const parseQuoteTable = (table) => {
  const headers = [...table.querySelectorAll("thead th")].map((cell) =>
    normalizeHeaderLabel(getCellPlainText(cell)),
  );

  const sections = [];
  let current = null;
  let grandTotal = null;

  table.querySelectorAll("tbody tr").forEach((row) => {
    if (row.classList.contains("estimate-section-row")) {
      if (current) sections.push(current);
      current = {
        title: row.textContent.replace(/\s+/g, " ").trim(),
        rows: [],
        total: null,
      };
      return;
    }

    if (isGrandTotalRow(row)) {
      grandTotal = parseTotalRowByIndex(row, headers.length);
      return;
    }

    if (isSectionTotalRow(row)) {
      if (current) current.total = parseTotalRowByIndex(row, headers.length);
      return;
    }

    if (!current) return;

    const values = parseDataRow(row, headers.length);
    if (rowHasValues(values, headers)) {
      current.rows.push(values);
    }
  });

  if (current) sections.push(current);

  return {
    headers,
    sections: sections.filter((section) => section.rows.length > 0),
    grandTotal,
  };
};

export const extractQuoteDataFromRoot = (root) => {
  const table = root?.querySelector("table.cost-table, .cost-table");
  if (!table) return null;
  return parseQuoteTable(table);
};

export const renderPdfQuoteLayout = (root, quoteData = null) => {
  const tableWrap = root?.querySelector(".table-responsive");
  const data = quoteData ?? extractQuoteDataFromRoot(root);

  if (!tableWrap || !data) return false;

  tableWrap.innerHTML = buildQuoteHtml(data);
  tableWrap.style.overflow = "visible";
  tableWrap.style.width = "100%";
  tableWrap.style.maxWidth = "100%";
  tableWrap.style.margin = "0";
  tableWrap.style.padding = "0";

  root?.querySelectorAll("table.cost-table, .cost-table").forEach((el) => {
    el.style.display = "none";
  });

  return true;
};

export const injectPdfGlobalStyles = (root) => {
  const host = root.closest("[data-pdf-capture-host]") ?? root.parentElement;
  if (!host) return;

  if (!host.querySelector("[data-pdf-global-style]")) {
    const style = document.createElement("style");
    style.setAttribute("data-pdf-global-style", "true");
    style.textContent = `
      ${PDF_QUOTE_STYLE}
      [data-pdf-capture-host] th {
        background-color: #fff !important;
        background: #fff !important;
        color: #000 !important;
        padding: 6px 8px !important;
      }
      [data-pdf-capture-host] .wpWrapper thead,
      [data-pdf-capture-host] thead {
        background: #fff !important;
        color: #000 !important;
      }
      [data-pdf-capture-host] .wpWrapper thead th,
      [data-pdf-capture-host] thead th {
        background-color: #fff !important;
        background: #fff !important;
        color: #000 !important;
      }
      [data-pdf-capture-host] .cost-table,
      [data-pdf-capture-host] table.cost-table {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      [data-pdf-capture-host] .pdf-page {
        outline: none !important;
      }
      [data-pdf-capture-host] .table-responsive {
        border: none !important;
        overflow: visible !important;
      }
    `;
    host.prepend(style);
  }
};

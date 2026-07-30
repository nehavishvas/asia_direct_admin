import html2pdf from "html2pdf.js";
import {
  extractQuoteDataFromRoot,
  getSelectDisplayText,
  injectPdfGlobalStyles,
  renderPdfQuoteLayout,
} from "./pdfQuoteLayout";

export const PDF_PAGE_WIDTH = 1600;

// Matches header cells whose text is exactly "Vat %" (case-insensitive).
const VAT_PERCENT_HEADER_RE = /^vat\s*%$/i;

// Finds the column index(es) of any "Vat %" header in the table(s) inside root.
const getVatPercentColumnIndexes = (root) => {
  const indexes = new Set();

  root?.querySelectorAll("table thead tr").forEach((headerRow) => {
    [...headerRow.querySelectorAll("th")].forEach((th, idx) => {
      const text = (th.textContent ?? "").replace(/\s+/g, " ").trim();
      if (VAT_PERCENT_HEADER_RE.test(text)) {
        indexes.add(idx);
      }
    });
  });

  return indexes;
};

// Reduces a VAT label like "Standard Rate (15.00 %)" or "Customs VAT(100.00%)"
// down to just "15.00 %". Labels with no numeric percentage (e.g. "Manual VAT",
// "No Vat") are left untouched since there is no value to extract.
const extractVatPercentOnly = (text) => {
  if (text === null || text === undefined) return text;
  const str = String(text);
  const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) {
    return `${parseFloat(match[1]).toFixed(2)} %`;
  }
  return str;
};

const getFormControlDisplayValue = (el, isVatPercentColumn = false) => {
  if (el.tagName === "SELECT") {
    const text = getSelectDisplayText(el);
    return isVatPercentColumn ? extractVatPercentOnly(text) : text;
  }

  if (el.type === "checkbox" || el.type === "radio") {
    return el.checked ? "Yes" : "";
  }

  return (el.value ?? "").trim();
};

export const isEmptyPdfCellText = (text) => {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  if (normalized === "Select") return true;
  if (/^(L\/S|W\/M|RAND|USD|INR|EURO)$/i.test(normalized)) return false;
  if (/vat|%|standard rate|zero rate|customs|manual|no vat/i.test(normalized)) {
    return false;
  }
  if (/^0+(\.0+)?$/.test(normalized)) return true;

  const num = Number(normalized.replace(/,/g, ""));
  if (!Number.isNaN(num) && num === 0) return true;

  return false;
};

export const getCellPlainText = (cell) => {
  if (!cell) return "";

  const replacement = cell.querySelector("[data-pdf-text-replacement]");
  const replacementText = replacement?.textContent?.replace(/\s+/g, " ").trim();
  if (replacementText) return replacementText;

  const selectValue = getSelectDisplayText(cell.querySelector("select"));
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

export const replaceFormControlsWithText = (root) => {
  if (!root) return () => { };

  const vatPercentColumnIndexes = getVatPercentColumnIndexes(root);
  const replacements = [];

  root.querySelectorAll("input, textarea, select").forEach((el) => {
    const cell = el.closest("td");
    const isVatPercentColumn = !!cell && vatPercentColumnIndexes.has(cell.cellIndex);
    const displayValue = getFormControlDisplayValue(el, isVatPercentColumn);
    const span = document.createElement("span");
    span.textContent = displayValue;
    span.setAttribute("data-pdf-text-replacement", "true");
    span.style.display = "inline-block";
    span.style.fontSize = window.getComputedStyle(el).fontSize || "13px";
    span.style.color = "#000";

    const savedDisplay = el.style.display;
    el.style.display = "none";
    el.setAttribute("data-pdf-input-hidden", "true");

    if (el.parentNode) {
      el.parentNode.insertBefore(span, el.nextSibling);
    }

    replacements.push({ el, span, savedDisplay });
  });

  return () => {
    replacements.forEach(({ el, span, savedDisplay }) => {
      el.style.display = savedDisplay;
      el.removeAttribute("data-pdf-input-hidden");
      span.remove();
    });
  };
};

const isTotalRow = (row) => /Total\s*-/i.test(row.textContent ?? "");

const rowHasNonZeroValue = (row, financialStartIndex = 1) => {
  const cells = row.querySelectorAll("td");

  for (let i = financialStartIndex; i < cells.length; i += 1) {
    const text = getCellPlainText(cells[i]);
    if (!isEmptyPdfCellText(text)) {
      return true;
    }
  }

  return false;
};

const totalRowHasNonZeroValue = (row) => {
  const cells = row.querySelectorAll("td");

  for (const cell of cells) {
    const text = getCellPlainText(cell);
    if (/Total\s*-/i.test(text)) continue;
    if (!isEmptyPdfCellText(text)) {
      return true;
    }
  }

  return false;
};

export const hideZeroPdfRows = (table) => {
  if (!table) return () => { };

  const hiddenRows = [];

  table.querySelectorAll("tbody tr").forEach((row) => {
    if (row.classList.contains("estimate-section-row")) return;

    const cells = row.querySelectorAll("td");
    if (!cells.length) return;

    const shouldHide = isTotalRow(row)
      ? !totalRowHasNonZeroValue(row)
      : !rowHasNonZeroValue(row, 1);

    if (shouldHide) {
      hiddenRows.push({ row, display: row.style.display });
      row.style.display = "none";
    }
  });

  return () => {
    hiddenRows.forEach(({ row, display }) => {
      row.style.display = display;
    });
  };
};

export const hideZeroPdfColumns = (table) => {
  if (!table) return () => { };

  const headerCells = [...table.querySelectorAll("thead tr th")];
  if (!headerCells.length) return () => { };

  const dataRows = [...table.querySelectorAll("tbody tr")].filter(
    (row) =>
      row.style.display !== "none" &&
      !isTotalRow(row) &&
      !row.classList.contains("estimate-section-row"),
  );

  if (!dataRows.length) return () => { };

  const hiddenCells = [];

  headerCells.forEach((headerCell, colIndex) => {
    if (colIndex <= 0) return;

    const allEmpty = dataRows.every((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length !== headerCells.length) return true;
      return isEmptyPdfCellText(getCellPlainText(cells[colIndex]));
    });

    if (!allEmpty) return;

    hiddenCells.push({ cell: headerCell, display: headerCell.style.display });
    headerCell.style.display = "none";

    dataRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length !== headerCells.length || !cells[colIndex]) return;
      hiddenCells.push({ cell: cells[colIndex], display: cells[colIndex].style.display });
      cells[colIndex].style.display = "none";
    });
  });

  return () => {
    hiddenCells.forEach(({ cell, display }) => {
      cell.style.display = display;
    });
  };
};

export const hideEmptyPdfSections = (table) => {
  if (!table) return () => { };

  const rows = [...table.querySelectorAll("tbody tr")];
  const hiddenRows = [];

  rows.forEach((row, index) => {
    if (!row.classList.contains("estimate-section-row")) return;

    let hasVisibleData = false;

    for (let i = index + 1; i < rows.length; i += 1) {
      const nextRow = rows[i];

      if (nextRow.classList.contains("estimate-section-row")) break;
      if (nextRow.style.display === "none") continue;
      if (isTotalRow(nextRow)) break;

      hasVisibleData = true;
      break;
    }

    if (!hasVisibleData) {
      hiddenRows.push({ row, display: row.style.display });
      row.style.display = "none";
    }
  });

  return () => {
    hiddenRows.forEach(({ row, display }) => {
      row.style.display = display;
    });
  };
};

const syncSingleFormControl = (sourceField, targetField) => {
  if (!sourceField || !targetField) return;

  if (sourceField.tagName === "SELECT") {
    targetField.value = sourceField.value;
    targetField.selectedIndex = sourceField.selectedIndex;

    [...targetField.options].forEach((option, index) => {
      option.selected = index === sourceField.selectedIndex;
    });

    const selectedText = (sourceField.options[sourceField.selectedIndex]?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (selectedText && selectedText !== "Select") {
      targetField.setAttribute("data-pdf-selected-text", selectedText);
    } else {
      targetField.removeAttribute("data-pdf-selected-text");
    }
    return;
  }

  if (sourceField.type === "checkbox" || sourceField.type === "radio") {
    targetField.checked = sourceField.checked;
    return;
  }

  targetField.value = sourceField.value;
  targetField.setAttribute("value", sourceField.value);
};

export const syncFormControlValues = (sourceRoot, targetRoot) => {
  if (!sourceRoot || !targetRoot) return;

  const sourceFields = [...sourceRoot.querySelectorAll("input, select, textarea")];
  const targetFields = [...targetRoot.querySelectorAll("input, select, textarea")];

  sourceFields.forEach((sourceField, index) => {
    syncSingleFormControl(sourceField, targetFields[index]);
  });
};

const hidePdfOnlyElements = (root) => {
  root?.querySelectorAll(".ship_btn").forEach((el) => {
    el.style.display = "none";
  });

  root?.querySelectorAll(".text-center.mt-3").forEach((el) => {
    if (el.querySelector(".ship_btn")) {
      el.style.display = "none";
    }
  });

  root?.querySelectorAll("table").forEach((table) => {
    const text = table.textContent.replace(/\s+/g, " ").trim();
    if (text === "Rate of Exchange") {
      table.style.display = "none";
    }
  });

  root?.querySelectorAll(".table-responsive").forEach((wrap) => {
    let prev = wrap.previousElementSibling;
    while (prev) {
      if (/quote information/i.test(prev.textContent ?? "")) {
        prev.style.display = "none";
        break;
      }
      prev = prev.previousElementSibling;
    }
  });
};

const ensureQuoteInfoSelectsVisible = (root) => {
  root?.querySelectorAll("select[name='final_base_currency']").forEach((select) => {
    const displayValue = getSelectDisplayText(select);
    if (!displayValue) {
      select.closest("table")?.remove();
      return;
    }

    const container = select.parentElement;
    const replacement = container?.querySelector("[data-pdf-text-replacement]");
    const label = container?.querySelector("strong");

    if (replacement) {
      replacement.textContent = displayValue;
      replacement.style.display = "inline-block";
      replacement.style.fontWeight = "700";
      replacement.style.color = "#000";
      replacement.style.minWidth = "60px";
      replacement.style.textAlign = "right";
    }

    if (label) {
      label.textContent = `Final Base Currency: ${displayValue}`;
    }
  });
};

export const preparePdfCloneForExport = (root, quoteData = null) => {
  const page = root.querySelector(".pdf-page") ?? root;

  const savedPageStyles = {
    width: page.style.width,
    minWidth: page.style.minWidth,
    maxWidth: page.style.maxWidth,
    outline: page.style.outline,
  };

  page.style.width = `${PDF_PAGE_WIDTH}px`;
  page.style.minWidth = `${PDF_PAGE_WIDTH}px`;
  page.style.maxWidth = `${PDF_PAGE_WIDTH}px`;
  page.style.outline = "none";

  injectPdfGlobalStyles(root);
  const restoreFormControls = replaceFormControlsWithText(root);
  ensureQuoteInfoSelectsVisible(root);
  hidePdfOnlyElements(root);
  renderPdfQuoteLayout(root, quoteData);

  return () => {
    restoreFormControls();
    page.style.width = savedPageStyles.width;
    page.style.minWidth = savedPageStyles.minWidth;
    page.style.maxWidth = savedPageStyles.maxWidth;
    page.style.outline = savedPageStyles.outline;
  };
};

export const mountPdfCaptureClone = (element) => {
  if (!element) {
    return { captureTarget: element, cleanup: () => { } };
  }

  const clone = element.cloneNode(true);
  syncFormControlValues(element, clone);
  const host = document.createElement("div");
  host.setAttribute("data-pdf-capture-host", "true");
  host.style.cssText = `position:fixed;left:-9999px;top:0;z-index:-1;pointer-events:none;background:#fff;width:${PDF_PAGE_WIDTH}px;max-width:${PDF_PAGE_WIDTH}px;overflow:visible;`;
  host.appendChild(clone);
  document.body.appendChild(host);

  return {
    captureTarget: clone,
    cleanup: () => {
      host.remove();
    },
  };
};

export const waitForLayout = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

export const measurePdfDimensions = (element) => {
  const page = element?.querySelector(".pdf-page") ?? element;
  const quoteWrap = element?.querySelector(".pdf-quote-wrap");

  const contentWidth = Math.max(
    PDF_PAGE_WIDTH,
    page?.scrollWidth ?? 0,
    page?.offsetWidth ?? 0,
    element?.scrollWidth ?? 0,
    quoteWrap?.scrollWidth ?? 0,
  );

  const contentHeight = Math.max(
    page?.scrollHeight ?? 0,
    page?.offsetHeight ?? 0,
    element?.scrollHeight ?? 0,
    quoteWrap?.scrollHeight ?? 0,
  );

  const paddedHeight = contentHeight + 24;
  const scale = Math.min(1.5, 14000 / Math.max(contentWidth, paddedHeight));

  return {
    contentWidth,
    contentHeight: paddedHeight,
    pdfWidth: contentWidth,
    pdfHeight: paddedHeight,
    scale: Math.max(scale, 0.75),
  };
};

export const exportEstimatePdf = async (element, filename = "shipping-estimate.pdf") => {
  if (!element) {
    throw new Error("PDF content is not ready.");
  }

  await waitForLayout();

  const quoteData = extractQuoteDataFromRoot(element);
  const { captureTarget, cleanup } = mountPdfCaptureClone(element);
  const restoreClone = preparePdfCloneForExport(captureTarget, quoteData);

  try {
    await waitForLayout();

    const { contentWidth, contentHeight, pdfWidth, pdfHeight, scale } =
      measurePdfDimensions(captureTarget);

    const options = {
      margin: [0, 0, 0, 0],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
        windowWidth: contentWidth,
        windowHeight: contentHeight,
        width: contentWidth,
        height: contentHeight,
      },
      jsPDF: {
        unit: "px",
        format: [pdfWidth, pdfHeight],
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    };

    await html2pdf().from(captureTarget).set(options).save();
  } finally {
    restoreClone();
    cleanup();
  }
};

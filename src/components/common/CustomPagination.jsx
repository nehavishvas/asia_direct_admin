import React from "react";

/**
 * Standardized Pagination Component across all Asia Direct Admin Modules.
 * Matches the complete page function with rows-per-page, first/prev buttons,
 * dynamic page select dropdown, next/last buttons.
 *
 * @param {number} currentPage - Current active page (1-based)
 * @param {number} totalPages - Total pages (or totalPage)
 * @param {function} onPageChange - Callback when page changes (newPage: number)
 * @param {number} [itemsPerPage] - Current items/rows per page
 * @param {function} [onItemsPerPageChange] - Callback when items per page changes (newLimit: number)
 * @param {number[]} [itemsPerPageOptions] - Options for rows per page, default [10, 25, 50, 100]
 * @param {number} [totalItems] - Optional total count of items
 * @param {string} [className] - Additional wrapper class
 */
const CustomPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalPage,
  onPageChange,
  itemsPerPage,
  rowsPerPage,
  onItemsPerPageChange,
  onRowsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  rowsPerPageOptions,
  totalItems,
  className = "",
  style = {}
}) => {
  const finalTotalPages = Math.max(1, totalPages || totalPage || 1);
  const finalCurrentPage = Math.max(1, Math.min(currentPage || 1, finalTotalPages));
  const finalItemsPerPage = itemsPerPage || rowsPerPage;
  const finalOnItemsPerPageChange = onItemsPerPageChange || onRowsPerPageChange;
  const finalOptions = rowsPerPageOptions || itemsPerPageOptions;

  const handlePageChange = (page) => {
    const targetPage = Math.max(1, Math.min(page, finalTotalPages));
    if (onPageChange && targetPage !== finalCurrentPage) {
      onPageChange(targetPage);
    }
  };

  return (
    <div
      className={`text-center d-flex justify-content-end align-items-center gap-2 mt-3 mb-4 flex-wrap ${className}`}
      style={{ paddingRight: "10px", ...style }}
    >
      {/* Optional total items summary */}
      {typeof totalItems === "number" && (
        <span className="me-2 text-muted" style={{ fontSize: "13px" }}>
          Total: <strong>{totalItems}</strong>
        </span>
      )}

      {/* Rows per page dropdown */}
      {finalOnItemsPerPageChange && (
        <div className="d-flex align-items-center me-3" style={{ gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#5c6378" }}>
            Rows per page:
          </span>
          <select
            value={finalItemsPerPage || finalOptions[0]}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value, 10);
              if (!isNaN(newLimit) && finalOnItemsPerPageChange) {
                finalOnItemsPerPageChange(newLimit);
              }
            }}
            className="form-select form-select-sm"
            style={{
              width: "75px",
              fontSize: "13px",
              height: "30px",
              padding: "2px 8px",
              borderRadius: "4px",
              borderColor: "#d1d5db"
            }}
          >
            {finalOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* First Page button */}
      <button
        type="button"
        disabled={finalCurrentPage === 1}
        className="bg_page"
        onClick={() => handlePageChange(1)}
        title="First Page"
        style={{
          height: "30px",
          width: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          cursor: finalCurrentPage === 1 ? "not-allowed" : "pointer"
        }}
      >
        <i className="fa fa-angle-double-left" style={{ fontSize: "13px" }}></i>
      </button>

      {/* Previous Page button */}
      <button
        type="button"
        disabled={finalCurrentPage === 1}
        className="bg_page"
        onClick={() => handlePageChange(finalCurrentPage - 1)}
        title="Previous Page"
        style={{
          height: "30px",
          width: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          cursor: finalCurrentPage === 1 ? "not-allowed" : "pointer"
        }}
      >
        <i className="fa fa-angle-left" style={{ fontSize: "13px" }}></i>
      </button>

      {/* Dynamic page selection dropdown */}
      <div
        className="d-flex align-items-center gap-1"
        style={{ fontSize: "13px", fontWeight: "600", color: "#1b2245" }}
      >
        <span>Page</span>
        <select
          value={finalCurrentPage}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              handlePageChange(val);
            }
          }}
          className="form-select form-select-sm text-center px-1"
          style={{
            width: "75px",
            height: "30px",
            fontSize: "13px",
            borderRadius: "4px",
            padding: "2px 18px 2px 6px",
            borderColor: "#d1d5db"
          }}
        >
          {Array.from({ length: finalTotalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <span>of {finalTotalPages}</span>
      </div>

      {/* Next Page button */}
      <button
        type="button"
        disabled={finalCurrentPage === finalTotalPages || finalTotalPages <= 1}
        className="bg_page"
        onClick={() => handlePageChange(finalCurrentPage + 1)}
        title="Next Page"
        style={{
          height: "30px",
          width: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          cursor: finalCurrentPage === finalTotalPages ? "not-allowed" : "pointer"
        }}
      >
        <i className="fa fa-angle-right" style={{ fontSize: "13px" }}></i>
      </button>

      {/* Last Page button */}
      <button
        type="button"
        disabled={finalCurrentPage === finalTotalPages || finalTotalPages <= 1}
        className="bg_page"
        onClick={() => handlePageChange(finalTotalPages)}
        title="Last Page"
        style={{
          height: "30px",
          width: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          cursor: finalCurrentPage === finalTotalPages ? "not-allowed" : "pointer"
        }}
      >
        <i className="fa fa-angle-double-right" style={{ fontSize: "13px" }}></i>
      </button>
    </div>
  );
};

export default CustomPagination;

"use client";

import { useMemo, useState } from "react";

type MatrixRow = {
  values: string[];
};

type ImplantMatrixEditorProps = {
  initialColumns: string[];
  initialRows: MatrixRow[];
};

const emptyRow: MatrixRow = { values: [] };

export function ImplantMatrixEditor({
  initialColumns,
  initialRows
}: ImplantMatrixEditorProps) {
  const [columns, setColumns] = useState(
    initialColumns.length > 0 ? initialColumns : ["Technique", "Type", "Ideal Candidates"]
  );
  const [rows, setRows] = useState(initialRows.length > 0 ? initialRows : [emptyRow]);

  const normalizedRows = useMemo(
    () =>
      rows.map((row) => {
        const values = Array.isArray(row.values) ? [...row.values] : [];
        while (values.length < columns.length) {
          values.push("");
        }
        return { values };
      }),
    [rows, columns]
  );

  function updateColumn(index: number, value: string) {
    setColumns((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    setRows((prev) =>
      prev.map((row, currentRowIndex) => {
        if (currentRowIndex !== rowIndex) {
          return row;
        }
        const values = Array.isArray(row.values) ? [...row.values] : [];
        while (values.length < columns.length) {
          values.push("");
        }
        values[columnIndex] = value;
        return { values };
      })
    );
  }

  function addColumn() {
    setColumns((prev) => [...prev, `Column ${prev.length + 1}`]);
    setRows((prev) => prev.map((row) => ({ values: [...(row.values || []), ""] })));
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setRows((prev) =>
      prev.map((row) => ({
        values: (row.values || []).filter((_, currentIndex) => currentIndex !== index)
      }))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { values: Array(columns.length).fill("") }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <section className="admin-card admin-form">
      <div className="admin-card-header">
        <div>
          <div className="admin-eyebrow">Matrix</div>
          <h2>Treatment matrix rows and columns</h2>
        </div>
      </div>

      <input type="hidden" name="matrixColumnCount" value={columns.length} />
      <input type="hidden" name="matrixRowCount" value={normalizedRows.length} />

      <div className="admin-actions">
        <button type="button" className="admin-button-muted" onClick={addColumn}>
          Add column
        </button>
        <button type="button" className="admin-button-muted" onClick={addRow}>
          Add row
        </button>
      </div>

      <div className="admin-list">
        <article className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Columns</div>
              <h3>Column labels</h3>
            </div>
          </div>
          <div className="admin-form-grid">
            {columns.map((column, index) => (
              <div key={`matrix-column-${index}`} className="admin-field">
                <label>{`Column ${index + 1}`}</label>
                <input
                  name={`matrixColumns.${index}`}
                  defaultValue={column}
                  onChange={(event) => updateColumn(index, event.target.value)}
                  className="admin-input"
                />
                {columns.length > 1 ? (
                  <button
                    type="button"
                    className="admin-button-danger"
                    onClick={() => removeColumn(index)}
                  >
                    Delete column
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        {normalizedRows.map((row, rowIndex) => (
          <article key={`matrix-row-${rowIndex}`} className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Row {rowIndex + 1}</div>
                <h3>Values</h3>
              </div>
              {normalizedRows.length > 1 ? (
                <button
                  type="button"
                  className="admin-button-danger"
                  onClick={() => removeRow(rowIndex)}
                >
                  Delete row
                </button>
              ) : null}
            </div>

            <div className="admin-form-grid">
              {columns.map((column, columnIndex) => (
                <div key={`matrix-cell-${rowIndex}-${columnIndex}`} className="admin-field">
                  <label>{column || `Column ${columnIndex + 1}`}</label>
                  <textarea
                    name={`matrixRows.${rowIndex}.${columnIndex}`}
                    defaultValue={row.values[columnIndex] || ""}
                    onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                    className="admin-textarea"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { Section } from "@/lib/cms";

type TreatmentMatrixSectionProps = {
  section: Section;
};

export function TreatmentMatrixSection({ section }: TreatmentMatrixSectionProps) {
  const settings = (section.settings || {}) as Record<string, unknown>;
  const columns = (settings.columns as string[] | undefined) || [];
  const rows = ((settings.rows as Array<{ values?: string[] }> | undefined) || []).map((row) =>
    Array.isArray(row.values) ? row.values : []
  );

  if (!columns.length || !rows.length) {
    return null;
  }

  return (
    <section id="treatment-matrix" className="matrix-section">
      <div className="container-dental">
        <div className="matrix-section__head">
          <p className="matrix-section__kicker">{section.subheading}</p>
          <h2 className="matrix-section__title">{section.heading}</h2>
          <p className="matrix-section__description">{section.description}</p>
        </div>

        <div className="matrix-section__table-wrap">
          <table className="matrix-section__table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`matrix-row-${rowIndex}`}>
                  {columns.map((column, cellIndex) => (
                    <td key={`${column}-${cellIndex}`}>
                      <span className="matrix-section__cell-label">{column}</span>
                      {row[cellIndex] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

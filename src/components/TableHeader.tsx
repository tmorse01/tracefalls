import React, { useState, useCallback } from "react";

export interface ColumnDef {
  key: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  width: number;
}

export function TableHeader({
  columns,
  columnWidths,
  onColumnWidthsChange,
  ticks,
}: {
  columns: ColumnDef[];
  columnWidths: Record<string, number>;
  onColumnWidthsChange: (widths: Record<string, number>) => void;
  ticks?: { label: string }[];
}) {
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colKey: string) => {
      e.preventDefault();
      setResizingCol(colKey);
      setStartX(e.clientX);
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingCol) return;

      const col = columns.find((c) => c.key === resizingCol);
      if (!col) return;

      const delta = e.clientX - startX;
      const currentWidth = columnWidths[resizingCol] || col.width;
      const minWidth = col.minWidth || 60;
      const maxWidth = col.maxWidth || 600;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, currentWidth + delta),
      );

      onColumnWidthsChange({
        ...columnWidths,
        [resizingCol]: newWidth,
      });
      setStartX(e.clientX);
    },
    [resizingCol, startX, columnWidths, columns, onColumnWidthsChange],
  );

  const handleMouseUp = useCallback(() => {
    setResizingCol(null);
  }, []);

  React.useEffect(() => {
    if (resizingCol) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizingCol, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="flex flex-col shrink-0 border-b text-xs"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border)",
        userSelect: resizingCol ? "none" : "auto",
      }}
    >
      {/* Timeline ticks row */}
      {ticks && ticks.length > 0 && (
        <div
          className="flex items-stretch"
          style={{
            height: 26,
            display: "grid",
            gridTemplateColumns: columns
              .map((col) => `${columnWidths[col.key] || col.width}px`)
              .join(" 1fr"),
          }}
        >
          {/* Empty cells for left columns */}
          {columns.slice(0, -1).map((col) => (
            <div
              key={`tick-spacer-${col.key}`}
              style={{
                borderRight: "1px solid var(--border)",
              }}
            />
          ))}
          {/* Timeline ticks in the last column */}
          <div className="relative overflow-hidden">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center"
                style={{
                  left: `${(i / (ticks.length - 1)) * 100}%`,
                  transform: "translateX(-50%)",
                  height: "100%",
                }}
              >
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 10,
                    paddingTop: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tick.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column headers using plain HTML table for proper column alignment */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderTop: "1px solid var(--border)",
          tableLayout: "fixed",
          backgroundColor: "transparent",
        }}
      >
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                style={{
                  width: `${columnWidths[col.key] || col.width}px`,
                  height: 26,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRight:
                    idx < columns.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "transparent",
                  overflow: "hidden",
                  position: "relative",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </span>
                {idx < columns.length - 1 && (
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, col.key)}
                    style={{
                      width: 4,
                      height: 20,
                      cursor: "col-resize",
                      background:
                        resizingCol === col.key
                          ? "var(--accent-blue)"
                          : "transparent",
                      transition: "background 0.1s",
                      marginLeft: 4,
                      marginRight: -8,
                      flex: "0 0 auto",
                    }}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}

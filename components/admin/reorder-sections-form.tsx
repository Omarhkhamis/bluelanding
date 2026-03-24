"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Power } from "lucide-react";
import { saveReorderSectionsAction } from "@/app/admin/actions";

type ReorderSection = {
  key: string;
  name: string;
  isActive: boolean;
};

type ReorderSectionsFormProps = {
  siteKey: string;
  locale: string;
  sections: ReorderSection[];
};

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function ReorderSectionsForm({ siteKey, locale, sections }: ReorderSectionsFormProps) {
  const [items, setItems] = useState(sections);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <form action={saveReorderSectionsAction} className="admin-card admin-form">
      <input type="hidden" name="site" value={siteKey} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="returnPath" value="/admin/reorder" />
      <input type="hidden" name="sectionCount" value={items.length} />

      <div className="admin-list">
        {items.map((section, index) => (
          <div
            key={section.key}
            className="admin-card admin-reorder-item"
            style={{ boxShadow: "none" }}
            draggable
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", section.key);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) {
                setDragIndex(null);
                return;
              }

              setItems((current) => moveItem(current, dragIndex, index));
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <input type="hidden" name={`sections.${index}.key`} value={section.key} />
            <input
              type="hidden"
              name={`sections.${index}.isActive`}
              value={section.isActive ? "true" : ""}
            />
            <input type="hidden" name={`sections.${index}.sortOrder`} value={index} />

            <div className="admin-reorder-main">
              <div className="admin-reorder-handle" aria-hidden="true">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="admin-reorder-copy">
                <div className="admin-reorder-title">{section.name}</div>
                <div className="admin-muted">{section.key}</div>
              </div>

              <div className="admin-reorder-actions">
                <span
                  className={`admin-reorder-status ${
                    section.isActive ? "admin-reorder-status-active" : ""
                  }`}
                >
                  {section.isActive ? "Enabled" : "Disabled"}
                </span>
                <button
                  type="button"
                  className={`admin-reorder-toggle ${
                    section.isActive ? "admin-reorder-toggle-active" : ""
                  }`}
                  onClick={() => {
                    setItems((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, isActive: !item.isActive } : item
                      )
                    );
                  }}
                  aria-pressed={section.isActive}
                  aria-label={`${section.isActive ? "Disable" : "Enable"} ${section.name}`}
                >
                  <Power className="h-4 w-4" />
                  {section.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className="admin-reorder-button"
                  onClick={() => {
                    if (index === 0) {
                      return;
                    }

                    setItems((current) => moveItem(current, index, index - 1));
                  }}
                  disabled={index === 0}
                  aria-label={`Move ${section.name} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="admin-reorder-button"
                  onClick={() => {
                    if (index === items.length - 1) {
                      return;
                    }

                    setItems((current) => moveItem(current, index, index + 1));
                  }}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${section.name} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-button">
          Save order
        </button>
      </div>
    </form>
  );
}

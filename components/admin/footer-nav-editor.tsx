"use client";

import { useState } from "react";
import type { FooterNavItem } from "@/lib/footer-nav";

type FooterNavEditorProps = {
  initialItems: FooterNavItem[];
};

export function FooterNavEditor({ initialItems }: FooterNavEditorProps) {
  const [items, setItems] = useState<FooterNavItem[]>(initialItems);

  function updateItem(index: number, key: keyof FooterNavItem, value: string) {
    setItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", href: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <>
      <input type="hidden" name="footerNavItemCount" value={items.length} />

      <div className="admin-card-header">
        <div>
          <div className="admin-eyebrow">Navigation</div>
          <h3>Footer nav items</h3>
        </div>

        <button type="button" className="admin-button-muted" onClick={addItem}>
          Add nav
        </button>
      </div>

      {items.length > 0 ? (
        <div className="admin-list">
          {items.map((item, index) => (
            <article key={`footer-nav-${index}`} className="admin-card admin-form">
              <div className="admin-card-header">
                <div>
                  <div className="admin-eyebrow">{`Nav-${index + 1}`}</div>
                  <h3>{item.label || "New nav item"}</h3>
                </div>

                <button
                  type="button"
                  className="admin-button-danger"
                  onClick={() => removeItem(index)}
                >
                  Delete nav
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor={`footerNavItems-${index}-label`}>{`Nav-${index + 1}`}</label>
                  <input
                    id={`footerNavItems-${index}-label`}
                    name={`footerNavItems.${index}.label`}
                    value={item.label}
                    onChange={(event) => updateItem(index, "label", event.target.value)}
                    className="admin-input"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor={`footerNavItems-${index}-href`}>{`Nav-${index + 1} URL`}</label>
                  <input
                    id={`footerNavItems-${index}-href`}
                    name={`footerNavItems.${index}.href`}
                    value={item.href}
                    onChange={(event) => updateItem(index, "href", event.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-help">
          No footer nav items yet. Add a new nav item to show links in Footer 2.
        </p>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { adminIconOptions, getAdminIconOption } from "@/lib/admin-icons";

type IconPickerFieldProps = {
  name: string;
  value: string;
};

export function IconPickerField({ name, value }: IconPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState(value);
  const selectedOption = getAdminIconOption(selectedValue);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleOptions = normalizedSearch
    ? adminIconOptions.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
    : adminIconOptions;

  return (
    <div className="admin-field">
      <label>Icon</label>
      <input type="hidden" name={name} value={selectedValue} />

      <div className="admin-icon-trigger-row">
        <button
          type="button"
          className="admin-button-muted"
          onClick={() => setIsOpen(true)}
        >
          Choose icon
        </button>
        <span className="admin-muted">
          {selectedOption ? selectedOption.label : "Automatic default icon"}
        </span>
      </div>

      {isOpen ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Choose icon"
          onClick={() => setIsOpen(false)}
        >
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div className="admin-eyebrow">Icon picker</div>
                <h2>Choose icon</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close icon picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="admin-modal-search">
              <Search className="admin-modal-search-icon h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="admin-input"
                placeholder="Search icons"
              />
            </div>

            <div className="admin-icon-grid">
              <button
                type="button"
                className={`admin-icon-card${selectedValue ? "" : " admin-icon-card-active"}`}
                onClick={() => {
                  setSelectedValue("");
                  setIsOpen(false);
                }}
              >
                <span className="admin-icon-preview admin-icon-preview-text">Auto</span>
                <span className="admin-icon-name">Automatic</span>
              </button>

              {visibleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`admin-icon-card${selectedValue === option.value ? " admin-icon-card-active" : ""}`}
                  onClick={() => {
                    setSelectedValue(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="admin-icon-preview">
                    <option.Icon className="h-5 w-5" />
                  </span>
                  <span className="admin-icon-name">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

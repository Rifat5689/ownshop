import React, { useState } from "react";
import {
  TbArrowDown,
  TbArrowUp,
  TbList,
  TbPlus,
  TbTable,
  TbTrash,
} from "react-icons/tb";

export const sectionTypes = [
  ["text", "Text section"],
  ["highlights", "Key highlights"],
  ["bullets", "Bullet list"],
  ["table", "Specification table"],
  ["usage", "How to use"],
  ["ingredients", "Ingredients / materials"],
  ["faq", "Questions and answers"],
];

const blankSection = (type = "text") => ({
  type,
  title: sectionTypes.find(([value]) => value === type)?.[1] || "",
  enabled: true,
  content: "",
  items: [],
  rows: [],
});

export function normalizeSections(sections = []) {
  const normalized = sections.map((section) => ({
    type: section.type || "text",
    title: section.title || "",
    enabled: section.enabled !== false,
    content: section.content || "",
    items: Array.isArray(section.items) ? section.items : [],
    rows: Array.isArray(section.rows) ? section.rows : [],
  }));
  return normalized.length
    ? normalized
    : [{ ...blankSection("text"), title: "Description" }];
}

export default function StructuredDescriptionEditor({ value, onChange }) {
  const [adding, setAdding] = useState(false);
  const update = (index, patch) =>
    onChange(
      value.map((section, itemIndex) =>
        itemIndex === index ? { ...section, ...patch } : section,
      ),
    );
  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };
  return (
    <section className="description-builder">
      <div className="description-builder-heading">
        <div>
          <h3>Structured description</h3>
          <p>
            Add only the sections customers should see. Drag-free ordering keeps
            editing predictable.
          </p>
        </div>
        <div className="description-add-more">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAdding((current) => !current)}
          >
            <TbPlus aria-hidden="true" /> Add more
          </button>
          {adding && (
          <select
            autoFocus
            value=""
            aria-label="Choose another description section"
            onChange={(event) => {
              if (event.target.value) {
                onChange([...value, blankSection(event.target.value)]);
                setAdding(false);
              }
            }}
          >
            <option value="">Choose type…</option>
            {sectionTypes.map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
          )}
        </div>
      </div>
      {!value.length && (
        <div className="description-builder-empty">
          <TbPlus aria-hidden="true" />
          Add highlights, specifications, usage instructions, ingredients, FAQs,
          or custom text.
        </div>
      )}
      {value.map((section, index) => (
        <div
          className="description-section-editor"
          key={`${section.type}-${index}`}
        >
          <div className="description-section-toolbar">
            <span>
              {sectionTypes.find(([type]) => type === section.type)?.[1]}
            </span>
            <label className="row">
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(event) =>
                  update(index, { enabled: event.target.checked })
                }
              />{" "}
              Show
            </label>
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Move section up"
            >
              <TbArrowUp />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              aria-label="Move section down"
            >
              <TbArrowDown />
            </button>
            <button
              type="button"
              className="danger"
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
              aria-label="Delete section"
              disabled={
                index === 0 &&
                section.type === "text" &&
                section.title === "Description"
              }
            >
              <TbTrash />
            </button>
          </div>
          <label>
            Section heading
            <input
              value={section.title}
              maxLength="120"
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder="Example: Product highlights"
            />
          </label>
          {["text", "usage", "ingredients"].includes(section.type) && (
            <label>
              Content
              <textarea
                value={section.content}
                maxLength="10000"
                onChange={(event) =>
                  update(index, { content: event.target.value })
                }
                placeholder="Write clear, useful information for customers."
              />
            </label>
          )}
          {["bullets", "highlights"].includes(section.type) && (
            <label>
              <span>
                <TbList aria-hidden="true" /> Items (one per line)
              </span>
              <textarea
                value={section.items.join("\n")}
                onChange={(event) =>
                  update(index, { items: event.target.value.split(/\r?\n/) })
                }
                placeholder={
                  "Lightweight texture\nSuitable for daily use\nEasy to apply"
                }
              />
            </label>
          )}
          {["table", "faq"].includes(section.type) && (
            <div>
              <div className="description-table-label">
                <TbTable aria-hidden="true" />
                {section.type === "faq"
                  ? "Questions and answers"
                  : "Table rows"}
              </div>
              {section.rows.map((row, rowIndex) => (
                <div className="description-row-editor" key={rowIndex}>
                  <input
                    value={row.label}
                    maxLength="120"
                    aria-label={section.type === "faq" ? "Question" : "Label"}
                    placeholder={section.type === "faq" ? "Question" : "Label"}
                    onChange={(event) =>
                      update(index, {
                        rows: section.rows.map((item, itemIndex) =>
                          itemIndex === rowIndex
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <input
                    value={row.value}
                    maxLength="500"
                    aria-label={section.type === "faq" ? "Answer" : "Value"}
                    placeholder={section.type === "faq" ? "Answer" : "Value"}
                    onChange={(event) =>
                      update(index, {
                        rows: section.rows.map((item, itemIndex) =>
                          itemIndex === rowIndex
                            ? { ...item, value: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      update(index, {
                        rows: section.rows.filter(
                          (_, itemIndex) => itemIndex !== rowIndex,
                        ),
                      })
                    }
                    aria-label="Delete row"
                  >
                    <TbTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary description-add-row"
                onClick={() =>
                  update(index, {
                    rows: [...section.rows, { label: "", value: "" }],
                  })
                }
              >
                <TbPlus /> Add row
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

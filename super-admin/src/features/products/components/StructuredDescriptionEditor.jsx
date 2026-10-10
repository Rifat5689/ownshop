import React from "react";
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from "react-icons/tb";

const types = [
  ["text", "Text section"],
  ["highlights", "Key highlights"],
  ["bullets", "Bullet list"],
  ["table", "Specification table"],
  ["usage", "How to use"],
  ["ingredients", "Ingredients / materials"],
  ["faq", "Questions and answers"],
];
const blank = (type) => ({
  type,
  title: types.find(([value]) => value === type)?.[1] || "",
  enabled: true,
  content: "",
  items: [],
  rows: [],
});
export const normalizeSections = (sections = []) =>
  sections.map((section) => ({
    type: section.type || "text",
    title: section.title || "",
    enabled: section.enabled !== false,
    content: section.content || "",
    items: section.items || [],
    rows: section.rows || [],
  }));

export default function StructuredDescriptionEditor({ value, onChange }) {
  const update = (index, patch) =>
    onChange(
      value.map((section, itemIndex) =>
        itemIndex === index ? { ...section, ...patch } : section,
      ),
    );
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <section className="description-builder">
      <div className="description-builder-heading">
        <div>
          <h3>Structured description</h3>
          <p>Choose, arrange, and publish only the sections customers need.</p>
        </div>
        <label>
          Add section
          <select
            value=""
            onChange={(event) =>
              event.target.value &&
              onChange([...value, blank(event.target.value)])
            }
          >
            <option value="">Choose type…</option>
            {types.map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!value.length && (
        <div className="description-builder-empty">
          <TbPlus />
          Add highlights, specifications, instructions, ingredients, FAQs, or
          custom text.
        </div>
      )}
      {value.map((section, index) => (
        <div
          className="description-section-editor"
          key={`${section.type}-${index}`}
        >
          <div className="description-section-toolbar">
            <span>{types.find(([type]) => type === section.type)?.[1]}</span>
            <label className="row">
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(event) =>
                  update(index, { enabled: event.target.checked })
                }
              />
              Show
            </label>
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={!index}
              aria-label="Move up"
            >
              <TbArrowUp />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              aria-label="Move down"
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
              />
            </label>
          )}
          {["bullets", "highlights"].includes(section.type) && (
            <label>
              Items (one per line)
              <textarea
                value={section.items.join("\n")}
                onChange={(event) =>
                  update(index, { items: event.target.value.split(/\r?\n/) })
                }
              />
            </label>
          )}
          {["table", "faq"].includes(section.type) && (
            <div>
              {section.rows.map((row, rowIndex) => (
                <div className="description-row-editor" key={rowIndex}>
                  <input
                    value={row.label}
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
                <TbPlus />
                Add row
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

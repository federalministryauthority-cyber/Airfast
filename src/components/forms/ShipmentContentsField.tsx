import { OTHER_CONTENTS_MAX_LENGTH, contentsForCategory, parseContents, serializeContents } from '@/data/shipmentContents';

interface ShipmentContentsFieldProps {
  id: string;
  category: string;
  value: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

const checkboxClass = 'h-5 w-5 shrink-0 cursor-pointer accent-gold';

export default function ShipmentContentsField({ id, category, value, required = false, error, onChange }: ShipmentContentsFieldProps) {
  const options = contentsForCategory(category);
  const selection = parseContents(value);
  const hasCategory = options.length > 0;

  const toggleItem = (item: string, checked: boolean) => {
    const items = checked ? [...selection.items, item] : selection.items.filter((existing) => existing !== item);
    onChange(serializeContents({ items, other: selection.other }));
  };

  const toggleOther = (checked: boolean) => {
    onChange(serializeContents({ items: selection.items, other: checked ? '' : null }));
  };

  return (
    <fieldset id={id} disabled={!hasCategory} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-white">
        Shipment Contents{required && <span className="text-gold"> *</span>}
      </legend>
      {!hasCategory ? (
        <p className="rounded-xl border border-white/10 bg-navy/60 p-4 text-sm text-mist">Choose a shipment category to see the contents.</p>
      ) : (
        <div className="grid gap-3 rounded-xl border border-white/10 bg-navy/60 p-4 sm:grid-cols-2">
          {options.map((option) => {
            const checkboxId = `${id}-${option.replace(/\W+/g, '-').toLowerCase()}`;
            return (
              <label key={option} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3 text-sm text-white">
                <input
                  id={checkboxId}
                  type="checkbox"
                  className={checkboxClass}
                  checked={selection.items.includes(option)}
                  onChange={(e) => toggleItem(option, e.target.checked)}
                />
                {option}
              </label>
            );
          })}
          <div className="sm:col-span-2 space-y-3 border-t border-white/10 pt-3">
            <label htmlFor={`${id}-other`} className="flex cursor-pointer items-center gap-3 text-sm text-white">
              <input
                id={`${id}-other`}
                type="checkbox"
                className={checkboxClass}
                checked={selection.other !== null}
                onChange={(e) => toggleOther(e.target.checked)}
              />
              Other (Please specify)
            </label>
            {selection.other !== null && (
              <input
                id={`${id}-other-text`}
                aria-label="Describe the other contents"
                className="field-input"
                maxLength={OTHER_CONTENTS_MAX_LENGTH}
                placeholder="Describe the contents"
                value={selection.other}
                onChange={(e) => onChange(serializeContents({ items: selection.items, other: e.target.value }))}
              />
            )}
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-danger-light">{error}</p>}
    </fieldset>
  );
}

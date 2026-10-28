import { IonInput, IonNote } from '@ionic/react';
import type { QuantityDraft, QuantityError } from '../domain/quantity';
import { isUnitId, UNIT_IDS, UNITS } from '../domain/units';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

interface QuantityFieldsProps {
  idPrefix: string;
  /** Added to the field labels so fields in different forms have distinct accessible names. */
  itemName?: string;
  value: QuantityDraft;
  error: QuantityError | null;
  onChange: (value: QuantityDraft) => void;
}

export function QuantityFields({
  idPrefix,
  itemName,
  value,
  error,
  onChange,
}: QuantityFieldsProps) {
  const messages = useShoppingListMessages();
  const amountDisabled = value.unit !== undefined && !UNITS[value.unit].takesAmount;
  const errorId = `${idPrefix}-quantity-error`;
  const unitId = `${idPrefix}-unit`;

  return (
    <>
      <div className="quantity-fields">
        <IonInput
          label={messages.amount(itemName)}
          labelPlacement="floating"
          fill="outline"
          inputmode="decimal"
          value={value.amount}
          disabled={amountDisabled}
          enterkeyhint="done"
          aria-describedby={errorId}
          aria-invalid={error !== null}
          onIonInput={(event) => {
            onChange({ ...value, amount: event.detail.value ?? '' });
          }}
        />
        <div className="unit-field">
          <label htmlFor={unitId}>{messages.unit(itemName)}</label>
          <select
            id={unitId}
            value={value.unit ?? ''}
            aria-describedby={errorId}
            aria-invalid={error !== null}
            onChange={(event) => {
              const selected = event.target.value;
              const unit = isUnitId(selected) ? selected : undefined;
              const clearAmount = unit !== undefined && !UNITS[unit].takesAmount;
              onChange({ amount: clearAmount ? '' : value.amount, unit });
            }}
          >
            <option value="">{messages.noUnit}</option>
            {UNIT_IDS.map((id) => (
              <option key={id} value={id}>
                {messages.units[id].singular}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div id={errorId} role="alert">
        {error && <IonNote color="danger">{messages.quantityErrors[error]}</IonNote>}
      </div>
    </>
  );
}

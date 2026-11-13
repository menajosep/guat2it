import { useIonViewWillLeave } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { useLanguage } from '../../language/hooks/language-context';
import type { QuantityError } from '../../shopping-list/domain/quantity';
import { isUnitId, UNIT_IDS, UNITS, type UnitId } from '../../shopping-list/domain/units';
import { useShoppingListMessages } from '../../shopping-list/hooks/use-shopping-list-messages';
import { formatQuantity } from '../../shopping-list/messages/format-quantity';
import {
  groupTransfer,
  formatExactAmount,
  resolveTransferQuantity,
  transferUnits,
  type TransferChoice,
  type TransferSnapshot,
  type TransferQuantityError,
} from '../domain/menu-transfer';
import type { WeeklyMenu } from '../domain/weekly-menu';
import { useActiveMenu } from '../hooks/active-menu-context';
import { useWeeklyMenuService } from '../hooks/weekly-menu-service-context';
import { planningMessages } from '../messages/planning-messages';
import { transferMessages } from '../messages/transfer-messages';
import { weeklyMenuMessages } from '../messages/weekly-menu-messages';

function isQuantityError(error: TransferQuantityError): error is QuantityError {
  return (
    error !== 'choose-unit' &&
    error !== 'manual-required' &&
    error !== 'unit-mismatch' &&
    error !== 'servings-required' &&
    error !== 'invalid-yield'
  );
}

export function MenuTransfer({ menu }: { menu: WeeklyMenu }) {
  const { language } = useLanguage();
  const messages = transferMessages[language];
  const planning = planningMessages[language];
  const weekly = weeklyMenuMessages[language];
  const shopping = useShoppingListMessages();
  const service = useWeeklyMenuService();
  const { transfer, transferMenu, clearTransferFeedback } = useActiveMenu();
  const [snapshot, setSnapshot] = useState<TransferSnapshot | null>(null);
  const [choices, setChoices] = useState<ReadonlyMap<string, TransferChoice>>(() => new Map());
  const [invalid, setInvalid] = useState<ReadonlySet<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<
    | 'menu-not-found'
    | 'recipe-not-found'
    | 'servings-required'
    | 'invalid-recipe-yield'
    | 'storage'
    | 'unexpected'
    | null
  >(null);
  const version = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = transfer === 'pending';

  useIonViewWillLeave(() => {
    version.current += 1;
    setSnapshot(null);
    setLoading(false);
    setLoadError(null);
  }, []);
  useEffect(
    () => () => {
      version.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (snapshot) heading.current?.focus();
  }, [snapshot]);

  async function openReview() {
    const request = ++version.current;
    setLoading(true);
    setLoadError(null);
    setSnapshot(null);
    setChoices(new Map());
    setInvalid(new Set());
    clearTransferFeedback();
    try {
      const result = await service.transfer.review(menu.id);
      if (request !== version.current) return;
      if (!result.ok) setLoadError(result.error);
      else setSnapshot(result.value);
    } catch (error) {
      console.error('Unable to load menu ingredients', error);
      if (request === version.current)
        setLoadError(error instanceof PersistenceError ? 'storage' : 'unexpected');
    } finally {
      if (request === version.current) setLoading(false);
    }
  }

  function setChoice(key: string, choice: TransferChoice) {
    setChoices((current) => new Map(current).set(key, choice));
    setInvalid((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  const groups = snapshot ? groupTransfer(snapshot) : [];
  const sortedUnits = [...UNIT_IDS].sort((a, b) =>
    shopping.units[a].singular.localeCompare(shopping.units[b].singular, language),
  );
  async function submit() {
    if (!snapshot || pending) return;
    const errors = new Set(
      groups
        .filter((group) => !resolveTransferQuantity(group, choices.get(group.key) ?? {}).ok)
        .map((group) => group.key),
    );
    if (errors.size > 0) {
      setInvalid(errors);
      return;
    }
    const outcome = await transferMenu(snapshot, choices);
    if (outcome !== 'failed') setSnapshot(null);
  }

  return (
    <section aria-label={messages.review}>
      <button type="button" disabled={loading || pending} onClick={() => void openReview()}>
        {messages.start}
      </button>
      {loading && <p role="status">{messages.loading}</p>}
      {loadError && (
        <p role="alert">
          {loadError === 'menu-not-found'
            ? messages.menuMissing
            : loadError === 'recipe-not-found'
              ? messages.recipeMissing
              : loadError === 'servings-required'
                ? weekly.servingsRequired
                : loadError === 'invalid-recipe-yield'
                  ? messages.invalidRecipeYield
                  : loadError === 'storage'
                    ? messages.loadFailed
                    : messages.unexpected}
        </p>
      )}
      {snapshot && groups.length === 0 && <p role="status">{messages.empty}</p>}
      {snapshot && groups.length > 0 && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !pending) setSnapshot(null);
          }}
        >
          <h2 ref={heading} tabIndex={-1}>
            {messages.review}: {snapshot.menu.name} — {snapshot.menu.startDate}
          </h2>
          {snapshot.menu.servings !== null && <p>{messages.scaling(snapshot.menu.servings)}</p>}
          {groups.map((group, index) => {
            const choice = choices.get(group.key) ?? {};
            const units = transferUnits(group);
            const selected =
              choice.target === null
                ? '__none__'
                : (choice.target ?? (units.length === 1 ? units[0] : '') ?? '');
            const autoChoice: TransferChoice =
              choice.target === undefined ? {} : { target: choice.target };
            const automatic = resolveTransferQuantity(group, autoChoice);
            const resolved = resolveTransferQuantity(group, choice);
            const manual = !automatic.ok && automatic.error === 'manual-required';
            const target = selected !== '__none__' && isUnitId(selected) ? selected : undefined;
            const needsAmount = target !== undefined && UNITS[target].takesAmount;
            const id = `transfer-${String(index)}`;
            return (
              <fieldset key={group.key} disabled={pending}>
                <legend>{group.name}</legend>
                <ul>
                  {group.contributions.map((contribution, contributionIndex) => {
                    const amount = contribution.scaledAmount;
                    const unit = contribution.quantity.unit;
                    const unitName =
                      amount && unit
                        ? amount.numerator === amount.denominator
                          ? shopping.units[unit].singular
                          : shopping.units[unit].plural
                        : undefined;
                    return (
                      <li key={contributionIndex}>
                        {contribution.source.kind === 'shopping'
                          ? messages.sourceShopping
                          : messages.sourceRecipe(
                              contribution.source.title,
                              contribution.source.assignment.dayOffset + 1,
                              planning.meals[contribution.source.assignment.meal],
                              contribution.source.yield,
                            )}
                        :{' '}
                        {formatQuantity(contribution.quantity, shopping.units) ??
                          messages.unspecified}
                        {contribution.source.kind === 'recipe' && (
                          <>
                            {' — '}
                            <span>
                              {amount && unitName
                                ? messages.scaledContribution(
                                    `${formatExactAmount(amount)} ${unitName}`,
                                  )
                                : messages.noScaledAmount}
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <label htmlFor={`${id}-unit`}>{messages.unit(group.name)}</label>
                <select
                  id={`${id}-unit`}
                  value={selected}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '__none__') {
                      setChoice(group.key, {
                        target: null,
                        manual: { amount: '', unit: undefined },
                      });
                    } else if (isUnitId(value)) {
                      const unit: UnitId = value;
                      setChoice(
                        group.key,
                        UNITS[unit].takesAmount
                          ? { target: unit }
                          : { target: unit, manual: { amount: '', unit } },
                      );
                    } else {
                      setChoice(group.key, {});
                    }
                  }}
                >
                  <option value="">{messages.chooseUnit}</option>
                  <option value="__none__">{messages.noQuantity}</option>
                  {sortedUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {shopping.units[unit].singular}
                    </option>
                  ))}
                </select>
                {manual && (
                  <>
                    <p>{messages.manual}</p>
                    {needsAmount ? (
                      <>
                        <label htmlFor={`${id}-amount`}>{messages.amount(group.name)}</label>
                        <input
                          id={`${id}-amount`}
                          inputMode="decimal"
                          value={choice.manual?.amount ?? ''}
                          onChange={(event) => {
                            setChoice(group.key, {
                              ...(choice.target === undefined ? {} : { target: choice.target }),
                              manual: { amount: event.target.value, unit: target },
                            });
                          }}
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setChoice(group.key, {
                            target: target ?? null,
                            manual: { amount: '', unit: target },
                          });
                        }}
                      >
                        {messages.acceptVague}
                      </button>
                    )}
                  </>
                )}
                {resolved.ok && (
                  <p>
                    {messages.proposed}:{' '}
                    {formatQuantity(resolved.value, shopping.units) ?? messages.unspecified}
                  </p>
                )}
                {invalid.has(group.key) && (
                  <p role="alert">
                    {resolved.ok
                      ? ''
                      : isQuantityError(resolved.error)
                        ? shopping.quantityErrors[resolved.error]
                        : messages.invalid}
                  </p>
                )}
              </fieldset>
            );
          })}
          <button type="submit" disabled={pending}>
            {messages.confirm}
          </button>{' '}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setSnapshot(null);
            }}
          >
            {messages.cancel}
          </button>
        </form>
      )}
    </section>
  );
}

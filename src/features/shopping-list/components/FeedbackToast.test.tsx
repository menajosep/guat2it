import { setupIonicReact } from '@ionic/react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FeedbackToast } from './FeedbackToast';

setupIonicReact();

const success = (id: number, message: string) => ({ id, kind: 'success' as const, message });

describe('FeedbackToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('dismisses a success message on its own after the configured time', () => {
    const onDismiss = vi.fn();
    render(
      <FeedbackToast
        feedback={success(1, 'Added Milk')}
        onDismiss={onDismiss}
        successDurationMs={1000}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Added Milk');
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps an error message until the user dismisses it', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <FeedbackToast
        feedback={{ id: 1, kind: 'error', message: 'Could not save.' }}
        onDismiss={onDismiss}
        successDurationMs={1000}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Could not save.');
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    const dismiss = container.querySelector('ion-button');
    if (!dismiss) throw new Error('expected a dismiss button');
    fireEvent.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when a newer message replaces the current one', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <FeedbackToast
        feedback={success(1, 'Added Milk')}
        onDismiss={onDismiss}
        successDurationMs={1000}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(800);
    });
    rerender(
      <FeedbackToast
        feedback={success(2, 'Removed Milk')}
        onDismiss={onDismiss}
        successDurationMs={1000}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Milk');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

import { IonButton, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useEffect } from 'react';
import type { Feedback } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

export const SUCCESS_FEEDBACK_DURATION_MS = 4000;

interface FeedbackToastProps {
  feedback: Feedback | null;
  onDismiss: () => void;
  successDurationMs?: number;
}

/**
 * Shows the outcome of the latest operation. Success messages dismiss themselves; errors stay
 * until dismissed. The status region is always mounted so screen readers announce its updates.
 */
export function FeedbackToast({
  feedback,
  onDismiss,
  successDurationMs = SUCCESS_FEEDBACK_DURATION_MS,
}: FeedbackToastProps) {
  const messages = useShoppingListMessages();
  const feedbackId = feedback?.id;
  const isSuccess = feedback?.kind === 'success';

  useEffect(() => {
    if (feedbackId === undefined || !isSuccess) return undefined;
    const timer = setTimeout(onDismiss, successDurationMs);
    return () => {
      clearTimeout(timer);
    };
  }, [feedbackId, isSuccess, onDismiss, successDurationMs]);

  return (
    <div className="feedback-region">
      <div role="status">
        {feedback?.kind === 'success' && (
          <div className="feedback-toast feedback-toast-success">{feedback.message}</div>
        )}
      </div>
      {feedback?.kind === 'error' && (
        <div role="alert" className="feedback-toast feedback-toast-error">
          <span>{feedback.message}</span>
          <IonButton
            fill="clear"
            size="small"
            aria-label={messages.dismissMessage}
            onClick={onDismiss}
          >
            <IonIcon slot="icon-only" icon={closeOutline} aria-hidden="true" />
          </IonButton>
        </div>
      )}
    </div>
  );
}

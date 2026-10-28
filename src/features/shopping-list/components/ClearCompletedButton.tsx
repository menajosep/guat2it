import { IonAlert, IonButton } from '@ionic/react';
import { useState } from 'react';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

interface ClearCompletedButtonProps {
  completedCount: number;
  onConfirm: () => void;
}

/** Offers to remove all completed items; nothing is removed until the user confirms. */
export function ClearCompletedButton({ completedCount, onConfirm }: ClearCompletedButtonProps) {
  const messages = useShoppingListMessages();
  const dialog = messages.clearCompletedDialog;
  const [open, setOpen] = useState(false);
  // The count is frozen while the dialog is open so its text does not change as items are cleared.
  const [announcedCount, setAnnouncedCount] = useState(completedCount);

  if (completedCount === 0 && !open) return null;

  return (
    <>
      <IonButton
        fill="outline"
        color="danger"
        onClick={() => {
          setAnnouncedCount(completedCount);
          setOpen(true);
        }}
      >
        {messages.clearCompleted}
      </IonButton>
      <IonAlert
        isOpen={open}
        header={dialog.title}
        message={dialog.message(announcedCount)}
        buttons={[
          { text: dialog.cancel, role: 'cancel' },
          { text: dialog.confirm, role: 'confirm', handler: onConfirm },
        ]}
        onDidDismiss={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

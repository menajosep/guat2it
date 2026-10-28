import { IonText } from '@ionic/react';
import { useLanguage } from '../hooks/language-context';
import { LANGUAGE_MESSAGES } from '../messages/language-messages';

/** Tells the user that the chosen language works now but will not be remembered. */
export function LanguageNotice() {
  const { language, notRemembered } = useLanguage();
  if (!notRemembered) return null;

  return (
    <div role="alert">
      <IonText color="danger">
        <p>{LANGUAGE_MESSAGES[language].notRemembered}</p>
      </IonText>
    </div>
  );
}

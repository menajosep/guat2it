import { useState } from 'react';
import { isHttpsUrl } from '../domain/recipe';

export function RecipeImage({
  url,
  description,
  unavailable,
}: {
  url: string;
  description: string;
  unavailable: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!isHttpsUrl(url) || failed)
    return (
      <p role="img" aria-label={unavailable}>
        {unavailable}
      </p>
    );
  return (
    <img
      src={url}
      alt={description}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

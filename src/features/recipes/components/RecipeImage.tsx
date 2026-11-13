import { useState } from 'react';
import { isHttpsUrl } from '../domain/recipe';

export function RecipeImage({
  url,
  description,
  unavailable,
  thumbnail = false,
}: {
  url: string;
  description: string;
  unavailable: string;
  thumbnail?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!isHttpsUrl(url) || failed) {
    if (thumbnail)
      return (
        <span
          className="recipe-list__image recipe-list__fallback"
          role="img"
          aria-label={unavailable}
        >
          {unavailable}
        </span>
      );
    return (
      <p role="img" aria-label={unavailable}>
        {unavailable}
      </p>
    );
  }
  return (
    <img
      src={url}
      alt={description}
      className={thumbnail ? 'recipe-list__image' : undefined}
      loading={thumbnail ? 'lazy' : undefined}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

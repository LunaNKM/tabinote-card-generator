# Type check fix

## Fixed
- `InstagramCard.tsx` passes `exportMode` to `CardLogo`, `CardSource`, and `CardTextBlock`.
- Some repositories still had the older `CardLogo.tsx` type that only accepted `opacity`.
- This patch updates the card subcomponents so their prop types match `InstagramCard.tsx`.

## Verified
- `npm run build` passed locally after applying these files.

## Files
- `components/cards/CardLogo.tsx`
- `components/cards/CardSource.tsx`
- `components/cards/CardTextBlock.tsx`

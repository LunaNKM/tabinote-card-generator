# Next config build fix

Vercel/Next.js build failed because `next.config.ts` is not supported in this project setup.

## Apply steps

1. Upload `next.config.js` to the repository root.
2. Delete `next.config.ts` from the repository root.
3. Commit changes.
4. Redeploy on Vercel.

The repository root should contain `next.config.js`, not `next.config.ts`.

# Brightline landing site (Angular)

A responsive business landing page built with standalone Angular components:
navbar, hero, services, pricing (monthly/yearly toggle), contact form with validation, footer.

## Run it

Requires Node.js 20.19+ (or 22+).

```bash
npm install
npm start        # dev server at http://localhost:4200
npm run build    # production build in dist/
```

## Customize

- Company name, copy and plans: edit the components in `src/app/`
- Colors and fonts: CSS variables at the top of `src/styles.css`
- Contact form: `submit()` in `src/app/contact.ts` currently logs to the console;
  replace the TODO with a call to your backend or a form service.

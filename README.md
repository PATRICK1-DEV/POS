# POS

A simple point-of-sale (POS) web app for a Tanzanian retail shop, localized in Swahili (TZS currency, 18% VAT, M-Pesa / Tigo Pesa / cash / card payments).

The application lives in [`POS System UI Design/`](./POS%20System%20UI%20Design).

## Features

- **Duka** — browse/filter products, scan barcodes, build a cart, and check out.
- **Historia** — list of completed sales with line items, totals, and payment method.
- **Ripoti** — sales totals, VAT collected, top-selling products, and low-stock alerts.
- **Mipango** — store and cashier details.

Stock decrements automatically after each completed sale, and out-of-stock items are disabled.

## Tech stack

Vite + React 18 + TypeScript + Tailwind CSS v4.

## Getting started

```bash
cd "POS System UI Design"
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run typecheck  # type-check only
```

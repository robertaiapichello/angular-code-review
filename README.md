# Angular code review: conti del cliente

Mini app (Angular 22, zoneless) per il colloquio tecnico. Il candidato rivede il codice come se fosse una pull request.

## Avvio

```bash
npm install
npm start
```

L'app si apre su `/customer-detail/42` e usa un backend finto, quindi non serve nessun server.

## Cosa mostrare al candidato

Solo la cartella `src/app/customer/`:

- `customer-accounts.component.ts` (file principale)
- `customer-context.service.ts`
- `abstract-list.component.ts`
- `highlight-tooltip.directive.ts`
- `models.ts`
- `account-chart.component.ts` (non è oggetto di review)

## Da non mostrare

- `src/app/infra/`: backend finto (le risposte della ricerca arrivano fuori ordine di proposito, così la race condition di `mergeMap` si vede nel browser).
- `app.ts`, `app.config.ts`, `app.routes.ts`: infrastruttura.

Le diagnostiche estese del compilatore sono disattivate in `tsconfig.json`, altrimenti il compilatore segnalerebbe da solo alcuni problemi (per esempio il signal non invocato nel template).

## Prove utili durante il colloquio

- Scrivi nella ricerca "conto" lettera per lettera: i risultati si accumulano e le risposte arrivano in disordine.
- Clicca "Dettaglio": errore NG0203 in console.
- All'avvio osserva se i conti compaiono: lo stato è mutabile in un componente OnPush senza zone.

Nota: il build passa senza errori, ma il comportamento nel browser non è stato verificato. Provalo una volta prima del colloquio.

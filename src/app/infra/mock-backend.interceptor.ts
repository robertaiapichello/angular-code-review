// INFRASTRUTTURA: backend finto per far girare l'app senza server.
// Non è oggetto di review (nascondilo al candidato).
import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { Account } from '../customer/models';

const ACCOUNTS: Account[] = [
  { id: 1, iban: 'IT60X0542811101000000123456', name: 'Conto corrente', status: 'active', balance: 12450.8, currency: 'EUR' },
  { id: 2, iban: 'IT28W8000000292100645211208', name: 'Conto risparmio', status: 'active', balance: 30210.0, currency: 'EUR' },
  { id: 3, iban: 'IT02L1234512345123456789012', name: 'Conto deposito', status: 'closed', balance: 0, currency: 'EUR' },
  { id: 4, iban: 'IT45R0300203280845187946313', name: 'Conto estero USD', status: 'active', balance: 5400.25, currency: 'USD' },
  { id: 5, iban: 'IT81V0306909606100000063159', name: 'Conto cointestato', status: 'active', balance: 980.1, currency: 'EUR' },
  { id: 6, iban: 'IT17A0200802006000103891547', name: 'Conto estinto', status: 'closed', balance: 0, currency: 'EUR' },
];

function reply<T>(body: T, ms: number): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(ms));
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const url = new URL(req.url, 'http://localhost');

  if (/^\/api\/customers\/[^/]+\/accounts$/.test(url.pathname)) {
    return reply(ACCOUNTS, 400);
  }

  if (url.pathname === '/api/accounts') {
    const term = (url.searchParams.get('q') ?? '').toLowerCase();
    const result = ACCOUNTS.filter(a => a.name.toLowerCase().includes(term));
    // Più il termine è corto, più la risposta è lenta: le risposte
    // arrivano fuori ordine e la race condition si vede davvero.
    return reply(result, Math.max(100, 1200 - term.length * 250));
  }

  const total = url.pathname.match(/^\/api\/accounts\/(\d+)\/total$/);
  if (total) {
    const account = ACCOUNTS.find(a => a.id === Number(total[1]));
    return reply(account?.balance ?? 0, 200);
  }

  return next(req);
};

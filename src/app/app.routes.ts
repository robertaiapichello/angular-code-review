// INFRASTRUTTURA: non è oggetto di review.
import { Routes } from '@angular/router';
import { CustomerAccountsComponent } from './customer/customer-accounts.component';

export const routes: Routes = [
  { path: 'customer-detail/:personUid', component: CustomerAccountsComponent },
  { path: '**', redirectTo: 'customer-detail/42' },
];

import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, Input,
  effect, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { mergeMap } from 'rxjs';
import { Account } from './models';
import { AbstractListComponent } from './abstract-list.component';
import { CustomerContextService } from './customer-context.service';
import { AccountChartComponent } from './account-chart.component';
import { HighlightTooltipDirective } from './highlight-tooltip.directive';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    AccountChartComponent, HighlightTooltipDirective,
  ],
  providers: [CustomerContextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .mat-mdc-card { padding: 0 !important; }
  `],
  template: `
    <input [formControl]="search" placeholder="Cerca conto" />

    <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
      <option value="all">Tutti</option>
      <option value="active">Attivi</option>
    </select>

    <p>Aggiornato alle {{ ctx.lastUpdate | date: 'HH:mm' }}</p>
    <p>Totale conti: {{ filteredCount }}</p>

    <div *ngIf="loading">Caricamento...</div>

    <div *ngFor="let account of filtered" [appHighlightTooltip]="account.iban">
      {{ account.name }}: {{ formatBalance(account) }}
      <button (click)="select(account)">Dettaglio</button>
    </div>

    <app-account-chart [accounts]="accounts" />
  `,
})
export class CustomerAccountsComponent extends AbstractListComponent<Account> implements OnInit {
  @Input() customerType = 'retail';
  @Output() accountSelected = new EventEmitter<Account>();

  ctx = inject(CustomerContextService);
  private http = inject(HttpClient);

  search = new FormControl('');
  statusFilter = 'all';
  accounts: Account[] = [];
  filtered: Account[] = [];

  selectedAccount = signal<Account | null>(null);
  filteredCount = signal(0);

  constructor() {
    super();
    effect(() => {
      this.filteredCount.set(
        this.selectedAccount() ? this.filtered.length : this.accounts.length,
      );
    });
  }

  ngOnInit() {
    this.load();

    this.search.valueChanges
      .pipe(mergeMap(term => this.http.get<Account[]>(`/api/accounts?q=${term}`)))
      .subscribe(result => {
        this.accounts.push(...result);
        this.applyFilters();
      });
  }

  load() {
    this.loading = true;
    this.ctx.personUid$.subscribe(uid => {
      this.http.get<Account[]>(`/api/customers/${uid}/accounts`).subscribe(accounts => {
        this.accounts = accounts;
        this.items = accounts;
        this.applyFilters();
        this.loading = false;
      });
    });
  }

  applyFilters() {
    this.filtered = this.accounts.filter(
      a => this.statusFilter === 'all' || a.status === this.statusFilter,
    );
  }

  formatBalance(account: Account): string {
    return `${account.balance.toFixed(2)} ${account.currency}`;
  }

  select(account: Account) {
    this.selectedAccount.set(account);
    this.accountSelected.emit(account);
    const total = toSignal(this.http.get<number>(`/api/accounts/${account.id}/total`));
  }
}

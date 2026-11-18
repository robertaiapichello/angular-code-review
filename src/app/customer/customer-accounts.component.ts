import {
  ChangeDetectionStrategy, Component, EventEmitter, Injectable, NgZone, OnInit, Output, Input,
  effect, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, mergeMap } from 'rxjs';
import { Account } from './models';
import { AccountChartComponent } from './account-chart.component';

@Injectable()
export class CustomerContextService {
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);

  personUid$ = new BehaviorSubject<string>('');
  lastUpdate = new Date();

  constructor() {
    this.route.params.subscribe(p => this.personUid$.next(p['personUid']));

    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.zone.run(() => (this.lastUpdate = new Date()));
      }, 30000);
    });
  }
}

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AccountChartComponent],
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

    <div *ngFor="let account of filtered">
      {{ account.name }}: {{ formatBalance(account) }}
      <button (click)="select(account)">Dettaglio</button>
    </div>

    <app-account-chart [accounts]="accounts" />
  `,
})
export class CustomerAccountsComponent implements OnInit {
  @Input() customerType = 'retail';
  @Output() accountSelected = new EventEmitter<Account>();

  ctx = inject(CustomerContextService);
  private http = inject(HttpClient);

  search = new FormControl('');
  statusFilter = 'all';
  loading = false;
  accounts: Account[] = [];
  filtered: Account[] = [];

  selectedAccount = signal<Account | null>(null);
  filteredCount = signal(0);

  constructor() {
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

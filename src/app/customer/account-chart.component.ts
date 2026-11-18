// Componente pesante basato su una libreria di grafici:
// non è oggetto di review, serve solo per capire come viene usato.
import { Component, Input } from '@angular/core';
import { Account } from './models';

@Component({
  selector: 'app-account-chart',
  standalone: true,
  template: `<canvas></canvas>`,
})
export class AccountChartComponent {
  @Input() accounts: Account[] = [];
}

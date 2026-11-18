import { Injectable, NgZone, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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

import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class AbstractListComponent<T> implements OnDestroy {
  items: T[] = [];
  loading = false;
  protected destroy$ = new Subject<void>();

  abstract load(): void;

  ngOnDestroy() {
    this.destroy$.next();
  }
}

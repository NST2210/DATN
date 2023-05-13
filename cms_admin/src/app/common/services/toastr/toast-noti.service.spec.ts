import { TestBed } from '@angular/core/testing';

import { ToastNotiService } from './toast-noti.service';

describe('ToastNotiService', () => {
  let service: ToastNotiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastNotiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

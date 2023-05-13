import { TestBed } from '@angular/core/testing';

import { LangAppService } from './lang-app.service';

describe('LangAppService', () => {
  let service: LangAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LangAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

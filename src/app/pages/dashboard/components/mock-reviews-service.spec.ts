import { TestBed } from '@angular/core/testing';

import { MockReviewsService } from './mock-reviews-service';

describe('MockReviewsService', () => {
  let service: MockReviewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockReviewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

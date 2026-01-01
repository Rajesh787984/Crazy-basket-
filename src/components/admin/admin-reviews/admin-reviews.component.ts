
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Review } from '../../../models/review.model';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewsComponent {
  stateService = inject(StateService);
  reviews = this.stateService.userReviews;

  deleteReview(review: Review) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.stateService.deleteReview(review);
    }
  }
}

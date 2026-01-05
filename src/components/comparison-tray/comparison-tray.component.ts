
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-comparison-tray',
  templateUrl: './comparison-tray.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonTrayComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  comparisonList = this.stateService.comparisonList;

  comparisonProducts = computed(() => {
    return this.comparisonList()
      .map(id => this.productService.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  });

  placeholderSlots = computed(() => {
    const count = 4 - this.comparisonList().length;
    return Array(Math.max(0, count));
  });
}

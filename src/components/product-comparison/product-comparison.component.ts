
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-comparison',
  templateUrl: './product-comparison.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComparisonComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  comparisonProducts = computed(() => {
    return this.stateService.comparisonList()
      .map(id => this.productService.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  });
}

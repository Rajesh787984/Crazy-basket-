import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Firestore, collection, getDocs, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  stateService = inject(StateService);
  private firestore = inject(Firestore);

  products: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadProducts();
  }

  // 1. फायरबेस से असली प्रोडक्ट्स मंगाने का कोड
  async loadProducts() {
    this.loading = true;
    try {
      const colRef = collection(this.firestore, 'products'); // 'products' फोल्डर चेक करेगा
      const snapshot = await getDocs(colRef);
      
      this.products = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.loading = false;
    }
  }

  // 2. नया प्रोडक्ट ऐड करने के लिए फॉर्म पर भेजें
  addProduct() {
    this.stateService.navigateToAdminView('product-form');
  }

  // 3. प्रोडक्ट एडिट करने के लिए
  editProduct(product: any) {
    this.stateService.productToEdit.set(product);
    this.stateService.navigateToAdminView('product-form');
  }

  // 4. प्रोडक्ट डिलीट करने का असली कोड
  async deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const docRef = doc(this.firestore, 'products', productId);
        await deleteDoc(docRef); // डेटाबेस से उड़ा देगा
        
        // लिस्ट को रिफ्रेश करें ताकि डिलीट हुआ प्रोडक्ट हट जाए
        this.loadProducts(); 
        this.stateService.showToast('Product deleted from Database.');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Could not delete product.');
      }
    }
  }

  getInStockCount(product: any): number {
    return product.sizes ? product.sizes.filter((s: any) => s.inStock).length : 0;
  }
}
  }

  getInStockCount(product: Product): number {
    return product.sizes.filter(s => s.inStock).length;
  }
}

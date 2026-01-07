import { Injectable, inject, computed } from '@angular/core';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private stateService: StateService = inject(StateService);

  private translations: Record<string, any> = {
    en: {
      nav: {
        home: 'Home',
        categories: 'Categories',
        wishlist: 'Wishlist',
        profile: 'Profile',
      },
      profile: {
        edit: 'Edit Profile',
        admin: 'ADMIN PANEL',
        orders: 'Orders',
        returns: 'Returns & Exchanges',
        coupons: 'My Coupons',
        wallet: 'Wallet',
        balance: 'Balance',
        partner: 'Partner Income Program',
        addresses: 'Addresses',
        language: 'Language Settings',
        privacy: 'Privacy Policy',
        contact: 'Contact Us',
        faq: 'FAQs',
        logout: 'LOG OUT',
      },
      returns: {
        request_return: 'Request Return',
        reason: 'Reason for Return',
        comments: 'Comments',
        upload_photo: 'Upload Photo',
        submit_request: 'Submit Request',
        return_status: 'Return Status',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      }
    }
  };

  private currentTranslations = computed(() => {
    const lang = this.stateService.currentLanguage();
    return this.translations[lang] || this.translations['en'];
  });

  public translate(key: string): string {
    const keys = key.split('.');
    let result = this.currentTranslations();
    try {
      for (const k of keys) {
        result = result[k];
      }
      return result || key;
    } catch (e) {
      return key;
    }
  }
}
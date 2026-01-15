import { Injectable, inject, computed, Signal } from '@angular/core';
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
        live_chat: 'Live Chat',
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
    },
    hi: {
      nav: {
        home: 'होम',
        categories: 'श्रेणियाँ',
        wishlist: 'विशलिस्ट',
        profile: 'प्रोफ़ाइल',
      },
      profile: {
        edit: 'प्रोफ़ाइल संपादित करें',
        admin: 'एडमिन पैनल',
        orders: 'मेरे ऑर्डर',
        returns: 'रिटर्न और एक्सचेंज',
        coupons: 'मेरे कूपन',
        wallet: 'वॉलेट',
        balance: 'बैलेंस',
        partner: 'पार्टनर आय कार्यक्रम',
        addresses: 'पते',
        language: 'भाषा सेटिंग्स',
        privacy: 'गोपनीयता नीति',
        contact: 'हमसे संपर्क करें',
        faq: 'अक्सर पूछे जाने वाले प्रश्न',
        live_chat: 'लाइव चैट',
        logout: 'लॉग आउट करें',
      },
      returns: {
        request_return: 'रिटर्न का अनुरोध करें',
        reason: 'रिटर्न का कारण',
        comments: 'टिप्पणियाँ',
        upload_photo: 'फोटो अपलोड करें',
        submit_request: 'अनुरोध सबमिट करें',
        return_status: 'रिटर्न स्थिति',
        pending: 'लंबित',
        approved: 'स्वीकृत',
        rejected: 'अस्वीकृत'
      }
    }
  };

  private readonly currentTranslations: Signal<any>;

  constructor() {
    this.currentTranslations = computed(() => {
      const lang = this.stateService.currentLanguage();
      return this.translations[lang] || this.translations['en'];
    });
  }

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
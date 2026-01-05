
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Faq } from '../../../models/faq.model';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit {
  stateService: StateService = inject(StateService);
  // FIX: Explicitly type injected FormBuilder to resolve type inference issue.
  fb: FormBuilder = inject(FormBuilder);

  faqs = this.stateService.faqs;
  contactInfo = this.stateService.contactInfo;

  showFaqForm = signal(false);
  editingFaq = signal<Faq | null>(null);

  contactForm = this.fb.group({
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    upiId: [''],
    qrCodeImage: [''],
  });

  faqForm = this.fb.group({
    question: ['', Validators.required],
    answer: ['', Validators.required],
  });

  ngOnInit() {
    this.contactForm.setValue(this.contactInfo());
  }

  saveContactInfo() {
    if (this.contactForm.valid) {
      this.stateService.updateContactInfo(this.contactForm.value as { address: string; email: string; phone: string; upiId: string; qrCodeImage: string; });
    }
  }

  editFaq(faq: Faq) {
    this.editingFaq.set(faq);
    this.faqForm.setValue({
      question: faq.question,
      answer: faq.answer,
    });
    this.showFaqForm.set(true);
  }

  newFaq() {
    this.editingFaq.set(null);
    this.faqForm.reset();
    this.showFaqForm.set(true);
  }

  saveFaq() {
    if (this.faqForm.invalid) {
      this.stateService.showToast('Please fill all fields for the FAQ.');
      return;
    }

    const editing = this.editingFaq();
    if (editing) {
      this.stateService.updateFaq({
        ...editing,
        ...this.faqForm.value,
      } as Faq);
    } else {
      this.stateService.addFaq(this.faqForm.value as { question: string, answer: string });
    }

    this.cancelFaqEdit();
  }
  
  deleteFaq(faqId: string) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
        this.stateService.deleteFaq(faqId);
    }
  }

  cancelFaqEdit() {
    this.editingFaq.set(null);
    this.faqForm.reset();
    this.showFaqForm.set(false);
  }
}

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Popup } from '../../../models/popup.model';

@Component({
  selector: 'app-admin-popups',
  templateUrl: './admin-popups.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPopupsComponent {
  stateService: StateService = inject(StateService);
  // FIX: Explicitly type injected FormBuilder to resolve type inference issue.
  fb: FormBuilder = inject(FormBuilder);

  popups = this.stateService.popups;
  showForm = signal(false);
  editingPopup = signal<Popup | null>(null);

  popupForm = this.fb.group({
    title: ['', Validators.required],
    imageUrl: ['', Validators.required],
    link: ['home', Validators.required],
    isActive: [false]
  });

  editPopup(popup: Popup) {
    this.editingPopup.set(popup);
    this.popupForm.setValue({
      title: popup.title,
      imageUrl: popup.imageUrl,
      link: popup.link,
      isActive: popup.isActive,
    });
    this.showForm.set(true);
  }

  newPopup() {
    this.editingPopup.set(null);
    this.popupForm.reset({ link: 'home', isActive: false });
    this.showForm.set(true);
  }

  savePopup() {
    if (this.popupForm.invalid) {
      this.stateService.showToast('Please fill all fields.');
      return;
    }

    const editing = this.editingPopup();
    const formValue = this.popupForm.getRawValue();

    if (editing) {
      this.stateService.updatePopup({
        ...editing,
        ...formValue,
      });
    } else {
      this.stateService.addPopup(formValue as Omit<Popup, 'id'>);
    }

    this.cancel();
  }
  
  deletePopup(popupId: string) {
    if (confirm('Are you sure you want to delete this popup?')) {
        this.stateService.deletePopup(popupId);
    }
  }

  cancel() {
    this.editingPopup.set(null);
    this.popupForm.reset();
    this.showForm.set(false);
  }
}
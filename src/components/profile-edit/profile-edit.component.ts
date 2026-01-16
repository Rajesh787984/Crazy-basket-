import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent implements OnInit {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);
  
  currentUser = this.stateService.currentUser;
  uploadedImage = signal<{ previewUrl: string } | null>(null);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        mobile: user.mobile
      });
    }
  }

  handlePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImage.set({
          previewUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.getRawValue();
      const payload: { name: string, mobile: string, photoUrl?: string } = {
        name: formValue.name!,
        mobile: formValue.mobile!
      };
      
      if (this.uploadedImage()) {
        payload.photoUrl = this.uploadedImage()!.previewUrl;
      }
      
      this.stateService.updateUser(payload);
    } else {
      this.stateService.showToast('Please fill all fields correctly.');
    }
  }

  cancel() {
    this.stateService.navigateTo('profile');
  }
}
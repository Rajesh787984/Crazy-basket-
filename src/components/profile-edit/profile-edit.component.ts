
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);
  
  currentUser = this.stateService.currentUser;

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

  saveProfile() {
    if (this.profileForm.valid) {
      this.stateService.updateUser(this.profileForm.value as { name: string, mobile: string });
    } else {
      this.stateService.showToast('Please fill all fields correctly.');
    }
  }

  cancel() {
    this.stateService.navigateTo('profile');
  }
}

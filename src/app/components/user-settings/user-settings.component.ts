import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from "../../shared/services/user";
import { Pass } from "../../shared/services/pass";
import { ToastService } from 'angular-toastify';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TasksService } from 'src/app/shared/services/tasks.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  user: any;
  public userForm!: FormGroup;
  private URL_REGEXP = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;
  tasksAmount: any;
  userTasks: any = this.taskService.userTasks;

  constructor(
    public authService: AuthService,
    public toastService: ToastService,
    private taskService: TasksService,
    private fb: FormBuilder
  ) {
   }

  async ngOnInit() {
    this.userForm = this.fb.group({
      displayname: [''],
      emailAddress: ['', Validators.email],
      photoURL: ['', Validators.pattern(this.URL_REGEXP)],
      newPassword: [''],
      currentPassword: ['', Validators.required]
    })
    this.user = this.authService.loggedInUser;
    console.log(`USER TASKS: ${this.userTasks}`)
  }

  async updateUser() {
    console.log(this.userForm)
    let updDisplayName = this.userForm.get('displayname')?.value || '';
    let updEmail = this.userForm.get('emailAddress')?.value || '';
    let updPhotoURL = this.userForm.get('photoURL')?.value || '';
    let updNewPassword = this.userForm.get('newPassword')?.value || '';
    let currentPassword = this.userForm.get('currentPassword')!.value;
    let uid = this.authService.loggedInUser.uid || '';

    let updUser: User = {
      uid: uid,
      email: updEmail,
      displayName: updDisplayName,
      photoURL: updPhotoURL,
      emailVerified: false,
      submittedTasks: { taskid: [] }
    }

    let authPass: Pass = {
      updatedPass: updNewPassword,
      currentPass: currentPassword
    }

    let response = await this.authService.updateUserHandler(updUser, authPass);

    this.userForm.reset();
  }

  getTaskCount() {

  }
}

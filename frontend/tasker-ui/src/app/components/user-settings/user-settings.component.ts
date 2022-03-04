import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TasksService } from 'src/app/shared/services/tasks.service';
import { User } from '../../shared/services/user';
import { Pass } from '../../shared/services/pass';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  PROFILE_UPDATE = 'Profile Updated!';
  PROFILE_UPD_ERROR = 'Oh No, something went wrong!';

  user: any;
  tasksAmount: number = 0;
  userTasks = this.taskService.userTasks;

  //Form Stuff
  public userForm: FormGroup;
  private URL_REGEXP = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;

  constructor(
    public authService: AuthService,
    public toastService: ToastService,
    private taskService: TasksService,
    private fb: FormBuilder
  ) {
    this.user = this.authService.loggedInUser;

    this.userForm = this.fb.group({
      displayname: [''],
      emailAddress: ['', Validators.email],
      photoURL: ['', Validators.pattern(this.URL_REGEXP)],
      newPassword: [''],
      currentPassword: ['', Validators.required]
    })
   }

  ngOnInit() {
    this.userTasks = this.taskService.userTasks;

    this.userTasks.subscribe( res => this.tasksAmount = res.length);
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
}

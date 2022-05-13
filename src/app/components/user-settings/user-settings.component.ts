import { Component, OnInit } from '@angular/core';
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
  userForm: any;
  tasksAmount: any;
  userTasks: any;

  constructor(
    public authService: AuthService,
    public toastService: ToastService,
    private taskService: TasksService
  ) { }

  async ngOnInit() {
    this.user = this.authService.loggedInUser;
    this.userTasks = this.taskService.userTasks;
  }

  updateUser() {
    this.toastService.success('updated!')
  }

  getTaskCount() {

  }
}

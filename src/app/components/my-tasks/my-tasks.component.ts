import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TasksService } from 'src/app/shared/services/tasks.service';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {

  myTasksArray: any;

  constructor(
    private route: ActivatedRoute,
    private taskService: TasksService,
    public authService: AuthService
    ) { }

  ngOnInit() {

    this.myTasksArray = this.taskService.userTasks;

  }

}

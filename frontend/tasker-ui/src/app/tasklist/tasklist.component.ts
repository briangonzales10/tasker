import { renderFlagCheckIfStmt } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { TasksService } from '../shared/services/tasks.service';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent implements OnInit {

  // tasksList = this.taskService.getTasks();
  publicTasks: any;
  publicTasksArray: any[] = []


  constructor(
    private route: ActivatedRoute,
    private taskService: TasksService,
    public authService: AuthService
    ) { }

  async ngOnInit(): Promise<void> {
    const routeParams = this.route.snapshot.routeConfig?.path;
    console.log('route => ' + routeParams);
    if (routeParams === '') {
      this.publicTasks = await this.getPublicTasks();
    }
    else if (routeParams === 'my-tasks') {
      this.publicTasks = await this.getAllUserTasks();
    }

  }

  async getPublicTasks() {
    (await this.taskService.getTasks())
    .subscribe({
      next: (results => {
        console.log(results)
        results.forEach( (task) => {
          if (task.data.isPublic == true) {
            this.publicTasksArray.push(task)
          }
        })
            }),
      error: ( (err) => {
        console.log(err)
      })
      })
    }
  
  async getAllUserTasks() {
    (await this.taskService.getUserTasks())
    .subscribe({
      next: (results => {
        console.log(results)
        results.forEach( (task) => {
            this.publicTasksArray.push(task)
          
        })
            }),
      error: ( (err) => {
        console.log(err)
      })
      })
  }
}


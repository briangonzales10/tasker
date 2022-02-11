import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { TasksService } from '../shared/services/tasks.service';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent implements OnInit {

  tasksList = this.taskService.getTasks();
  publicTasks = this.getPublicTasks()
  publicTasksArray: any[] = []


  constructor(
    private taskService: TasksService,
    private authService: AuthService) { }

  ngOnInit(): void {
  }

  getPublicTasks() {
    this.taskService.getTasks()
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
  
}


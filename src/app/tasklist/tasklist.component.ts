import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { TasksService } from '../shared/services/tasks.service';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent implements OnInit {

  publicTasksArray: any = this.taskService.allTasks;
 

  constructor(
    private taskService: TasksService,
    public authService: AuthService
    ) {}

  ngOnInit() {
  }

  filterListBy(event: any) {
    console.log(`Filter: ${event}`)
  }

  sortListBy(event: any) {
    console.log(`Sort: ${event}`)
  }

}


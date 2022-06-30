import { Component, OnInit } from '@angular/core';
import { Subject, Observable, map } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { TasksService } from '../shared/services/tasks.service';
import { TaskType } from '../shared/services/tasktype';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent implements OnInit {

  publicTasksArray: any = this.taskService.allTasks;
  displayedArray = new Subject<TaskType[]>;
  displayedArrayObs!: Observable<TaskType[]>;

  constructor(
    private taskService: TasksService,
    public authService: AuthService
    ) {}

  ngOnInit() {
    this.displayedArray.next(this.publicTasksArray);
    this.displayedArrayObs = this.displayedArray.asObservable();
  }

  filterListBy(event: any) {
    console.log(`Test: ${this.displayedArray}`)
    this.displayedArrayObs.pipe(
      map( tasks => event === 'ALL'?
       tasks : tasks.filter( task => task.data.status === event))
    )
    .subscribe(res => {
      console.log(`Filtered by ${event}`);
      console.log(`Response:`)
      res.forEach((task) => console.log(task))
      this.displayedArray.next(res);
    })
  }

  sortListBy(event: any) {

    this.displayedArrayObs.pipe(
      map( tasks => tasks.sort( (a:TaskType, b: TaskType) =>
      event === 'asc'? 
      b.data.timestamp._seconds - a.data.timestamp._seconds :
      a.data.timestamp._seconds - b.data.timestamp._seconds
      ))
    )
    .subscribe(res => console.log(`Sort by ${event}`))
    
  }
}


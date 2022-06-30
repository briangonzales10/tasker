import { 
  ChangeDetectorRef, 
  Component, OnInit, 
  ChangeDetectionStrategy,
  NgZone  } from '@angular/core';
import { BehaviorSubject, Observable, map, Subject } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { TasksService } from '../shared/services/tasks.service';
import { TaskType } from '../shared/services/tasktype';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TasklistComponent implements OnInit {

  publicTasksArray: Observable<TaskType[]> = this.taskService.allTasks;
  displayedArray: TaskType[] = [];
  dispSubject = new BehaviorSubject<TaskType[]>([]);

  constructor(
    private taskService: TasksService,
    public authService: AuthService,

    ) {}

  ngOnInit() {
    this.publicTasksArray.subscribe( tasks => {
      this.displayedArray = tasks;
    });
    this.dispSubject.next(this.displayedArray)
  }

  filterListBy(event: any) {
    //console.log(`Test: ${this.displayedArray}`)
    this.publicTasksArray.pipe(
      map( tasks => event === 'ALL'?
       tasks : tasks.filter( task => task.data.status === event))
    )
    .subscribe(res => {
      console.log(`Filtered by ${event}`);
      console.log(`Response:`)
      res.forEach((task) => console.log(task))
      this.dispSubject.next(res)
    })
  }

  sortListBy(event: any) {

    this.publicTasksArray.pipe(
      map( tasks => tasks.sort( (a:TaskType, b: TaskType) =>
      event === 'asc'? 
      b.data.timestamp._seconds - a.data.timestamp._seconds :
      a.data.timestamp._seconds - b.data.timestamp._seconds
      ))
    )
    .subscribe(res => {
      this.dispSubject.next(res);
      console.log(`Sort by ${event}`)})
    
  }
}


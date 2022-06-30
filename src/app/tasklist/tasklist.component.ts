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

  publicTasksArray: any = this.taskService.allTasks;
  displayedArray: Observable<TaskType[]> = this.publicTasksArray;

  constructor(
    private taskService: TasksService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
    ) {}

  ngOnInit() {
  }

  filterListBy(event: any) {
    //console.log(`Test: ${this.displayedArray}`)
    this.displayedArray.pipe(
      map( tasks => event === 'ALL'?
       tasks : tasks.filter( task => task.data.status === event))
    )
    .subscribe(res => {
      console.log(`Filtered by ${event}`);
      console.log(`Response:`)
      res.forEach((task) => console.log(task))
      this.cdr.detectChanges()
    })
  }

  sortListBy(event: any) {

    this.displayedArray.pipe(
      map( tasks => tasks.sort( (a:TaskType, b: TaskType) =>
      event === 'asc'? 
      b.data.timestamp._seconds - a.data.timestamp._seconds :
      a.data.timestamp._seconds - b.data.timestamp._seconds
      ))
    )
    .subscribe(res => {
      console.log(`Sort by ${event}`)})
    
  }
}


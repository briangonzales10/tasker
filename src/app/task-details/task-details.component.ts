import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { Router } from '@angular/router';
import { TasksService } from '../shared/services/tasks.service';
import { CategoryTypes, TaskType } from '../shared/services/tasktype';
import {
  GoogleMap,
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { filter, Observable } from 'rxjs';
import { ToastService } from 'angular-toastify';
import { AuthService } from '../shared/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent implements OnInit {
  TASK_DELETED: string = 'Task Deleted!';
  TASK_UPDATED: string = 'Task has been updated!';
  TASK_ERROR: string = 'Sorry! Something went wrong';

  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  infoContent = '';
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  isAdmin: boolean = false;

  //Task Data
  singleTask!: TaskType;
  mytask = {};
  mytaskProofImage: any;
  myCategory: any;
  coords: any;

  //Google Maps stuff.

  myLat = 38; // Default lat long for map center is DC
  myLong = -76;
  myTaskName!: string;
  address: any = '';

  zoom = 15;
  center: google.maps.LatLngLiteral = {
    lat: this.myLat,
    lng: this.myLong,
  };
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    maxZoom: 20,
    minZoom: 1,
  };

  svgMarker = this.pinSymbol('red');

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
    clickable: true,
    icon: this.svgMarker,
  };

  markerPositions: google.maps.LatLngLiteral[] = [];
  markerLabel: google.maps.MarkerLabel = {
    text: ' ',
    className: 'marker_position_label',
  };

  //GEOCODE Stuff

  addressResult: Observable<Object> | undefined;
  navigationEnd!: NavigationEnd

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    public toastService: ToastService,
    public authService: AuthService,
    public router: Router
  ) {}

  async ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
    let taskIdFromRoute = routeParams.get('taskId') || '';
    console.log('Route URL1: ' + this.router.url)
    let urlpieces = this.router.url.split("/")
    console.log(urlpieces[-1])
    if (taskIdFromRoute === null || taskIdFromRoute === undefined) {
      console.log('Route URL2: ' + this.router.url)
    }

    if (taskIdFromRoute !== null && taskIdFromRoute !== '') {
      let response = this.tasksService.getSingleTask(taskIdFromRoute)
      if (response != undefined) {
        this.singleTask = response;
        this.myCategory = this.parseCategoryType(this.singleTask.data.category);
        this.initMap();
      } else {
        console.log(response)
        this.toastService.error(this.TASK_ERROR);
      }
    }
    this.editAllowed();
  }

  async initMap() {
    let updatedCoords;

    if (!this.singleTask.data.location.address) {
      this.myLat = this.singleTask.data.location.latitude;
      this.myLong = this.singleTask.data.location.longitude;
    } else {
      try {
        updatedCoords = await this.tasksService.getCoords(
          this.singleTask.data.location.address
        );
        this.myLat = updatedCoords.lat;
        this.myLong = updatedCoords.lng;
      } catch (err) {
        console.warn(err);
      }
    }
    this.center = {
      lat: this.myLat,
      lng: this.myLong,
    };
    this.markerPositions.push({
      lat: this.myLat,
      lng: this.myLong,
    });

    this.myTaskName = this.singleTask.data.taskname;
    console.log(this.myTaskName);

    this.markerPositions.push({ lat: this.myLat, lng: this.myLong });
    this.markerLabel.text = this.singleTask.data.taskname;

    try {
      this.address = await this.tasksService.getTaskAddress(
        this.myLat,
        this.myLong
      );
      console.log('address:');
      console.log(this.address.formatted_address);
      this.infoContent = this.address.formatted_address;
    } catch (err) {
      console.log(err);
    }
    
    this.mytaskProofImage = this.singleTask.data.proof.proofURL;
    if (this.mytaskProofImage == null) {
      this.mytaskProofImage = '/assets/brokenimage.png'
    }
  }

  openInfo(marker: MapMarker) {
    this.infoWindow.open(marker);
    console.log(marker);
  }
  setInfo(content: string) {
    this.infoContent = content;
    console.log('INFO CONTENT: ' + this.infoContent);
  }

  editAllowed() {
    let uid = this.authService.loggedInUser.uid || '0'
    if (
      this.authService.isLoggedIn === true && uid === environment.adminUid
    ) {
      this.isAdmin = true;
      console.log("Admin Logged in")
    }
  }

  deleteConfirm() {
    this.tasksService.deleteTask(this.singleTask.taskid);
    this.toastService.warn(this.TASK_DELETED);
    this.router.navigate(['/']);
  }

  statusChange(updatedStatus: string) {
    let response = this.tasksService.updateTask(
      this.singleTask.taskid,
      updatedStatus
    );
    this.toastService.info(this.TASK_UPDATED);
  }

  parseCategoryType(typeString: string): string {
    let displayedCategory = ''
    switch(typeString) {
      case CategoryTypes.Food:
        displayedCategory = 'Food & Drink';
        break;
      case CategoryTypes.Entertainment:
        displayedCategory = 'Entertainment'
        break;
      case CategoryTypes.Experience:
        displayedCategory = 'Experience'
        break;
      case CategoryTypes.Landmark:
        displayedCategory = 'Landmark or Place'
        break;
      case CategoryTypes.Travel:
        displayedCategory = 'Travel'
        break;
      case CategoryTypes.Other:
        displayedCategory = 'Other'
        break;
    }
    return displayedCategory;
  }

  isEmpty(value: any):boolean {
    return (value == '' || value == null)
  }

  pinSymbol(color: string) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
        // anchor: new google.maps.Point(10, 34),
        labelOrigin: new google.maps.Point(15, 15),
   };
  }
}

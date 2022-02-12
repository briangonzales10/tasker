import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TasksService } from '../shared/services/tasks.service';
import { TaskType } from '../shared/services/tasktype';
import { GoogleMap, GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow
  infoContent = ''
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap


  //Task Data
  singleTask!: TaskType
  mytask = {}
  coords:any 


  //Google Maps stuff.

  myLat = 38; // Default lat long for map center is DC
  myLong = -76;
  myTaskName!: string;
  address: any = '';

  zoom = 15;
  center: google.maps.LatLngLiteral = {
    lat: this.myLat,
    lng: this.myLong
  }
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    maxZoom: 20,
    minZoom: 1,
  }
  svgPath = "M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z"
  svgMarker = {
    path: this.svgPath,
    fillColor: "red",
    fillOpacity: 0.9,
    strokeWeight: 1,
    rotation: 0,
    scale: 1.5,
    //anchor: new google.maps.Point(0, 0),
    labelOrigin: new google.maps.Point(15,-10)
  };

  markerOptions: google.maps.MarkerOptions = { 
    draggable: false,
    animation: google.maps.Animation.DROP,
    clickable: true,
    icon: this.svgMarker
  }

  markerPositions: google.maps.LatLngLiteral[] = [];
  markerLabel: google.maps.MarkerLabel = { 
    text: ' ',
    className: 'marker_position_label'
  }

  //GEOCODE Stuff

  addressResult: Observable<Object> | undefined;



  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    public toastService: ToastService
    ) {
  }
   
  async ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
    const taskIdFromRoute = routeParams.get('taskId');
    if (taskIdFromRoute !== null) {
      this.tasksService.getSingleTask(taskIdFromRoute).subscribe((mdata => { 
        this.singleTask = mdata;
        console.log("MY DATA: ")
        console.log(this.singleTask)
        this.initMap();
      }))
    

    }

  }

  getCSSforStatus(status: string ) {
    let cssClass;
    switch (status.toLowerCase()) {
      case 'open':
        cssClass = 'border-dark';
        break;

      case 'complete':
        cssClass = 'border-success';
        break;
      
      case 'rejected':
        cssClass = 'border-danger';
        break;
      
      case 'abandonded':
        cssClass = 'border-warning';
        break;

      default:
        cssClass = 'border-dark';
    }

    return "card mx-3 mb-3 " + cssClass;
  }

  async initMap() {
    let updatedCoords
    
    if (!this.singleTask.data.location.address) {
      this.myLat = this.singleTask.data.location.latitude;
      this.myLong = this.singleTask.data.location.longitude;
    } else {
      try {
      updatedCoords = await this.tasksService.getCoords(this.singleTask.data.location.address)
      this.myLat = updatedCoords.lat;
      this.myLong = updatedCoords.lng;
      } catch (err) {
        console.warn(err)
      }
    }
    this.center = {
      lat: this.myLat,
      lng: this.myLong
    }
    this.markerPositions.push({
      lat: this.myLat,
      lng: this.myLong
    })

    this.myTaskName = this.singleTask.data.taskname;
    console.log(this.myTaskName)

    this.markerPositions.push({lat: this.myLat, lng: this.myLong})
    this.markerLabel.text = this.singleTask.data.taskname
    console.log("MARKER LABEL: ")
    console.log(this.markerLabel.text)
    try {
    this.address = await this.tasksService.getTaskAddress(this.myLat, this.myLong);
    console.log('address:')
    console.log(this.address.formatted_address);
    this.infoContent = this.address.formatted_address
    } catch (err) {
      console.log(err)
    }
  }

  openInfo(marker: MapMarker) {
    this.infoWindow.open(marker);
    console.log(marker);
  }
  setInfo(content: string) {
    this.infoContent = content;
    console.log("INFO CONTENT: " + this.infoContent)

  }
}

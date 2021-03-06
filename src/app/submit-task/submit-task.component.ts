import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubmitDataLocation, SubmitTask } from '../shared/services/submit-task';
import { ToastService } from 'angular-toastify';
import { TasksService } from '../shared/services/tasks.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { CategoryTypes } from '../shared/services/tasktype';

export interface markerProps {
  lat: any | undefined;
  lng: any | undefined;
  title: string | undefined;
  info: string | undefined;
  label: string | undefined;
}

@Component({
  selector: 'app-submit-task',
  templateUrl: './submit-task.component.html',
  styleUrls: ['./submit-task.component.css']
})
export class SubmitTaskComponent implements OnInit {
  @ViewChild('mapSearchField') searchField!: ElementRef;
  @ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) info!: MapInfoWindow;


  private TASK_ADD_ERROR:string = "Task could not be added!"
  public Category = CategoryTypes;
  //Google Map Stuff
  initialCoords: google.maps.LatLngLiteral = {
    lat: 38.890164884113375,
    lng: -77.03664364288409
  }

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    maxZoom: 20,
    minZoom: 1,
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: false
  }
  zoom = 12;

  markers = [] as any;
  infoContent = '';
  mapClass: any;

  //Form Stuff
  public taskForm!: FormGroup;
  public selectedCategory = '';
  private LINK_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

  uid: string = ''; //Will need to move this to a separate dataservice...

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private tasksService: TasksService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      taskname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      location: ['', Validators.required],
      remarks: ['', Validators.required],
      infolink: ['', Validators.pattern(this.LINK_REGEX)],
      isPublic: ['', Validators.required],
      category: ['']
    });

    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}')
    } catch (error) {
      console.warn(error)
    }
    this.uid = user.uid;
    
  }
//TODO: Update to extract Lat/Long data, and maybe address as well?
  ngAfterViewInit(): void {
    const searchBox = new google.maps.places.SearchBox(this.searchField.nativeElement);
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.searchField.nativeElement)
    
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (typeof( places ) === 'undefined' || places.length === 0) {
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      places.forEach( place => {
        if (!place.geometry || !place.geometry.location) {
          return;
        }
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport)
        } else {
          bounds.extend(place.geometry.location)
        }
        console.log(place.aspects)
        let props = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          title: '',
          info: 'Info',
          label: place.name
        }
        this.addMarker(props)
      });
      this.map.fitBounds(bounds)
    })
    
  }

  mapEventHandler(action: string, event: google.maps.MapMouseEvent) {
    console.log(event)

    if (action == 'mapClick') {
    
    let props = {
      lat: event.latLng?.lat(),
      lng: event.latLng?.lng(),
      title: 'Title',
      info: 'Info',
      label: 'Go Here'
      }
      this.addMarker(props)
    };
  };

  addMarker(props: markerProps) {
    this.markers = [];
    this.markers.push({
      position: {
        lat: props.lat,
        lng: props.lng
      },
      label: {
        color: 'black',
        text: props.label,
        fontWeight: 'bold'
      },
      title: props.title,
      info: props.info,
      options: {
        animation: google.maps.Animation.DROP
      }
    });

  }

  openInfo(marker: MapMarker, content: string) {
    this.infoContent = content;
    this.info.open(marker)
  }

selectCategoryHandler(event: any) {
  this.selectedCategory = event.target.value;
}

async submitTask() {
  let coords: any = {
    lat: '',
    lng: ''
  };

  try {
      coords = await this.tasksService.getCoords(this.searchField.nativeElement.value)
  } catch (err) {
    console.warn("could not get coords");
  }

  let userTaskname = this.taskForm.get('taskname')!.value;
  let userAddress = this.searchField.nativeElement.value;
  let userRemarks = this.taskForm.get('remarks')!.value;
  let userInfoLink = this.taskForm.get('infolink')?.value;
  let userIsPublic = this.taskForm.get('isPublic')?.value!;
  let userLocation: SubmitDataLocation = {
    address: userAddress,
    latitude: coords.lat, //will update lat + long later
    longitude: coords.lng
  };

  console.log("TaskName " + userTaskname);
  console.log("remarks: " + userRemarks);
  console.log("Category: " + this.selectedCategory)

  if (!userTaskname || !userRemarks) {
    return;
  };

  const postTask: SubmitTask = {
      taskname: userTaskname,
      remarks: userRemarks,
      infolink: userInfoLink,
      location: userLocation,
      isPublic: userIsPublic,
      category: this.selectedCategory,
      uid: this.uid,
  };
  console.log(postTask);
  let response = this.tasksService.submitTaskToDB(postTask)
  
  response.subscribe({
    next:  (res => { 
      this.toastButton('info', res);
      console.log(res)
    }),
    error: (err => {
      this.toastButton('error', "Something went wrong!");
      console.log(err);
    }),
  });
    
  this.resetForm();
}

  resetForm() {
    this.taskForm.reset();
    this.router.navigate(['/']);
  }

  toastButton(type: string, msg: string) {

    switch (type) {
      case 'info': this.toastService.info(msg);
        break;
      case 'warn': this.toastService.warn(msg);
        break;
      case 'success': this.toastService.success(msg);
        break;
      case 'error': this.toastService.error(msg);
        break;
      default: this.toastService.info(msg)
    }
  }

}

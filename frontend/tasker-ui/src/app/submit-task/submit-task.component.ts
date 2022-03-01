import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubmitDataLocation, SubmitTask } from '../shared/services/submit-task';
import { ToastService } from 'angular-toastify';
import { TasksService } from '../shared/services/tasks.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-submit-task',
  templateUrl: './submit-task.component.html',
  styleUrls: ['./submit-task.component.css']
})
export class SubmitTaskComponent implements OnInit {
  @ViewChild('mapSearchField') searchField!: ElementRef;
  @ViewChild(GoogleMap) map!: GoogleMap;

  private TASK_ADD_ERROR:string = "Task could not be added!"
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
    fullscreenControl: true
  }
  zoom = 12;

  //Form Stuff
  public taskForm: FormGroup;

  uid: string = ''; //Will need to move this to a separate dataservice...

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private tasksService: TasksService,
    private authService: AuthService
  ) {
      this.taskForm = this.fb.group({
        taskname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        location: ['', Validators.required],
        remarks: ['', Validators.required],
        isPublic: ['', Validators.required]
      })
   }

  ngOnInit(): void {
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
      });
      this.map.fitBounds(bounds)
    })
  }

  async submitTask() {

    const userToken = await this.authService.getToken();

    let coords: any = {
      lat: '',
      lng: ''
    }

    try {
        coords = await this.tasksService.getCoords(this.searchField.nativeElement.value)
    } catch (err) {
      console.warn("could not get coords")
    }

    let userTaskname = this.taskForm.get('taskname')!.value;
    let userAddress = this.searchField.nativeElement.value;
    let userRemarks = this.taskForm.get('remarks')!.value;
    let userIsPublic = this.taskForm.get('isPublic')?.value!;
    let userLocation: SubmitDataLocation = {
      address: userAddress,
      latitude: coords.lat, //will update lat + long later
      longitude: coords.lng
    }

    console.log("TaskName " + userTaskname)
    console.log("remarks: " + userRemarks)


    if (userTaskname !== null && userRemarks !== null) {
      

      const postTask: SubmitTask = {
          taskname: userTaskname,
          remarks: userRemarks,
          location: userLocation,
          isPublic: userIsPublic,
          uid: this.uid,
          tokenId: userToken
      }
      
      this.tasksService.submitTaskToDB(postTask)
      .subscribe({
        next: (res) => {
          this.toastButton('success', res)
          console.log(res)
        },
        error: (err) => {
          this.toastButton('error', this.TASK_ADD_ERROR)
          console.warn(err);
        
        }
      });  

  }
  this.resetForm();
}

  resetForm() {
    this.taskForm.reset()
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

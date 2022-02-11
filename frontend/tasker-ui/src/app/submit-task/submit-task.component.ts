import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService } from '../shared/services/backend.service';
import { SubmitDataLocation, SubmitTask } from '../shared/services/submit-task';

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

// taskname: string = '';
// location: any;
// remarks: string = '';
// isPublic: boolean = true;
uid: string = ''; //Will need to move this to a separate dataservice...

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService
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

  submitTask() {
  
    let userTaskname = this.taskForm.get('taskname')!.value;
    let userAddress = this.searchField.nativeElement.value;
    let userRemarks = this.taskForm.get('remarks')!.value;
    let userIsPublic = this.taskForm.get('isPublic')?.value!;
    let userLocation: SubmitDataLocation = {
      address: userAddress,
      latitude: 0, //will update lat + long later
      longitude: 0
    }

    console.log("TaskName " + userTaskname)
    console.log("remarks: " + userRemarks)


    if (userTaskname !== null && userRemarks !== null) {
      
      const postTask: SubmitTask = {
          taskname: userTaskname,
          remarks: userRemarks,
          location: userLocation,
          isPublic: userIsPublic,
          uid: this.uid
      }
      
      this.backendService.submitTaskToDB(postTask)
      .subscribe({
        next: (res) => {
          window.alert(res)
          console.log(res)
        },
        error: (err) => {
          window.alert(this.TASK_ADD_ERROR)
          console.warn(err);
        
        }
      });  

  }
  this.resetForm();
}

  resetForm() {
    console.log(this.taskForm.value)
    this.taskForm.reset()
    console.log("reset")
    console.log(this.taskForm.value)
  }

}

import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { icons } from './icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() title!: String;

  isAuthenticated!: boolean
  userDisplayName: any = '';

  navIcon:string = this.randomIcon();

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn;
    this.authService.fAuth.authState.subscribe({
      next: (user) => {
        if (user) {
          this.userDisplayName = user?.displayName;
          this.isAuthenticated = true;
        } else {
          this.isAuthenticated = false;
        }
      },
      error: (err) => console.warn(err)
    })
  }

  async logOut() {
    console.log("log out clicked");
    await this.authService.signOut();
    this.authService.fAuth.authState.subscribe({
      next: (user) => {
        if (!user) {
          this.isAuthenticated = false;
      }
    }
  })
  }

  randomIcon():string {
    let iconIndex = Math.floor(Math.random() * icons.length);
    console.log(icons[iconIndex]);
    return icons[iconIndex];
  }
}

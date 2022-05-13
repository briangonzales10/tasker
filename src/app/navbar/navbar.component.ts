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
  navIcon:string = this.randomIcon();

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn;
  }

  async logOut() {
    console.log("log out clicked");
    await this.authService.signOut();
    this.isAuthenticated = this.authService.isLoggedIn;

  }

  randomIcon():string {
    let iconIndex = Math.floor(Math.random() * icons.length);
    console.log(icons[iconIndex]);
    return icons[iconIndex];
  }
}

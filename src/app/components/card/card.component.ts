import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.css"],
})
export class CardComponent implements OnInit {
  @Input()
  picUrl: any;

  @Input()
  taskName!: string;

  @Input()
  remarks!: string;

  @Input()
  status!: string;

  @Input()
  taskId!: string;

  niceStatus: string = "";

  constructor() {}

  ngOnInit(): void {
    this.transformStatus();
  }

  transformStatus() {
    this.niceStatus =
      this.status.charAt(0).toUpperCase() + this.status.slice(1).toLowerCase();
  }
}

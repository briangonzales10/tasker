import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Output()
  filterBy = new EventEmitter<any>();

  @Output()
  sortBy = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  filterSelect(filter: any) {
    this.filterBy.emit(filter.target.value);
  };

  sortSelect(sort: any) {
    this.sortBy.emit(sort.target.value);
  };

}

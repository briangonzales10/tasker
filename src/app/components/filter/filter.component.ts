import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Output()
  filterBy = new EventEmitter();

  @Output()
  sortBy = new EventEmitter();

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

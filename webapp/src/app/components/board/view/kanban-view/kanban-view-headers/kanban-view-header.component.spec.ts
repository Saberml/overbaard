import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanViewHeaderComponent } from './kanban-view-header.component';
import {KanbanViewHeaderRowComponent} from './kanban-view-header-row.component';
import {KanbanViewComponent} from '../kanban-view.component';

describe('KanbanViewHeaderComponent', () => {
  let component: KanbanViewHeaderComponent;
  let fixture: ComponentFixture<KanbanViewHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KanbanViewHeaderComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanViewHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscussionComponent } from './component';
import { CourseDiscussService } from './services';
import { DiscussionService } from './services';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// #NUIH change Froala Rich Text Editor Module Imported:
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
// #NUIH change:
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot()
  ],
  providers: [CourseDiscussService, DiscussionService],
  exports: [DiscussionComponent],
  declarations: [DiscussionComponent]
})
export class DiscussionModule { }

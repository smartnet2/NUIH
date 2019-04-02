import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ResourceService, ConfigService, IUserProfile, IUserData, ToasterService } from '@sunbird/shared';
import { UserService } from '@sunbird/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as _ from 'lodash';
// import { Angular2Csv } from 'angular2-csv';
import { BatchService } from './../../services/batch/batch.service';

@Component({
  selector: 'app-frameworkread',
  templateUrl: './frameworkread.component.html',
  styleUrls: ['./frameworkread.component.css']
})
export class FrameworkreadComponent implements OnInit {
  frameworkId: any;
  /**
  * Reference of formgroup
  */
 frameworkreadForm: FormGroup;

  public batchService: BatchService;
  /**
 * reference of config service.
 */
  public config: ConfigService;
  /**
 * To show messages
 */
  public toasterService: ToasterService;
  showLoader: Boolean = false;
  constructor(private fb: FormBuilder, public resourceService: ResourceService, public userService: UserService,
    batchService: BatchService, config: ConfigService, toasterService: ToasterService) {
    this.batchService = batchService;
    this.config = config;
    this.toasterService = toasterService;
  }

  ngOnInit() {
    this.frameworkreadForm = new FormGroup({
      frameworkId: new FormControl('', [Validators.required])
    });
  }

  readFramework() {
    console.log('inside read framework============>');
  }

}

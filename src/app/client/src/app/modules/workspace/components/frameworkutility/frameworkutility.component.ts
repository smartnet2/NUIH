import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ResourceService, ConfigService, IUserProfile, IUserData, WindowScrollService, ToasterService } from '@sunbird/shared';
import { UserService } from '@sunbird/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as _ from 'lodash';
import { Angular2Csv } from 'angular2-csv';
import { BatchService } from './../../services/batch/batch.service';

// import { ProfileService } from '../../../services';

@Component({
  selector: 'app-frameworkutility',
  templateUrl: './frameworkutility.component.html',
  styleUrls: ['./frameworkutility.component.css']
})
export class FrameworkUtiliyComponent implements OnInit {
  publishFramework: any;
  fileSelected: boolean;
  rootOrghashId: any;
  frameworkName: any;
  frameworkId: any;
  uploadedFile: string;
  /**
  * Reference of formgroup
  */
  frameworkForm: FormGroup;



  public excelFile: any;
  /**
 * reference of config service.
 */
  public config: ConfigService;

  public batchService: BatchService;

    /**
   * To show messages
   */
  public toasterService: ToasterService;
  /**
  * Reference of User Profile interface
  */
  userProfile: IUserProfile;

  showLoader: Boolean = false;
  constructor(private fb: FormBuilder, public resourceService: ResourceService, public userService: UserService,
    batchService: BatchService, config: ConfigService,  toasterService: ToasterService) {
    this.batchService = batchService;
    this.config = config;
    this.toasterService = toasterService;
  }
  /**
  * Invokes user service to fetch user profile data
  * It also creates instance of FOrmGroup
  */
  ngOnInit() {
    this.userService.userData$.subscribe(
      (user: IUserData) => {
        if (user && !user.err) {
          this.userProfile = user.userProfile;
        }
      });
    this.userProfile = this.userService.userProfile;
    this.fileSelected = false;
    console.log('hashtagid', this.userProfile.rootOrgId);
    this.frameworkForm = new FormGroup({
      frameworkname: new FormControl('', [Validators.required]),
      frameworkId: new FormControl('', [Validators.required]),
      rootOrghashId: new FormControl(this.userProfile.rootOrgId, [Validators.required]),
      xlfile: new FormControl()
    });
  }
  public downloadSample() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true
    };
    const csv = new Angular2Csv(this.config.appConfig.ADMIN_UPLOAD.SAMPLE_FRAMEWORK_CSV, 'Sample_framework', options);
  }

  fileEvent(event) {
    this.excelFile = event.target.files[0];
    this.fileSelected = true;
  }

  createFramework(publishFramework) {
    this.showLoader = true;
    console.log('inside createFramework, frameworkform value============>', this.frameworkForm.value.frameworkId);
    if (this.excelFile !== undefined) {
      this.fileSelected = true;
    }
    console.log('inside createFramework fileselected============>');
    this.frameworkId = this.frameworkForm.value.frameworkId;
    this.frameworkName = this.frameworkForm.value.frameworkname;
    this.rootOrghashId = this.frameworkForm.value.rootOrghashId;
    this.publishFramework = publishFramework ? publishFramework : '';

     this.batchService.uploadFile(this.excelFile,  this.frameworkId, this.frameworkName, this.rootOrghashId, 
      this.publishFramework ).subscribe(
       (res: any) => {
        if (res && res.responseCode === 'OK') {
          this.showLoader = false;
         console.log('res========', res);
         const msg = 'Framework created successfully ' + res.result;
         this.toasterService.success(msg);
        }
      },
      (err: any) => {
        this.showLoader = false;
       console.log('Error===>', err);
       this.toasterService.error(err.error.params.errmsg);
      });
  }
}



import { Component, OnInit } from '@angular/core';
import { CourseDiscussService } from '../../services/course-discuss/course-discuss.service';
import { DiscussionService } from '../../services/discussions/discussions.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { combineLatest, Subscription, Subject } from 'rxjs';
import { takeUntil, first, mergeMap, map } from 'rxjs/operators';
import { CourseConsumptionService, CourseBatchService } from '../../../learn/services'

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit {

  private activatedRouteSubscription: Subscription;
  // private activatedRoute: ActivatedRoute;
  
  private discussionService: DiscussionService;
  public batchId: string;
  discussionThread: any = [];
  replyContent: any;
  repliesContent: any;
  threadId: any;


  public editor;
  public editorContent: any;
  public uploadedFile: any;
  public editorOptions = {
    placeholder: "insert content..."
  };

  constructor(
    discussionService: DiscussionService, private activatedRoute: ActivatedRoute,
    public courseDiscussionsService: CourseDiscussService, private courseConsumptionService: CourseConsumptionService, public courseBatchService: CourseBatchService) {
    this.discussionService = discussionService;
   }

  ngOnInit() {
       
    this.activatedRouteSubscription = this.activatedRoute.params.pipe(first(),
    mergeMap((params) => {
      this.batchId = params.batchId;
      console.log("Inside discussion Player" + this.batchId)
      if (this.batchId) {
        return combineLatest(
          this.courseConsumptionService.getCourseHierarchy(params.courseId),
          this.courseBatchService.getEnrolledBatchDetails(this.batchId),
        ).pipe(map(results => ({ courseHierarchy: results[0], enrolledBatchDetails: results[1] })));
      } 
    })).subscribe((response: any) => {
    });

  }
  postComment() {
    let req = {
      "title": "Discussion for batch" + "-" + this.batchId,
      "body": "Discussion for batch",
      "contextId": this.batchId,
    }
    this.courseDiscussionsService.postDiscussion(req).subscribe((res: any) => {
      this.retreiveThread(this.batchId)
      this.editorContent = '';
    })
  }
  startNewConversionClick() {
    this.postComment();
  }
  getReplies(id) {
    this.courseDiscussionsService.getReplies(id).subscribe((res: any) => {
      this.repliesContent = res.result.thread.replies;
      console.log("res", this.repliesContent)
    })
  }
  parseBody(body){
    if(body.includes('</a>')) {
      return true
    } else {
      return false
    }
  }
  retreiveThread(id) {
    this.courseDiscussionsService.retrieveDiscussion(id).subscribe((res: any) => {
      this.discussionThread = res.result.threads;
      if (this.discussionThread.length !== 0) {
        this.threadId = this.discussionThread[0].id;
        this.getReplies(this.discussionThread[0].id)
      }
    })
  }
  collapse(i, id) {
    this.discussionThread[i].show = !this.discussionThread[i].show
      this.getReplies(id)
  }
  cancel(i) {
    this.discussionThread[i].replyEditor = !this.discussionThread[i].replyEditor;
  }
  postCancel() {
    this.editorContent = '';
  }
  reply(i) {
    this.discussionThread[i].replyEditor = !this.discussionThread[i].replyEditor;
  }
  replyToThread(id) {
    let body = {
      "body": this.uploadedFile +'  ' +this.editorContent,
      "threadId": this.threadId
    }
    this.courseDiscussionsService.replyToThread(body).subscribe((res) => {
      this.editorContent = ''
      this.retreiveThread(this.batchId)
      this.getReplies(this.threadId)
    })
  }
  isDisabled() {
    if (this.editorContent && this.editorContent !== '' && this.editorContent.length >= 15) {
      return false;
    } else {
      return true
    }
  }
  likePostClick(id, value) {
    let body = {};
    if (value) {
      body = {
        "request": {
          "postId": id.toString(),
          "value": "up"
        }
      }
    } else {
      body = {
        "request": {
          "postId": id.toString(),
          "value": "down"
        }
      }
    }
    this.courseDiscussionsService.likeReply(body).subscribe((res) => {
      this.editorContent = ''
      this.retreiveThread(this.batchId)
      this.getReplies(this.threadId)
    })
  }

  fileEvent(event) {
    const file = event.target.files[0];
    this.courseDiscussionsService.uploadFile(file).subscribe((res: any) => {
      if(res && res.result.response) {
        let url = res.result.response.url;
        let fileName = res.result.response.original_filename
        this.uploadedFile = '<a class="attachment" href=' + url +'>'+fileName+'</a>'
        console.log("uploadedFile",this.uploadedFile)
      }
    })
    // this.challengeService.batchUpload(file).subscribe((result: any) => {
    //   if (this.utils.validatorMessage(result, KRONOS.MESSAGES.FILE_UPLOAD_SUCCESSFULLY)) {
    //     this.getAllUsersByOrg();
    //   }
    // });
  }

  
}

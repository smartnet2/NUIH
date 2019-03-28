import { Component, OnInit } from '@angular/core';
import { CourseDiscussService } from '../../services/course-discuss/course-discuss.service';
import { DiscussionService } from '../../services/discussions/discussions.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { combineLatest, Subscription, Subject } from 'rxjs';
import { takeUntil, first, mergeMap, map } from 'rxjs/operators';
import { CourseConsumptionService, CourseBatchService } from '../../../learn/services'
import * as _ from 'lodash';
@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit {
  // #NUIH change:
  public nestedComments: any = [];
  public discussionComments: any;
  public postBtnText: string = "Post";
  // public options: Object = {
  //   placeholderText: 'Type here...',
  //   charCounterCount: true,
  //   heightMin: 200,
  //   quickInsertTags: null,
  //   toolbarButtons: ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo', 'alert'],
  //   toolbarButtonsXS: ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo', 'alert'],
  //   toolbarButtonsSM: ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo', 'alert'],
  //   toolbarButtonsMD: ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo', 'alert']
  // };
  // #NUIH change:
  private activatedRouteSubscription: Subscription;
  // private activatedRoute: ActivatedRoute;

  private discussionService: DiscussionService;
  public batchId: string;
  public replyPostNumber: number = null;
  discussionThread: any = [];
  replyContent: any;
  repliesContent: any;
  threadId: any;


  public editor;
  public editorContent: any;
  public editorContentForModal: any;
  public uploadedFile: any;
  public toolbarOptions = [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link']
  ];
  public editorOptions = {
    placeholder: 'Type here...',
    modules: {
      toolbar: this.toolbarOptions
    }
  };

  constructor(
    discussionService: DiscussionService, private activatedRoute: ActivatedRoute,
    public courseDiscussionsService: CourseDiscussService, private courseConsumptionService: CourseConsumptionService,
    public courseBatchService: CourseBatchService) {
    this.discussionService = discussionService;
  }

  ngOnInit() {
    const batchIdentifier: string = this.activatedRoute.snapshot.queryParamMap.get('batchIdentifier');
    if (batchIdentifier) {
      this.batchId = batchIdentifier;
      this.courseDiscussionsService.retrieveDiscussion(this.batchId).subscribe((res: any) => {
        console.log('retirve', res, this.batchId);
        this.discussionThread = res.result.threads;
      });
    }

    this.activatedRoute.params.subscribe((params) => {
      this.batchId = params.batchId ? params.batchId : batchIdentifier;
      console.log('Inside discussion Player' + this.batchId);
      if (this.batchId) {
        this.courseDiscussionsService.retrieveDiscussion(this.batchId).subscribe((res: any) => {
          console.log('retirve', res, this.batchId);
          this.discussionThread = res.result.threads;
          this.threadId = this.discussionThread['0'].id;
        });
      }
    });
    // #NUIH change:
    $(function () {
      $("#emoticons-1").on('click', function () {
        $(".fr-popup").find("p").hide();
      })
    });
    this.courseDiscussionsService.getJSON().subscribe((response: any) => {
      this.discussionComments = response.posts;
    });
    // #NUIH change:
  }
  postComment() {
    const req = {
      'title': 'Discussion for batch' + '-' + this.batchId,
      'body': 'Discussion for batch',
      'contextId': this.batchId,
    };
    this.courseDiscussionsService.postDiscussion(req).subscribe((res: any) => {
      this.retreiveThread(this.batchId);
      this.editorContent = '';
    });
  }
  startNewConversionClick() {
    this.postComment();
  }
  getReplies(id) {
    this.courseDiscussionsService.getReplies(id).subscribe((res: any) => {
      this.repliesContent = res.result.thread.replies;
      $(function () {
        $(".emoji").hide();
      });
      console.log("New Response");
      console.log('res', this.repliesContent);
    });
  }
  parseBody(body) {
    if (body.includes('</a>')) {
      return true;
    } else {
      return false;
    }
  }
  retreiveThread(id) {
    this.courseDiscussionsService.retrieveDiscussion(id).subscribe((res: any) => {
      this.discussionThread = res.result.threads;
      if (this.discussionThread.length !== 0) {
        this.threadId = this.discussionThread['0'].id;
        this.getReplies(this.threadId);
      }
    });
  }
  collapse(i, id) {
    this.discussionThread[i].show = !this.discussionThread[i].show;
    this.getReplies(id);
  }
  cancel(i) {
    this.discussionThread[i].replyEditor = !this.discussionThread[i].replyEditor;
  }
  postCancel() {
    this.editorContent = '';
    this.editorContentForModal = '';
    this.replyPostNumber = null;
    this.postBtnText = "Post";
  }
  reply(i) {
    this.discussionThread[i].replyEditor = !this.discussionThread[i].replyEditor;
  }
  getPostNumber(postNumber) {
    this.postBtnText = "Reply";
    let scrollingElement = (document.scrollingElement || document.body);
    this.replyPostNumber = postNumber;
    $(scrollingElement).animate({
      scrollTop: document.body.scrollHeight
    }, 700);
    console.log("Post Number");
    console.log(this.replyPostNumber);
  }
  viewMoreComments(postNumber) {
    this.nestedComments = _.filter(_.cloneDeep(this.discussionComments), { post_number: postNumber });
    this.postCancel();
    console.log("Nested Comments");
    console.log(this.nestedComments);
  }
  replyToThreadFromModal() {

  }
  replyToThread() {
    const body = {
      'body': this.uploadedFile ? this.editorContent + this.uploadedFile + '  ' : '' + this.editorContent,
      'threadId': this.threadId,
      'replyPostNumber': this.replyPostNumber
    };
    this.courseDiscussionsService.replyToThread(body).subscribe((res) => {
      this.editorContent = '';
      this.replyPostNumber = null;
      this.postBtnText = "Post";
      this.retreiveThread(this.batchId);
      this.getReplies(this.threadId);
    });
  }
  isDisabled() {
    if (this.editorContent && this.editorContent !== '' && this.editorContent.length >= 15) {
      return false;
    } else {
      return true;
    }
  }
  likePostClick(id, value) {
    let body = {};
    if (value) {
      body = {
        'request': {
          'postId': id.toString(),
          'value': 'up'
        }
      };
    } else {
      body = {
        'request': {
          'postId': id.toString(),
          'value': 'down'
        }
      };
    }
    this.courseDiscussionsService.likeReply(body).subscribe((res) => {
      this.editorContent = '';
      this.retreiveThread(this.batchId);
      this.getReplies(this.threadId);
    });
  }

  fileEvent(event) {
    const file = event.target.files[0];
    this.courseDiscussionsService.uploadFile(file).subscribe((res: any) => {
      if (res && res.result.response) {
        const url = res.result.response.url;
        const fileName = res.result.response.original_filename;
        this.uploadedFile = '<a class="attachment" href=' + url + '>' + fileName + '</a>';
        console.log('uploadedFile', this.uploadedFile);
      }
    });
    // this.challengeService.batchUpload(file).subscribe((result: any) => {
    //   if (this.utils.validatorMessage(result, KRONOS.MESSAGES.FILE_UPLOAD_SUCCESSFULLY)) {
    //     this.getAllUsersByOrg();
    //   }
    // });
  }
}
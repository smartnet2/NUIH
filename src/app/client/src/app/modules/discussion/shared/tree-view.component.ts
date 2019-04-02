import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { TreeView } from './tree-view.directory';
@Component({
    selector: 'tree-view-menu',
    template: '<tree-view [replyList]="replyList" (getPostNumberfromDirective)="getPostNumberfromDirective($event)"></tree-view>',
})
export class TreeViewComponent implements OnChanges {
    @Input() replyList: any;
    @Output() getPostNumberfromTree = new EventEmitter();
    constructor() {
    }
    ngOnInit() {
    }
    ngOnChanges() { }
    getPostNumberfromDirective(postNumber) {
        this.getPostNumberfromTree.emit(postNumber);
    }
}
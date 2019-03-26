import { Component, Input } from '@angular/core';
import { TreeView } from './tree-view.directory';
@Component({
    selector: 'tree-view-menu',
    template: '<tree-view [replyList]="replyList"></tree-view>',
})
export class TreeViewComponent {
    public roleName: string;
    @Input() replyList: any;
    constructor() {
    }
    ngOnInit() {
    }
}
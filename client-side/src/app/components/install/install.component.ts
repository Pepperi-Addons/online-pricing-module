import { OpmData } from './../../../../../shared/entities';
import { AddonService } from './../addon/addon.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { TranslateService } from '@ngx-translate/core';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

@Component({
  selector: 'addon-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {

  @Input() hostObject: any;
  @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
  @Output() installEvent = new EventEmitter<string>();

  atdID: number;
  atdUUID: string;

  constructor(
    private translate: TranslateService,
    private dialogService: PepDialogService,
    private addonService: AddonService
  ) { }

  ngOnInit(): void {
    this.atdUUID = this.hostObject.objectList[0];
    this.addonService.getAtdId(this.atdUUID).then(typeID => {
      this.atdID = typeID;
    });
  }

  install(){
    this.addonService.installOpm(this.atdID)
    .then(()=> {
      this.installEvent.emit('true');
    }).catch(()=>{ 
      this.installEvent.emit('false');
    });     
  }

  goBack(){
    return;
  }

  onInstall($event){
    this.dialogService.openDefaultDialog(new PepDialogData({
      title: this.translate.instant('Install_Confirmation_Dialog_Title'),
      actionsType: 'custom',
      content: this.translate.instant('Install_Confirmation_Dialog_Content'),
      actionButtons: [
        {
          title: this.translate.instant('Cancel'),
          className: 'regular',
          callback: () => {
              this.goBack();
          }
        },
        {
          title: this.translate.instant('Ok'),
          className: 'strong',
          callback: () => {
            this.install();
          }
        }
      ]
    }))
  }
}

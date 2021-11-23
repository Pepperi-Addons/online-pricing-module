import { AddonService } from './../addon/addon.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";

@Component({
  selector: 'addon-opm-config',
  templateUrl: './opm-config.component.html',
  styleUrls: ['./opm-config.component.scss']
})
export class OpmConfigComponent implements OnInit {

  @Input() hostObject: any;
  @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
  @Output() installEvent = new EventEmitter<string>();
  
  atdID: number;
  atdUUID: string;

  constructor(
    private translate: TranslateService,
    private dialogService: PepDialogService,
    public addonService: AddonService
  ) { }

  ngOnInit(): void {
    this.atdUUID = this.hostObject.objectList[0];
    this.addonService.getAtdId(this.atdUUID).then(typeID => {
      this.atdID = typeID;
      this.addonService.loadOpmDestinationFields(this.atdID); 
    });
  }

  uninstall(){
    this.addonService.uninstallOpm(this.atdID)
    .then(()=> {
      this.installEvent.emit('false');
    }).catch(()=>{ 
      this.installEvent.emit('true');
    });
  }

  goBack(){
    return;
  }

  saveOpmData(){
    this.addonService.saveOpmData();
    // validate opm data and save
  }
  onUninstall($event){
    this.dialogService.openDefaultDialog(new PepDialogData({
      title: 'Uninstall',
      actionsType: 'custom',
      content: this.translate.instant('Uninstall_confirmation'),
      actionButtons: [
        {
          title: this.translate.instant('cancel'),
          className: 'regular',
          callback: () => {
              this.goBack();
          }
        },
        {
          title: this.translate.instant('ok'),
          className: 'strong',
          callback: () => {
            this.uninstall();
          }
        }
      ]
    }))
  }
}

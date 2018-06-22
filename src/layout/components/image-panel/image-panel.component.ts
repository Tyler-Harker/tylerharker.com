import { Component, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';


@Component({
  selector: 'th-image-panel',
  templateUrl: './image-panel.component.html',
  styleUrls: ['./image-panel.component.scss']
})
export class ImagePanelComponent {
  private _src = "/assets/rfg.jpeg";
  @Input()
  set src(src: string){
    this._src = src;
  }

  get src(){
    return `url("${this._src}")`;
  }
}

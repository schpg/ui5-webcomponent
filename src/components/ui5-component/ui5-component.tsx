import {Component, Event, EventEmitter, h, Listen, Prop} from '@stencil/core';
declare var sap: any;

@Component({
  tag: 'ui5-component'
})
export class Ui5Component {

  @Prop() componentName: string;
  @Prop() componentUrl: string;
  @Event() ui5Message: EventEmitter;
  @Event() loadingError: EventEmitter;
  private container: any;
  private ui5EventBus: any;

  initUi5Script() {
    const ui5Script = document.createElement('script');
    ui5Script.setAttribute('id','sap-ui-bootstrap');
    ui5Script.setAttribute('src', 'https://openui5.hana.ondemand.com/resources/sap-ui-core.js');
    ui5Script.setAttribute('data-sap-ui-libs', '');
    ui5Script.setAttribute('data-sap-ui-libs', 'sap.m');
    ui5Script.setAttribute('data-sap-ui-async', 'true');
    ui5Script.setAttribute('data-sap-ui-theme', 'sap_fiori_3');
    ui5Script.onload = this.initUi5ComponentContainer.bind(this);
    document.body.append(ui5Script);
  }

  private loadComponent() {
    try {
      const component = sap.ui.getCore().createComponent(this.componentName, this.componentUrl);
      this.container.setComponent(component);
    } catch (error) {
      this.loadingError.emit(error);
    }
  }

  @Listen('messageToUi5')
  messageReceived(data: any) {
    if (this.ui5EventBus) {
      this.ui5EventBus.publish('UI5Component', 'hostToUi5', data);
    }
  }

  private initUi5ComponentContainer() {
    const oCore = sap.ui.getCore();
    this.ui5EventBus = oCore.getEventBus();
    oCore.attachInit(() => {
      this.container = new sap.ui.core.ComponentContainer({
        width: '100%',
        height: '100%'
      });
      this.container.placeAt(document.getElementById('ui5content'));
      this.ui5EventBus.subscribe('UI5Component', 'ui5ToHost', (_channel, _eventId, data) => {
        this.ui5Message.emit(data);
      });
      this.loadComponent();
    });
  }

  componentDidLoad() {
    this.initUi5Script();
  }

  componentDidUpdate() {
    this.loadComponent();
  }

  render() {
    return (
      <div id="ui5content"></div>
    );
  }

}

import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { Strings } from '../modules/strings';
import { MessageHandler } from '../components/message.handler';
import * as PriorityService from 'priority-web-sdk';
import { ProcService } from './proc.service';
import { FormService } from './form.service';
class Providers
{
    priorityService = PriorityService;
    strings: Strings = new Strings();
    messageHandler: MessageHandler = new MessageHandler(this.strings);
    storageService: StorageService = new StorageService();
    appService: AppService = new AppService(this.storageService);
    configService: ConfigService = new ConfigService(this.appService, this.storageService, this.priorityService, this.strings)
    procService: ProcService = new ProcService(this.messageHandler, this.priorityService, this.strings);
    formService: FormService = new FormService(this.messageHandler, this.priorityService, this.strings,this.procService);
}
export default new Providers();
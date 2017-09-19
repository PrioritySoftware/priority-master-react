import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { Strings } from '../modules/strings';
import {MessageHandler} from '../components/message.handler';
import * as PriorityService from 'priority-web-sdk';
export class RootService
{
    appService: AppService;
    configService: ConfigService;
    storageService: StorageService;
    messageHandler:MessageHandler;
    priorityService;
    strings: Strings;

    constructor()
    {
        this.priorityService=PriorityService;
        this.strings = new Strings();
        this.messageHandler=new MessageHandler(this);
        this.storageService = new StorageService(this);
        this.appService = new AppService(this);
        this.configService = new ConfigService(this);
      
    }
}
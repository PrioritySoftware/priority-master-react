
import React from 'react';
import { MessageHandler } from './message.handler';
import { ProgressBarHandler } from './progressbar.handler';

export var Messages: MessageHandler = null;
export var Progress: ProgressBarHandler = null;

export var Handlers =
    [
        <MessageHandler key='messageHandler' onRef={ref => Messages = ref} />,
        <ProgressBarHandler key='progressHandler' onRef={ref => Progress = ref} />,
    ]


import
{
    Linking,

} from 'react-native';
import { Strings } from '../modules';
import { Proc } from "../modules/proc.class";
import { ProcStepType } from "../modules/procStepType.class";
import { ServerResponseType } from "../modules/srvResponseType.class";
import { ProfileConfig } from "../modules/profileConfig.class";
import { Messages as MessageHandler, Progress as ProgressBarHandler } from "../handlers/index";

export class ProcService
{

    constructor(private priorityService, private strings: Strings)
    { }
    /*
    * Starts a procedure with the given name.
    * @param {string} name 
    * @param {string} type 
    * @param {ProfileConfig} profileConfig 
    * 
    * @memberOf ProcService
    */
    startProcedure(name: string, type: string, profileConfig: ProfileConfig): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.priorityService.procStart(name, type, this.procProgress, profileConfig)
                .then(data =>
                {
                    return this.procSuccess(data);
                })
                .then((data) =>
                {
                    resolve();
                })
                .catch(reason => 
                {
                    reason = reason ? reason.text : this.strings.procedureNotSupported;
                    this.errorHandling(reason, reject);
                });
        });
    }
    /**
     * Handles errors.
     * 
     * @param {Proc} proc 
     * @param {any} error 
     * 
     * @memberOf ProcService
     */
    errorHandling(reason: string, reject)
    {
        MessageHandler.showErrorOrWarning(true, reason);
        reject();
    }

    /**
     * A callback that is used when the procedure is executing for a long time. 
     * Presents a popup with a progress-bar in it.
     * 
     * @memberOf ProcService
     */
    procProgress = (proc: Proc, progress: number) =>
    {
        MessageHandler.hideLoading();

        if (ProgressBarHandler.isPresented())
            ProgressBarHandler.updateProgressVal(progress);
        else
        {
            ProgressBarHandler.showProgress(this.strings.wait,
                () =>
                {
                    proc.cancel().then(() =>
                    {
                        ProgressBarHandler.hideProgress();
                    });
                });
        }

    }
    /**
     * Called wen the procedure returns from the server after it succeeded.
     * Used to analyze the response and decide what to do next.
     * @param data 
     */
    procSuccess(data): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            if (ProgressBarHandler.isPresented())
                ProgressBarHandler.hideProgress();
            switch (data.type)
            {
                case ProcStepType.InputFields:
                    {
                        // Will be replaced with the corresponding step. 
                        this.procCancel(data)
                            .then(() => reject())
                            .catch(reason => reject());
                    }
                    break;
                case ProcStepType.InputOptions:
                    {
                        // Will be replaced with the corresponding step. 
                        this.procCancel(data)
                            .then(() => reject())
                            .catch(reason => reject());
                    }
                    break;
                case ProcStepType.InputHelp:
                    {
                        // Will be replaced with the corresponding step. 
                        this.procCancel(data)
                            .then(() => reject())
                            .catch(reason => reject());
                    }
                    break;
                case ProcStepType.Message:
                    {
                        this.procMessageStep(data)
                            .then(() => resolve())
                            .catch(reason => reject(reason));
                    }
                    break;
                case ProcStepType.ReportOptions:
                    {
                        // Will be replaced with the corresponding step. 
                        this.procCancel(data)
                            .then(() => reject())
                            .catch(reason => reject());
                    }
                    break;
                case ProcStepType.DocumentOptions:
                    {
                        this.procDocOptionsStep(data)
                            .then(() => resolve())
                            .catch(reason => reject(reason));
                    }
                    break;
                case ProcStepType.DisplayUrl:
                    {
                        this.procDisplayStep(data)
                            .then(() => resolve())
                            .catch(reason => reject(reason));
                    }
                    break;
                case ProcStepType.End:
                    {
                        resolve();
                    }
                    break;
                default:
                    {
                        this.procCancel(data)
                            .then(() => reject())
                            .catch(reason => reject());
                    }
            }
        });
    }

    /**
     * Cancels a running procedure.
     * @param {any} data 
     * @returns {Promise<any>} 
     * 
     * @memberof ProcService
     */
    procCancel(data): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            data.proc.cancel()
                .then(() => resolve())
                .catch(reason => reject(reason));
        });
    }

    /**
     * Called when the procedure is executing a message step.
     * @param data 
     */
    procMessageStep(data): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            let onApprove = () =>
            {
                data.proc.message(1)
                    .then(result => this.procSuccess(result))
                    .then(() => resolve())
                    .catch(reason => reject(reason));
            };
            let onCancel = () =>
            {
                data.proc.message(0)
                    .then(result => this.procSuccess(result))
                    .then(() => resolve())
                    .catch(reason => reject(reason));
            };
            let isError = data.messageType !== ServerResponseType.Warning;
            MessageHandler.showErrorOrWarning(isError, data.message, onApprove, onCancel);
        });
    }
    /**
     * Called when the procedure is executing a displayUrl step. The url is of a report ready to be presented.
     * @param {any} data 
     * @returns {Promise<any>} 
     * 
     * @memberOf ProcService
     */
    procDisplayStep(data): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            for (let urlObj of data.Urls)
            {
                Linking.openURL(encodeURI(urlObj.url));
            }
            data.proc.continueProc()
                .then(result => this.procSuccess(result))
                .then(() => resolve())
                .catch(reason => reject(reason));
        });
    }
    procDocOptionsStep(data)
    {
        return new Promise((resolve, reject) =>
        {
            data.proc.documentOptions(1, 1, 2)
                .then(result => this.procSuccess(result))
                .then(() => resolve())
                .catch(reason => reject(reason));
        });
    }
}
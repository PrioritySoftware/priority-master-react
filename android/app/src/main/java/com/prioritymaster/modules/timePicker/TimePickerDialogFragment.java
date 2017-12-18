/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.prioritymaster.modules.timepicker;

import android.app.Dialog;
import android.app.DialogFragment;
import android.app.TimePickerDialog;
import android.app.TimePickerDialog.OnTimeSetListener;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnDismissListener;
import android.os.Build;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.view.View;
import android.widget.Button;
import android.widget.TimePicker;

import java.util.Calendar;
import java.util.Locale;

import javax.annotation.Nullable;

@SuppressWarnings("ValidFragment")
public class TimePickerDialogFragment extends DialogFragment {

  @Nullable
  private OnTimeSetListener mOnTimeSetListener;
  @Nullable
  private OnDismissListener mOnDismissListener;

  @Override
  public Dialog onCreateDialog(Bundle savedInstanceState) {
    final Bundle args = getArguments();
    return createDialog(args, getActivity(), mOnTimeSetListener);
  }

  /*package*/ static Dialog createDialog(
      Bundle args, Context activityContext, @Nullable OnTimeSetListener onTimeSetListener
  ) {
    final Calendar now = Calendar.getInstance();
    int hour = now.get(Calendar.HOUR_OF_DAY);
    int minute = now.get(Calendar.MINUTE);
    boolean is24hour = DateFormat.is24HourFormat(activityContext);

    TimePickerMode mode = TimePickerMode.DEFAULT;
    if (args != null && args.getString(TimePickerDialogModule.ARG_MODE, null) != null) {
      mode = TimePickerMode.valueOf(args.getString(TimePickerDialogModule.ARG_MODE).toUpperCase(Locale.US));
    }

    if (args != null) {
      hour = args.getInt(TimePickerDialogModule.ARG_HOUR, now.get(Calendar.HOUR_OF_DAY));
      minute = args.getInt(TimePickerDialogModule.ARG_MINUTE, now.get(Calendar.MINUTE));
      is24hour = args.getBoolean(
          TimePickerDialogModule.ARG_IS24HOUR,
          DateFormat.is24HourFormat(activityContext));
    }
    TimePickerDialog dialog=null;

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      if (mode == TimePickerMode.CLOCK) {
        dialog = new DismissableTimePickerDialog(
          activityContext,
          activityContext.getResources().getIdentifier(
            "ClockTimePickerDialog",
            "style",
            activityContext.getPackageName()
          ),
          onTimeSetListener,
          hour,
          minute,
          is24hour
        );
      } else if (mode == TimePickerMode.SPINNER) {
        dialog = new DismissableTimePickerDialog(
          activityContext,
          activityContext.getResources().getIdentifier(
            "SpinnerTimePickerDialog",
            "style",
            activityContext.getPackageName()
          ),
          onTimeSetListener,
          hour,
          minute,
          is24hour
        );
      }
    }
    dialog = new DismissableTimePickerDialog(
            activityContext,
            onTimeSetListener,
            hour,
            minute,
            is24hour
    );

    final OnTimeSetListener innerOnTimeSetListener = onTimeSetListener;
    final TimePickerDialog innerDialog = dialog;

    dialog.setButton(DialogInterface.BUTTON_NEUTRAL, "CLEAR", new DialogInterface.OnClickListener() {
      @Override
      public void onClick(DialogInterface dialogInterface, int i) {
      }
  });
  dialog.setOnShowListener(new DialogInterface.OnShowListener() {
    @Override
    public void onShow(DialogInterface dialog) {
        Button button = ((DismissableTimePickerDialog) dialog).getButton(DialogInterface.BUTTON_NEUTRAL);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //datePicker.updateDate(year, month, day);
                innerOnTimeSetListener.onTimeSet(null,0,0);
                innerDialog.dismiss();
            }
        });
    }
});
    return dialog;
  }

  @Override
  public void onDismiss(DialogInterface dialog) {
    super.onDismiss(dialog);
    if (mOnDismissListener != null) {
      mOnDismissListener.onDismiss(dialog);
    }
  }

  public void setOnDismissListener(@Nullable OnDismissListener onDismissListener) {
    mOnDismissListener = onDismissListener;
  }

  public void setOnTimeSetListener(@Nullable OnTimeSetListener onTimeSetListener) {
    mOnTimeSetListener = onTimeSetListener;
  }
}
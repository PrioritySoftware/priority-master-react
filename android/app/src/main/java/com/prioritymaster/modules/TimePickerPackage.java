package com.prioritymaster.modules;

import com.prioritymaster.modules.timepicker.TimePickerDialogModule;
import com.facebook.react.LazyReactPackage;
import com.facebook.react.bridge.ModuleSpec;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.Arrays;
import java.util.List;
import javax.inject.Provider;

/**
 * Created by Administrator on 2017/9/15.
 */

public class TimePickerPackage extends LazyReactPackage {
    @Override
    public List<ModuleSpec> getNativeModules(final ReactApplicationContext reactContext) {
        return Arrays.asList(new ModuleSpec(TimePickerDialogModule.class, new Provider<NativeModule>() {
            @Override
            public NativeModule get() {
                return new TimePickerDialogModule(reactContext);
            }
        }));
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return null;
    }
}
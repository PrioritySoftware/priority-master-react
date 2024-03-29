package com.priority_software.template;

import android.app.Application;
import com.priority_software.template.modules.DatePickerPackage;
import com.priority_software.template.modules.TimePickerPackage;
import com.facebook.react.ReactApplication;
import com.imagepicker.ImagePickerPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.mehcode.reactnative.splashscreen.SplashScreenPackage;
import com.horcrux.svg.SvgPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.rnfs.RNFSPackage;
import java.util.Arrays;
import java.util.List;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.facebook.react.modules.i18nmanager.I18nUtil;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ImagePickerPackage(),
            new ReactNativeDocumentPicker(),
            new SplashScreenPackage(),
            new SvgPackage(),
            new RNSpinkitPackage(),
            new ReactNativeLocalizationPackage(),
            new VectorIconsPackage(),
            new RCTCameraPackage(),
            new DatePickerPackage(),
            new TimePickerPackage(),
            new RNFSPackage()
      );
    }
    // @Override
    // protected String getJSMainModuleName() {
    //   return "build/index.android";
    // }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
    sharedI18nUtilInstance.allowRTL(getApplicationContext(), false);
    SoLoader.init(this, /* native exopackage */ false);
  }
}

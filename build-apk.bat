@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Kannada Kali - building APK
set "PROJ=%~dp0"
if "%PROJ:~-1%"=="\" set "PROJ=%PROJ:~0,-1%"
set "LOG=%PROJ%\build-log.txt"
set CI=1
set EXPO_NO_TELEMETRY=1

echo ==== Kannada Kali APK build  %date% %time% > "%LOG%"
echo.
echo  Kannada Kali - building the Android APK
echo  This can take 10-30 minutes the first time. Keep this window open.
echo  Full log: %LOG%
echo.

rem ---------- Java (Android Studio's bundled JDK) ----------
set "JAVA_HOME="
for %%D in ("%ProgramFiles%\Android\Android Studio\jbr" "%LOCALAPPDATA%\Programs\Android Studio\jbr" "%ProgramFiles%\Android\Android Studio1\jbr") do (
  if not defined JAVA_HOME if exist "%%~D\bin\java.exe" set "JAVA_HOME=%%~D"
)
if not defined JAVA_HOME (
  for /d %%D in ("%USERPROFILE%\.jdks\*") do if exist "%%D\bin\java.exe" set "JAVA_HOME=%%D"
)
echo JAVA_HOME=%JAVA_HOME%>> "%LOG%"
if not defined JAVA_HOME (
  echo RESULT: FAILED - no Java found. Android Studio JBR not found.>> "%LOG%"
  echo  [X] Could not find Java from Android Studio.
  goto :end
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

rem ---------- Android SDK ----------
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo ANDROID_HOME=%ANDROID_HOME%>> "%LOG%"
if not exist "%ANDROID_HOME%\platforms" (
  echo RESULT: FAILED - Android SDK not found at %ANDROID_HOME%>> "%LOG%"
  echo  [X] Android SDK not found at %ANDROID_HOME%
  goto :end
)
dir /b "%ANDROID_HOME%\platforms" >> "%LOG%" 2>&1
dir /b "%ANDROID_HOME%\ndk" >> "%LOG%" 2>&1

rem ---------- Node.js ----------
where node >nul 2>&1
if errorlevel 1 if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>&1
if errorlevel 1 (
  echo RESULT: FAILED - Node.js is not installed.>> "%LOG%"
  echo  [X] Node.js is not installed. Install the LTS version from https://nodejs.org and run this again.
  goto :end
)
for /f "delims=" %%V in ('node -v') do echo node %%V>> "%LOG%"
"%JAVA_HOME%\bin\java.exe" -version >> "%LOG%" 2>&1

rem ---------- short drive letter (avoids Windows long-path errors) ----------
set "DRV="
for %%L in (K J Q W Z) do (
  if not defined DRV if not exist %%L:\ set "DRV=%%L:"
)
if defined DRV (
  subst !DRV! "%PROJ%"
  set "WORK=!DRV!\"
) else (
  set "WORK=%PROJ%\"
)
echo WORK=%WORK%>> "%LOG%"
pushd "%WORK%"

echo  [1/4] Installing packages (npm install)...
echo ==== npm install >> "%LOG%"
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
if errorlevel 1 ( echo RESULT: FAILED at npm install>> "%LOG%" & echo  [X] npm install failed & goto :cleanup )

echo  [2/4] Generating the Android project (expo prebuild)...
echo ==== expo prebuild >> "%LOG%"
call npx expo prebuild --platform android --no-install >> "%LOG%" 2>&1
if errorlevel 1 ( echo RESULT: FAILED at expo prebuild>> "%LOG%" & echo  [X] expo prebuild failed & goto :cleanup )

set "SDKF=%ANDROID_HOME:\=/%"
> "android\local.properties" echo sdk.dir=%SDKF%

echo  [3/4] Building the APK with Gradle (the long step)...
echo ==== gradle assembleRelease >> "%LOG%"
pushd android
call gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a --no-daemon --console=plain >> "%LOG%" 2>&1
set "GERR=!errorlevel!"
popd
if not "!GERR!"=="0" ( echo RESULT: FAILED at gradle>> "%LOG%" & echo  [X] Gradle build failed - see build-log.txt & goto :cleanup )

echo  [4/4] Copying the APK...
copy /y "android\app\build\outputs\apk\release\app-release.apk" "%PROJ%\KannadaKali.apk" >> "%LOG%" 2>&1
if errorlevel 1 ( echo RESULT: FAILED copying apk>> "%LOG%" & echo  [X] APK not found & goto :cleanup )
echo RESULT: SUCCESS %PROJ%\KannadaKali.apk>> "%LOG%"
echo.
echo  [OK] Done!  APK saved as: %PROJ%\KannadaKali.apk

:cleanup
popd
if defined DRV subst %DRV% /d

:end
echo ==== finished %date% %time%>> "%LOG%"
echo.
echo  You can close this window.
pause
